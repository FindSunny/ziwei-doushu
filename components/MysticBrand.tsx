'use client';

import { useTheme } from './ThemeProvider';

export function MysticBrand() {
  return (
    <span className="mystic-brand">
      <span className="mystic-brand-seal" aria-hidden="true">紫</span>
      <span className="mystic-brand-copy">
        <strong>紫微垣</strong>
        <small>ZIWEI ORRERY</small>
      </span>
    </span>
  );
}

export function MysticThemeButton() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      className="mystic-icon-button"
      onClick={toggle}
      aria-label={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
      title={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}
    >
      {theme === 'dark' ? '昼' : '夜'}
    </button>
  );
}
