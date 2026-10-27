'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { useTheme } from '@/components/ThemeProvider';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

function Brand() {
  return (
    <span className="forecast-brand">
      <span className="forecast-brand-mark" aria-hidden="true" />
      <span className="forecast-brand-copy">
        <strong>紫微命盘</strong>
        <small>FORECAST CENTER</small>
      </span>
    </span>
  );
}

export default function ChartPage() {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  if (!chart) {
    return (
      <main className="forecast-page">
        <header className="chart-entry-topbar">
          <button type="button" onClick={() => router.push('/')} aria-label="返回首页" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
            <Brand />
          </button>
          <div style={{ flex: 1 }} />
          <span className="forecast-status">本地排盘 · 无需等待</span>
          <button type="button" className="forecast-theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}>
            {theme === 'dark' ? '暗色' : '亮色'}
          </button>
        </header>
        <div className="chart-entry">
          <div className="chart-entry-heading">
            <span className="forecast-eyebrow">Birth data / 01</span>
            <h1>此刻星象，由此展开</h1>
            <p>输入出生年月日时，开源排盘引擎即时生成命盘。所有排盘计算均在浏览器本地完成。</p>
          </div>
          <div className="chart-entry-form">
            <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="forecast-page">
      <header className="chart-topbar">
        <button type="button" onClick={() => router.push('/')} aria-label="返回首页" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
          <Brand />
        </button>
        <div className="chart-topbar-back-sep" />
        <span className="forecast-status">命盘已生成 · 本地数据</span>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="forecast-theme-toggle"
          onClick={() => { setChart(null); setSelectedPalace(null); }}
        >
          ← 重新起盘
        </button>
        <button type="button" className="forecast-theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? '切换亮色主题' : '切换暗色主题'}>
          {theme === 'dark' ? '暗' : '亮'}
        </button>
      </header>

      <div className="chart-main-shell">
        <div className="chart-workbench">
          <section className="chart-board-panel" aria-label="十二宫紫微命盘">
            <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
          </section>
          <aside className="chart-ai-panel" aria-label="AI 命盘解读">
            <InsightPanel chart={chart} selectedPalace={selectedPalace} />
          </aside>
        </div>
      </div>
    </main>
  );
}
