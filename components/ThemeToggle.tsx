'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="world-theme-toggle"
      aria-label={isDark ? '切换亮色主题' : '切换暗色主题'}
      aria-pressed={isDark}
    >
      <span className="world-theme-track" aria-hidden="true"><i /></span>
      <span>{isDark ? '暗色' : '亮色'}</span>
    </button>
  );
}
