import { createDeepSeekResponse, isChartPayload, type AIChatMessage } from '@/lib/deepseek';

export const runtime = 'nodejs';

function isValidMessage(value: unknown): value is AIChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as { role?: unknown; content?: unknown };
  return (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.trim().length > 0
    && message.content.length <= 12000;
}

export async function POST(request: Request) {
  let body: { chart?: unknown; messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求必须是有效的 JSON' }, { status: 400 });
  }

  if (!isChartPayload(body.chart)) {
    return Response.json({ error: '命盘数据不完整' }, { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0
    || body.messages.length > 30 || !body.messages.every(isValidMessage)) {
    return Response.json({ error: '对话内容为空、格式错误或超出长度限制' }, { status: 400 });
  }

  const system = `你是紫微斗数传统文化研究助手。请根据下面的本地排盘 JSON 和用户问题，用简体中文进行清晰、审慎的解释。

要求：
- 以实际盘面为依据，结合相关宫位、星曜、四化及三方四正，不得声称看到了盘面之外的信息。
- 不编造倪海厦原话、古籍引文或出处；不能确认出处时不要使用直接引语。
- 不作确定性人生预言。健康、法律、投资等内容只作传统文化参考，不替代专业意见。
- 直接回答用户当前问题，保持连续对话上下文，不要重复输出整份 JSON。

本地排盘 JSON：
${JSON.stringify(body.chart)}`;

  return createDeepSeekResponse({
    system,
    messages: body.messages,
    signal: request.signal,
  });
}
