'use client';
import { useState } from 'react';
import BirthForm from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import ThemeToggle from '@/components/ThemeToggle';
import { generateChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

/**
 * 命盘页 —— 开源版「排盘引擎 Demo」
 *
 * 这是一个最小可运行示例：用本仓库的排盘引擎 generateChart() 配合基础 UI
 * 组件，渲染一张完整紫微命盘 + 基础解读，并支持本命 / 大限 / 流年切换。
 *
 * 说明：线上商业版的完整交互界面（重设计的新 UI、AI 流式解读、合盘、分享
 * 卡片等）不在开源范围内；但排盘内核——安星算法、四化、格局识别、古籍库——
 * 完全开放（见 lib/ziwei/*），可自由二次开发出你自己的界面。
 */
export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  // ── 未起盘：展示出生信息表单 ──
  if (!chart) {
    return (
      <div className="workspace-page">
        <header className="workspace-header">
          <a href="/" className="workspace-header-link">← 返回首页</a>
          <span className="workspace-header-title">紫微排盘</span>
          <span className="workspace-header-index">01 / NATAL CHART</span>
          <ThemeToggle />
        </header>
        <main className="chart-form-main">
          <div className="chart-form-layout">
            <section className="chart-form-intro">
              <div className="workspace-kicker">01 — 出生信息 / BIRTH DATA</div>
              <h1 className="workspace-title">紫微斗数<br />排盘</h1>
              <p className="workspace-lead">输入出生年月日时，开源排盘引擎即时生成命盘。<br />以精密历法为经，以十四主星为纬，建立你的个人星象坐标。</p>
              <div className="workspace-rule" />
              <p className="workspace-footnote">本页为引擎 Demo，完整商业版界面不在开源范围；排盘内核完全开放。</p>
            </section>
            <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
          </div>
        </main>
      </div>
    );
  }

  // ── 已起盘：命盘 + 解读 ──
  return (
    <div className="workspace-page">
      <header className="workspace-header">
        <a href="/" className="workspace-header-link">← 返回首页</a>
        <span className="workspace-header-title">紫微命盘</span>
        <span className="workspace-header-index">01 / NATAL CHART</span>
        <ThemeToggle />
      </header>
      <main className="chart-result-main">
        <button
          type="button"
          className="chart-reset-button"
          onClick={() => { setChart(null); setSelectedPalace(null); }}
        >
          ← 重新起盘
        </button>

        <div className="chart-result-grid">
          <div className="chart-board-wrap">
            <ChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
          </div>
          <div className="chart-ai-column">
            <InsightPanel chart={chart} selectedPalace={selectedPalace} />
          </div>
        </div>
      </main>
    </div>
  );
}
