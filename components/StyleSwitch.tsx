'use client';
import { usePathname, useRouter } from 'next/navigation';

const MYSTIC_TARGETS: Record<string, string> = {
  '/': '/mystic',
  '/chart': '/mystic/chart',
  '/heming': '/mystic/heming',
};

const CLASSIC_TARGETS: Record<string, string> = {
  '/mystic': '/',
  '/mystic/chart': '/chart',
  '/mystic/heming': '/heming',
};

export default function StyleSwitch({ current }: { current: 'classic' | 'mystic' }) {
  const router = useRouter();
  const pathname = usePathname();
  const target = current === 'classic'
    ? MYSTIC_TARGETS[pathname] || '/mystic'
    : CLASSIC_TARGETS[pathname] || '/';
  const switchTo = (next: 'classic' | 'mystic') => {
    if (next === current) return;
    router.push(next === 'mystic' ? target : CLASSIC_TARGETS[pathname] || '/');
  };

  return (
    <div className="style-switch" role="group" aria-label="界面样式">
      <button
        type="button"
        className={current === 'classic' ? 'is-active' : undefined}
        aria-pressed={current === 'classic'}
        onClick={() => switchTo('classic')}
      >
        经典
      </button>
      <button
        type="button"
        className={current === 'mystic' ? 'is-active' : undefined}
        aria-pressed={current === 'mystic'}
        onClick={() => switchTo('mystic')}
      >
        紫微垣
      </button>
    </div>
  );
}
