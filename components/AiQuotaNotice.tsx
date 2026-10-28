import type { AiQuotaExceededInfo } from '@/lib/ai-quota-error';

function formatResetTime(resetAt: string | null): string {
  if (!resetAt) return '每日 00:00';
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return '每日 00:00';
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AiQuotaNotice({ info }: { info: AiQuotaExceededInfo }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl px-4 py-4 text-[12px] leading-relaxed"
      style={{
        background: 'var(--ac-bg)',
        border: '1px solid var(--ac-bdr)',
        color: 'var(--t-text2, var(--tx-2))',
      }}
    >
      <div className="mb-2 font-semibold" style={{ color: 'var(--t-gold, var(--ac))' }}>
        {info.message}
      </div>
      <div className="mb-1">
        如需继续使用，请联系管理员补充额外次数。
      </div>
      <div>
        联系方式：
        <strong className="ml-1 font-semibold" style={{ color: 'var(--t-text, var(--tx-0))' }}>
          {info.contact}
        </strong>
      </div>
      <div className="mt-1.5" style={{ color: 'var(--t-faint, var(--tx-3))' }}>
        额度将在 {formatResetTime(info.resetAt)} 自动重置，重置后可刷新页面重试。
      </div>
      <div className="mt-1" style={{ color: 'var(--t-faint, var(--tx-3))' }}>
        AI 内容仅作传统文化参考，不替代专业意见。
      </div>
    </div>
  );
}
