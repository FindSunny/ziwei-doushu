import {
  consumeAiQuota,
  releaseAiQuota,
  type AiQuotaReservation,
  type AiQuotaStatus,
  type ConsumeAiQuotaResult,
} from './ai-quota';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DeepSeekStreamOptions {
  system: string;
  messages: AIChatMessage[];
  signal?: AbortSignal;
}

export function isChartPayload(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const chart = value as { birthInfo?: unknown; palaces?: unknown };
  return !!chart.birthInfo && typeof chart.birthInfo === 'object'
    && Array.isArray(chart.palaces) && chart.palaces.length === 12;
}

function quotaExceededResponse(quota: AiQuotaStatus): Response {
  const retryAfter = Math.max(1, Math.ceil((new Date(quota.resetAt).getTime() - Date.now()) / 1000));
  return Response.json({
    code: 'AI_QUOTA_EXHAUSTED',
    error: '今日 AI 解读额度已用完',
    message: '今日 AI 解读额度已用完',
    contact: quota.contact,
    limit: quota.limit,
    resetAt: quota.resetAt,
  }, {
    status: 429,
    headers: {
      'Cache-Control': 'no-store',
      'Retry-After': String(retryAfter),
    },
  });
}

async function refundQuota(reservation: AiQuotaReservation): Promise<void> {
  try {
    await releaseAiQuota(reservation);
  } catch (error) {
    console.error('AI 额度退还失败:', error);
  }
}

export async function createDeepSeekResponse({
  system,
  messages,
  signal,
}: DeepSeekStreamOptions): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'your-deepseek-api-key') {
    return Response.json({ error: '请先在 .env.local 中配置 DEEPSEEK_API_KEY' }, { status: 503 });
  }

  let quota: ConsumeAiQuotaResult;
  try {
    quota = await consumeAiQuota();
  } catch (error) {
    console.error('AI 额度检查失败:', error);
    return Response.json({
      code: 'AI_QUOTA_UNAVAILABLE',
      error: 'AI 额度服务暂不可用，请稍后重试',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!quota.allowed) return quotaExceededResponse(quota.quota);

  const baseURL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/+$/, '');
  let upstream: Response;
  try {
    upstream = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        messages: [{ role: 'system', content: system }, ...messages],
        stream: true,
        temperature: 0.7,
        max_tokens: 8000,
      }),
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    await refundQuota(quota.reservation);
    console.error('DeepSeek 连接失败:', error);
    return Response.json({ error: '无法连接 DeepSeek，请检查网络后重试' }, { status: 502 });
  }

  if (!upstream.ok) {
    await refundQuota(quota.reservation);
    console.error(`DeepSeek 返回 HTTP ${upstream.status}`);
    await upstream.body?.cancel();
    return Response.json({ error: 'DeepSeek 请求失败，请检查 API Key、账户余额或稍后重试' }, { status: 502 });
  }
  if (!upstream.body) {
    await refundQuota(quota.reservation);
    return Response.json({ error: 'DeepSeek 未返回响应流' }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      reader = upstream.body!.getReader();
      let buffer = '';
      let upstreamDone = false;
      let hasContent = false;
      let finishReason: string | null = null;

      const sendEvent = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // DeepSeek 与前端使用不同的 SSE 数据结构，这里只转发正文增量。
      const processLine = (line: string): boolean => {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) return false;
        const payload = trimmed.slice(5).trimStart();
        if (payload === '[DONE]') return true;
        if (!payload) return false;

        const chunk = JSON.parse(payload) as {
          choices?: {
            delta?: { content?: string };
            finish_reason?: string | null;
          }[];
        };
        const choice = chunk.choices?.[0];
        const content = choice?.delta?.content;
        if (content) {
          hasContent = true;
          sendEvent(JSON.stringify({ delta: { text: content } }));
        }
        finishReason = choice?.finish_reason ?? finishReason;
        return false;
      };

      try {
        while (!upstreamDone && !cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (processLine(line)) {
              upstreamDone = true;
              break;
            }
          }
        }

        if (cancelled) return;
        buffer += decoder.decode();
        if (buffer && !upstreamDone) processLine(buffer);
        if (!hasContent) {
          const reason = finishReason === 'length' ? '输出 token 已耗尽' : '上游未返回正文';
          throw new Error(`DeepSeek ${reason}`);
        }
        sendEvent('[DONE]');
        controller.close();
      } catch (error) {
        if (cancelled) return;
        console.error('DeepSeek 响应流中断:', error);
        controller.error(error);
      }
    },
    async cancel() {
      cancelled = true;
      await reader?.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
