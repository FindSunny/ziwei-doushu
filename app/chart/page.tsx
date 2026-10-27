'use client';

import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  if (!chart) {
    return (
      <main className="chart-entry-page">
        <div className="chart-entry">
          <a className="page-back" href="/">← 返回首页</a>
          <header className="chart-entry-header">
            <span className="eyebrow">Zi Wei · 起盘</span>
            <h1>紫微斗数排盘</h1>
            <p>输入出生年月日时，开源排盘引擎即时生成命盘。<br />（本页为引擎 Demo，完整商业版界面不在开源范围；排盘内核完全开放。）</p>
          </header>
          <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
        </div>
      </main>
    );
  }

  return (
    <main className="chart-result-page">
      <header className="chart-result-header no-print">
        <button type="button" className="page-back" onClick={() => { setChart(null); setSelectedPalace(null); }}>← 重新起盘</button>
        <span className="chart-result-title">紫微斗数命盘</span>
        <span className="chart-result-meta">本命 · 大限 · 流年 / AI 解读</span>
      </header>
      <div className="chart-result-grid">
        <section className="chart-paper" aria-label="十二宫命盘">
          <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
        </section>
        <aside className="chart-ai-column" aria-label="AI 命理解读">
          <InsightPanel chart={chart} selectedPalace={selectedPalace} />
        </aside>
      </div>
    </main>
  );
}
