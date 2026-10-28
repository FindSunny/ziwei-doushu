import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const remarkPlugins = [remarkGfm];

interface AiContentProps {
  text: string;
  streaming?: boolean;
  compact?: boolean;
  variant?: 'mystic';
}

export default function AiContent({ text, streaming, compact = false, variant }: AiContentProps) {
  const sizeClass = variant === 'mystic'
    ? (compact ? 'text-[13px] leading-[1.8]' : 'text-[14px] leading-[1.8]')
    : (compact ? 'text-[12px] leading-[1.75]' : 'text-[13px] leading-[1.75]');

  return (
    <div
      className={sizeClass}
      style={{ color: 'var(--t-text2, var(--tx-2))' }}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        components={{
          h1: ({ children }) => <h1 className="mt-4 mb-2 text-[16px] font-semibold first:mt-0" style={{ color: 'var(--t-gold, var(--ac))' }}>{children}</h1>,
          h2: ({ children }) => <h2 className="mt-4 mb-2 text-[14px] font-semibold first:mt-0" style={{ color: 'var(--t-gold, var(--ac))' }}>{children}</h2>,
          h3: ({ children }) => <h3 className="mt-3 mb-1.5 text-[12px] font-semibold first:mt-0" style={{ color: 'var(--t-gold, var(--ac))' }}>{children}</h3>,
          h4: ({ children }) => <h4 className="mt-3 mb-1 text-[11px] font-semibold first:mt-0" style={{ color: 'var(--t-gold, var(--ac))' }}>{children}</h4>,
          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--t-text, var(--tx-0))' }}>{children}</strong>,
          ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          blockquote: ({ children }) => <blockquote className="my-2 border-l-2 pl-3" style={{ borderColor: 'var(--t-gold, var(--ac))' }}>{children}</blockquote>,
          a: ({ children, href }) => <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2" style={{ color: 'var(--t-gold, var(--ac))' }}>{children}</a>,
          code: ({ children }) => <code className="rounded px-1 py-0.5 font-mono text-[0.9em]" style={{ background: 'var(--t-card, var(--bg-1))', color: 'var(--t-text, var(--tx-0))' }}>{children}</code>,
          pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-lg p-3" style={{ background: 'var(--t-card, var(--bg-1))' }}>{children}</pre>,
          table: ({ children }) => <table className="my-3 block w-full overflow-x-auto border-collapse whitespace-nowrap">{children}</table>,
          th: ({ children }) => <th className="border px-2 py-1 text-left font-semibold" style={{ borderColor: 'var(--t-border, var(--bdr-med))', color: 'var(--t-text, var(--tx-0))' }}>{children}</th>,
          td: ({ children }) => <td className="border px-2 py-1" style={{ borderColor: 'var(--t-border, var(--bdr-med))' }}>{children}</td>,
          hr: () => <hr className="my-4" style={{ borderColor: 'var(--t-border, var(--bdr-med))' }} />,
        }}
      >
        {text}
      </ReactMarkdown>
      {streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold, var(--ac))', opacity: 0.6 }}
        />
      )}
    </div>
  );
}
