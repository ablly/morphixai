import { NextResponse } from 'next/server';
import { AdminService } from '@/lib/admin/service';
import { createAdminClient } from '@/lib/supabase/server';
import * as fal from "@fal-ai/serverless-client";

// Configure Fal.ai
fal.config({
  credentials: process.env.FAL_KEY,
});

/**
 * 同步处理中的生成任务状态
 * 与 fal.ai API 核对，确保数据库状态准确
 */
export async function POST() {
  try {
    // 验证管理员权限
    await AdminService.requireAdmin();
    
    const supabase = await createAdminClient();
    
    // 获取所有处理中的任务
    const { data: processingTasks, error } = await supabase
      .from('generations')
      .select('id, fal_request_id, status, created_at, metadata')
      .in('status', ['PROCESSING', 'PENDING'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch processing tasks: ${error.message}`);
    }

    if (!processingTasks || processingTasks.length === 0) {
      return NextResponse.json({ 
        message: 'No processing tasks to sync',
        synced: 0,
        updated: 0,
      });
    }

    console.log(`[Sync] Found ${processingTasks.length} processing tasks`);

    let synced = 0;
    let updated = 0;
    const results: Array<{ id: string; oldStatus: string; newStatus: string; error?: string }> = [];

    for (const task of processingTasks) {
      if (!task.fal_request_id) {
        // 没有 fal_request_id 的任务，检查是否超时（超过 10 分钟）
        const createdAt = new Date(task.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
        
        if (diffMinutes > 10) {
          // 标记为失败
          await supabase
            .from('generations')
            .update({ 
              status: 'FAILED',
              metadata: { 
                ...(task.metadata as object || {}), 
                sync_error: 'No fal_request_id and timeout exceeded' 
              }
            })
            .eq('id', task.id);
          
          results.push({ 
            id: task.id, 
            oldStatus: task.status, 
            newStatus: 'FAILED',
            error: 'Timeout without request ID'
          });
          updated++;
        }
        continue;
      }

      synced++;

      try {
        // 从 metadata 获取 endpoint
        const metadata = task.metadata as Record<string, unknown> || {};
        const endpoint = (metadata.endpoint as string) || 'fal-ai/sam-3/3d-objects';
        
        // 查询 fal.ai 任务状态
        const falStatus = await fal.queue.status(endpoint, {
          requestId: task.fal_request_id,
          logs: true,
        });

        console.log(`[Sync] Task ${task.id} fal status:`, falStatus.status);

        if (falStatus.status === 'COMPLETED') {
          // 获取结果
          const result = await fal.queue.result(endpoint, {
            requestId: task.fal_request_id,
          });

          // 提取模型 URL
          const resultData = result as Record<string, unknown>;
          const modelUrl = (resultData?.model_mesh as any)?.url || 
                          (resultData?.mesh as any)?.url ||
                          (resultData?.output as any)?.model_url;

          await supabase
            .from('generations')
            .update({
              status: 'COMPLETED',
              model_url: modelUrl,
              completed_at: new Date().toISOString(),
              metadata: { ...metadata, fal_result: result, synced_at: new Date().toISOString() }
            })
            .eq('id', task.id);

          results.push({ id: task.id, oldStatus: task.status, newStatus: 'COMPLETED' });
          updated++;

        } else if (falStatus.status === 'IN_QUEUE' || falStatus.status === 'IN_PROGRESS') {
          // 仍在处理中，检查是否超时（超过 30 分钟）
          const createdAt = new Date(task.created_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
          
          if (diffMinutes > 30) {
            await supabase
              .from('generations')
              .update({
                status: 'FAILED',
                metadata: { ...metadata, sync_error: 'Timeout exceeded (30 min)', synced_at: new Date().toISOString() }
              })
              .eq('id', task.id);

            results.push({ 
              id: task.id, 
              oldStatus: task.status, 
              newStatus: 'FAILED',
              error: 'Timeout exceeded'
            });
            updated++;
          }
          // 否则保持当前状态，等待完成
        }

      } catch (falError: any) {
        console.error(`[Sync] Failed to check task ${task.id}:`, falError);
        const metadata = task.metadata as Record<string, unknown> || {};
        
        // 如果是 404 错误，说明任务不存在
        if (falError.status === 404) {
          await supabase
            .from('generations')
            .update({
              status: 'FAILED',
              metadata: { ...metadata, sync_error: 'Task not found in fal.ai', synced_at: new Date().toISOString() }
            })
            .eq('id', task.id);

          results.push({ 
            id: task.id, 
            oldStatus: task.status, 
            newStatus: 'FAILED',
            error: 'Task not found'
          });
          updated++;
        }
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      synced,
      updated,
      results,
    });

  } catch (error: any) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: error.message === '未登录' ? 401 : error.message === '无管理员权限' ? 403 : 500 }
    );
  }
}
