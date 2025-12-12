/**
 * Cloudflare R2 Storage Service
 * 
 * 用于存储用户生成的 3D 模型
 * R2 优势: 零出口费用，S3 兼容 API
 * 
 * 环境变量:
 * - R2_ACCOUNT_ID: Cloudflare 账户 ID
 * - R2_ACCESS_KEY_ID: R2 Access Key
 * - R2_SECRET_ACCESS_KEY: R2 Secret Key
 * - R2_BUCKET_NAME: 存储桶名称
 * - R2_PUBLIC_URL: 公开访问 URL (可选，用于自定义域名)
 */

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface UploadResult {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

class R2Service {
  private config: R2Config | null = null;
  private endpoint: string = '';

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (accountId && accessKeyId && secretAccessKey && bucketName) {
      this.config = {
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicUrl: process.env.R2_PUBLIC_URL,
      };
      this.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * 从 URL 下载文件并上传到 R2
   */
  async uploadFromUrl(sourceUrl: string, key: string): Promise<UploadResult> {
    if (!this.config) {
      return { success: false, error: 'R2 not configured' };
    }

    try {
      // 下载文件
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        return { success: false, error: `Failed to download: ${response.status}` };
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // 上传到 R2
      return await this.upload(Buffer.from(buffer), key, contentType);
    } catch (error: any) {
      console.error('[R2] Upload from URL error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 上传文件到 R2
   */
  async upload(data: Buffer | Uint8Array, key: string, contentType: string): Promise<UploadResult> {
    if (!this.config) {
      return { success: false, error: 'R2 not configured' };
    }

    try {
      const url = `${this.endpoint}/${this.config.bucketName}/${key}`;
      const date = new Date().toUTCString();

      // 创建签名
      const signature = await this.createSignature('PUT', key, contentType, date);

      // Convert to Uint8Array for fetch compatibility
      const uint8Array = data instanceof Uint8Array ? data : new Uint8Array(data);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Date': date,
          'Authorization': `AWS ${this.config.accessKeyId}:${signature}`,
        },
        body: uint8Array as BodyInit,
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, error: `Upload failed: ${response.status} - ${text}` };
      }

      const publicUrl = this.getPublicUrl(key);
      return { success: true, key, url: publicUrl };
    } catch (error: any) {
      console.error('[R2] Upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除文件
   */
  async delete(key: string): Promise<boolean> {
    if (!this.config) return false;

    try {
      const url = `${this.endpoint}/${this.config.bucketName}/${key}`;
      const date = new Date().toUTCString();
      const signature = await this.createSignature('DELETE', key, '', date);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Date': date,
          'Authorization': `AWS ${this.config.accessKeyId}:${signature}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('[R2] Delete error:', error);
      return false;
    }
  }

  /**
   * 获取公开访问 URL
   */
  getPublicUrl(key: string): string {
    if (this.config?.publicUrl) {
      return `${this.config.publicUrl}/${key}`;
    }
    // 如果没有自定义域名，返回 R2 公开 URL
    return `https://pub-${this.config?.accountId}.r2.dev/${key}`;
  }

  /**
   * 生成唯一的存储 key
   */
  generateKey(userId: string, type: 'model' | 'thumbnail' | 'source', ext: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}s/${userId}/${timestamp}-${random}.${ext}`;
  }

  /**
   * 创建 AWS S3 签名 (简化版)
   */
  private async createSignature(method: string, key: string, contentType: string, date: string): Promise<string> {
    if (!this.config) throw new Error('R2 not configured');

    const stringToSign = [
      method,
      '', // Content-MD5
      contentType,
      date,
      `/${this.config.bucketName}/${key}`,
    ].join('\n');

    // 使用 Web Crypto API 创建 HMAC-SHA1 签名
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.config.secretAccessKey);
    const messageData = encoder.encode(stringToSign);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
}

// 导出单例
export const r2 = new R2Service();

// 便捷函数
export const uploadModelToR2 = async (
  sourceUrl: string, 
  userId: string, 
  format: string = 'glb'
): Promise<UploadResult> => {
  const key = r2.generateKey(userId, 'model', format);
  return r2.uploadFromUrl(sourceUrl, key);
};

export const uploadThumbnailToR2 = async (
  sourceUrl: string, 
  userId: string
): Promise<UploadResult> => {
  const key = r2.generateKey(userId, 'thumbnail', 'png');
  return r2.uploadFromUrl(sourceUrl, key);
};

export const isR2Configured = () => r2.isConfigured();
