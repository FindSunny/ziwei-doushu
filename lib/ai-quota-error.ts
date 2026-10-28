export interface AiQuotaExceededInfo {
  message: string;
  contact: string;
  resetAt: string | null;
  limit: number | null;
}

export function parseAiQuotaExceeded(value: unknown): AiQuotaExceededInfo | null {
  if (!value || typeof value !== 'object') return null;
  const payload = value as {
    code?: unknown;
    message?: unknown;
    contact?: unknown;
    resetAt?: unknown;
    limit?: unknown;
  };
  if (payload.code !== 'AI_QUOTA_EXHAUSTED') return null;

  return {
    message: typeof payload.message === 'string' && payload.message.trim()
      ? payload.message.trim()
      : '今日 AI 解读额度已用完',
    contact: typeof payload.contact === 'string' && payload.contact.trim()
      ? payload.contact.trim()
      : '请联系站点管理员补充额度',
    resetAt: typeof payload.resetAt === 'string' && payload.resetAt ? payload.resetAt : null,
    limit: typeof payload.limit === 'number' && Number.isFinite(payload.limit) ? payload.limit : null,
  };
}
