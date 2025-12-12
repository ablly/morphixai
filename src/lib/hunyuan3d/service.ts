/**
 * 腾讯混元生3D (Hunyuan 3D) API Service
 * 
 * 官方文档: https://cloud.tencent.com/document/product/1804
 * 产品页面: https://cloud.tencent.com/product/ai3d
 * 
 * 定价 (积分制):
 * - 按量后付费: ¥0.12/积分 (~$0.017)
 * - 资源包预付费: ¥0.09-0.10/积分
 * 
 * 资源包:
 * - 新用户专享: 免费100积分
 * - 1000积分包: ¥100 (¥0.10/积分)
 * - 10000积分包: ¥980 (¥0.098/积分)
 * - 100000积分包: ¥9000 (¥0.09/积分)
 * 
 * 输出格式: GLB, FBX, OBJ
 */

import crypto from 'crypto';

const TENCENT_API_HOST = 'hunyuan.tencentcloudapi.com';
const SERVICE = 'hunyuan';
const VERSION = '2023-09-01';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 质量等级
export type QualityLevel = 'standard' | 'high';

// 输出格式
export type OutputFormat = 'glb' | 'fbx' | 'obj';

// 风格
export type ModelStyle = 'realistic' | 'cartoon' | 'lowpoly';

// 任务状态
export type TaskStatus = 'queued' | 'processing' | 'success' | 'failed';

// 生成配置
export interface GenerationConfig {
  quality?: QualityLevel;
  format?: OutputFormat;
  textureResolution?: number;
  style?: ModelStyle;
  negativePrompt?: string;
}


// 任务结果
export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  progress?: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// API 错误类型
export class Hunyuan3DError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'Hunyuan3DError';
  }
}

// 签名工具函数
function sha256(message: string): string {
  return crypto.createHash('sha256').update(message).digest('hex');
}

function hmacSha256(key: Buffer, message: string): Buffer {
  return crypto.createHmac('sha256', key).update(message).digest();
}

function getDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
}

// TC3-HMAC-SHA256 签名
function sign(
  secretId: string,
  secretKey: string,
  action: string,
  payload: string,
  timestamp: number
): string {
  const date = getDate(timestamp);
  
  // 1. 拼接规范请求串
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = 
    `content-type:application/json; charset=utf-8\n` +
    `host:${TENCENT_API_HOST}\n` +
    `x-tc-action:${action.toLowerCase()}\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedRequestPayload = sha256(payload);
  
  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join('\n');

  // 2. 拼接待签名字符串
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/${SERVICE}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);
  
  const stringToSign = [
    algorithm,
    timestamp,
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  // 3. 计算签名
  const secretDate = hmacSha256(Buffer.from(`TC3${secretKey}`), date);
  const secretService = hmacSha256(secretDate, SERVICE);
  const secretSigning = hmacSha256(secretService, 'tc3_request');
  const signature = crypto
    .createHmac('sha256', secretSigning)
    .update(stringToSign)
    .digest('hex');

  // 4. 拼接 Authorization
  return `${algorithm} ` +
    `Credential=${secretId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;
}


class Hunyuan3DService {
  private secretId: string;
  private secretKey: string;
  private region: string;
  private isConfigured: boolean;

  constructor() {
    this.secretId = process.env.TENCENT_SECRET_ID || '';
    this.secretKey = process.env.TENCENT_SECRET_KEY || '';
    this.region = process.env.TENCENT_REGION || 'ap-guangzhou';
    this.isConfigured = !!(this.secretId && this.secretKey);
  }

  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * 调用腾讯云 API
   */
  private async request(
    action: string, 
    payload: object, 
    retries = MAX_RETRIES
  ): Promise<any> {
    if (!this.isConfigured) {
      throw new Hunyuan3DError(
        'Tencent credentials not configured', 
        'NOT_CONFIGURED', 
        500, 
        false
      );
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const timestamp = Math.floor(Date.now() / 1000);
        const payloadStr = JSON.stringify(payload);
        const authorization = sign(
          this.secretId,
          this.secretKey,
          action,
          payloadStr,
          timestamp
        );

        const response = await fetch(`https://${TENCENT_API_HOST}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Host': TENCENT_API_HOST,
            'X-TC-Action': action,
            'X-TC-Version': VERSION,
            'X-TC-Timestamp': timestamp.toString(),
            'X-TC-Region': this.region,
            'Authorization': authorization,
          },
          body: payloadStr,
        });

        const data = await response.json();

        if (data.Response?.Error) {
          const error = data.Response.Error;
          const isRetryable = 
            error.Code === 'InternalError' || 
            error.Code === 'RequestLimitExceeded';
          
          throw new Hunyuan3DError(
            error.Message,
            error.Code,
            response.status,
            isRetryable
          );
        }

        return data.Response;
      } catch (error: any) {
        lastError = error;
        
        if (error instanceof Hunyuan3DError && !error.retryable) {
          throw error;
        }

        if (attempt < retries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, RETRY_DELAY * (attempt + 1))
          );
          console.log(`Hunyuan3D API retry attempt ${attempt + 2}/${retries}`);
        }
      }
    }

    throw lastError || new Hunyuan3DError(
      'Request failed after retries', 
      'MAX_RETRIES', 
      500, 
      false
    );
  }

  /**
   * 图片转3D
   * 成本: 标准 ¥0.5 (~$0.07) / 高清 ¥1.0 (~$0.14)
   */
  async imageToModel(
    imageUrl: string, 
    options: GenerationConfig = {}
  ): Promise<TaskResult> {
    const data = await this.request('ImageTo3D', {
      ImageUrl: imageUrl,
      Quality: options.quality || 'standard',
      Format: options.format || 'glb',
      TextureResolution: options.textureResolution || 1024,
    });

    return {
      taskId: data.TaskId,
      status: 'queued',
    };
  }

  /**
   * 文字转3D
   * 成本: 标准 ¥0.5 (~$0.07) / 高清 ¥1.0 (~$0.14)
   */
  async textToModel(
    prompt: string, 
    options: GenerationConfig = {}
  ): Promise<TaskResult> {
    const data = await this.request('TextTo3D', {
      Prompt: prompt,
      NegativePrompt: options.negativePrompt,
      Quality: options.quality || 'standard',
      Format: options.format || 'glb',
      Style: options.style || 'realistic',
    });

    return {
      taskId: data.TaskId,
      status: 'queued',
    };
  }

  /**
   * 多视角转3D
   * 成本: ¥1.0/次 (~$0.14)
   */
  async multiviewToModel(
    imageUrls: string[], 
    options: GenerationConfig = {}
  ): Promise<TaskResult> {
    if (imageUrls.length < 2 || imageUrls.length > 6) {
      throw new Hunyuan3DError(
        'Multi-view requires 2-6 images', 
        'INVALID_INPUT', 
        400, 
        false
      );
    }

    const data = await this.request('MultiviewTo3D', {
      ImageUrls: imageUrls,
      Quality: options.quality || 'standard',
      Format: options.format || 'glb',
    });

    return {
      taskId: data.TaskId,
      status: 'queued',
    };
  }


  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskResult> {
    const data = await this.request('QueryTask', { TaskId: taskId });

    return {
      taskId: taskId,
      status: this.mapStatus(data.Status),
      progress: data.Progress,
      modelUrl: data.ModelUrl,
      thumbnailUrl: data.ThumbnailUrl,
      error: data.ErrorMessage,
    };
  }

  /**
   * 等待任务完成
   */
  async waitForCompletion(
    taskId: string, 
    maxWaitMs = 300000
  ): Promise<TaskResult> {
    const startTime = Date.now();
    const pollInterval = 3000;

    while (Date.now() - startTime < maxWaitMs) {
      const result = await this.getTaskStatus(taskId);
      
      if (result.status === 'success' || result.status === 'failed') {
        return result;
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Hunyuan3DError('Task timeout', 'TIMEOUT', 408, false);
  }

  /**
   * 映射状态
   */
  private mapStatus(status: string): TaskStatus {
    const statusMap: Record<string, TaskStatus> = {
      'QUEUED': 'queued',
      'PROCESSING': 'processing',
      'SUCCESS': 'success',
      'FAILED': 'failed',
    };
    return statusMap[status] || 'queued';
  }
}

// 导出单例
export const hunyuan3d = new Hunyuan3DService();

// 便捷函数
export const imageToModel = (imageUrl: string, options?: GenerationConfig) => 
  hunyuan3d.imageToModel(imageUrl, options);

export const textToModel = (prompt: string, options?: GenerationConfig) => 
  hunyuan3d.textToModel(prompt, options);

export const multiviewToModel = (imageUrls: string[], options?: GenerationConfig) => 
  hunyuan3d.multiviewToModel(imageUrls, options);

export const getTaskStatus = (taskId: string) => 
  hunyuan3d.getTaskStatus(taskId);

export const waitForCompletion = (taskId: string, maxWaitMs?: number) => 
  hunyuan3d.waitForCompletion(taskId, maxWaitMs);

export const isHunyuanConfigured = () => hunyuan3d.isReady();
