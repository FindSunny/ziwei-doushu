import type { Metadata } from 'next';
import './mystic.css';

export const metadata: Metadata = {
  title: '紫微垣 · 紫微斗数',
  robots: { index: false, follow: true },
};

export default function MysticLayout({ children }: { children: React.ReactNode }) {
  return children;
}
