import { createDeepSeekResponse, isChartPayload } from '@/lib/deepseek';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: { chartA?: unknown; chartB?: unknown; question?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求必须是有效的 JSON' }, { status: 400 });
  }

  if (!isChartPayload(body.chartA) || !isChartPayload(body.chartB)) {
    return Response.json({ error: '双方命盘数据不完整' }, { status: 400 });
  }
  if (body.question !== undefined && (typeof body.question !== 'string' || body.question.length > 2000)) {
    return Response.json({ error: '问题格式错误或超出长度限制' }, { status: 400 });
  }

  const question = typeof body.question === 'string' && body.question.trim()
    ? body.question.trim()
    : '请综合分析双方命盘的性格相处、情感互动、沟通方式与潜在矛盾，并给出审慎的相处建议。';
  const system = `你是紫微斗数传统文化研究助手。请根据双方本地排盘 JSON 进行合盘分析，用简体中文回答。

要求：
- 分别核对双方盘面，再分析互动关系，不得把两人的星曜和宫位混用。
- 不编造倪海厦原话、古籍引文或出处，不断言婚姻结果、忠诚度或关系必然成败。
- 内容仅作传统文化和娱乐参考，不替代双方真实沟通或专业咨询。
- 输出结构清晰，直接回应用户问题。

甲方排盘 JSON：
${JSON.stringify(body.chartA)}

乙方排盘 JSON：
${JSON.stringify(body.chartB)}`;

  return createDeepSeekResponse({
    system,
    messages: [{ role: 'user', content: question }],
    signal: request.signal,
  });
}
