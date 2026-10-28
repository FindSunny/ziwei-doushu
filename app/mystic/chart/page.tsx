'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm from '@/components/BirthForm';
import ChartAtmosphere from '@/components/ChartAtmosphere';
import MysticChartBoard from '@/components/MysticChartBoard';
import InsightPanel from '@/components/InsightPanel';
import { MysticBrand, MysticThemeButton } from '@/components/MysticBrand';
import StyleSwitch from '@/components/StyleSwitch';
import { generateChart } from '@/lib/ziwei/algorithm';
import { BRANCHES } from '@/lib/ziwei/constants';
import type { BirthInfo, ZiweiChart, Palace } from '@/lib/ziwei/types';

export default function ChartPage() {
  const router = useRouter();
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  if (!chart) {
    return (
      <main className="mystic-chart-page mystic-entry-page">
        <ChartAtmosphere />
        <header className="chart-entry-topbar mystic-topbar">
          <button type="button" className="mystic-brand-button" onClick={() => router.push('/mystic')} aria-label="返回首页">
            <MysticBrand />
          </button>
          <span className="mystic-topbar-separator" aria-hidden="true" />
          <span className="mystic-topbar-note">玄枢星盘 · 本地推演</span>
          <div className="mystic-topbar-spacer" />
          <span className="mystic-topbar-coordinate">天纪 · 紫微斗数</span>
          <StyleSwitch current="mystic" />
          <MysticThemeButton />
        </header>

        <div className="mystic-entry-shell">
          <section className="mystic-entry-copy">
            <div className="mystic-kicker"><span aria-hidden="true" />紫微斗数 · 玄枢星盘</div>
            <h1><span>紫微</span><em>垣</em></h1>
            <p className="mystic-entry-lead">
              十二宫位围合，十四主星列宿。以出生时刻为枢，展开一张属于你的星图。
            </p>
            <div className="mystic-entry-axiom">
              <span>观星</span><i aria-hidden="true" />
              <span>定盘</span><i aria-hidden="true" />
              <span>问心</span>
            </div>
            <ul className="mystic-entry-facts" aria-label="命盘内容">
              <li><strong>十二</strong><span>宫位</span></li>
              <li><strong>十四</strong><span>主星</span></li>
              <li><strong>四化</strong><span>流年</span></li>
            </ul>
            <p className="mystic-entry-note">排盘计算在浏览器本地完成，不依赖外部数据服务。</p>
            <div className="mystic-entry-sigil" aria-hidden="true">
              <span className="mystic-sigil-ring is-one" />
              <span className="mystic-sigil-ring is-two" />
              <span className="mystic-sigil-ring is-three" />
              <span className="mystic-sigil-glyph">命</span>
              <i>子</i><i>午</i><i>卯</i><i>酉</i>
            </div>
          </section>

          <section className="mystic-entry-form" aria-label="输入出生信息">
            <div className="mystic-form-plaque">
              <div className="mystic-form-heading">
                <span>问命</span>
                <small>BIRTH DATA · 01</small>
              </div>
              <BirthForm onSubmit={(info: BirthInfo) => setChart(generateChart(info))} />
              <p className="mystic-form-foot">真太阳时校正 · 子时换日 · 本地排盘</p>
            </div>
          </section>
        </div>

        <footer className="mystic-page-foot">
          倪海厦《天纪》体系 · 传统命理文化研究 · 不作确定性预言
        </footer>
      </main>
    );
  }

  const birth = chart.birthInfo;
  const lunar = chart.lunarInfo;
  const genderLabel = birth.gender === 'male' ? '乾造' : '坤造';

  return (
    <main className="mystic-chart-page mystic-result-page">
      <ChartAtmosphere />
      <header className="chart-topbar mystic-topbar">
        <button type="button" className="mystic-brand-button" onClick={() => router.push('/mystic')} aria-label="返回首页">
          <MysticBrand />
        </button>
        <span className="mystic-topbar-separator" aria-hidden="true" />
        <span className="mystic-topbar-note"><i aria-hidden="true" />星盘已定 · 本地推演</span>
        <div className="mystic-topbar-spacer" />
        <button
          type="button"
          className="mystic-text-button"
          onClick={() => { setChart(null); setSelectedPalace(null); }}
        >
          ← 重新起盘
        </button>
        <StyleSwitch current="mystic" />
        <MysticThemeButton />
      </header>

      <div className="chart-main-shell mystic-result-shell">
        <div className="mystic-result-heading">
          <div>
            <span className="mystic-kicker"><span aria-hidden="true" />玄枢命盘 · NATAL ORRERY</span>
            <h1>{birth.name ? `${birth.name} · ` : ''}本命星盘</h1>
            <p>
              公历 {birth.year}.{String(birth.month).padStart(2, '0')}.{String(birth.day).padStart(2, '0')}
              <span>·</span>{BRANCHES[birth.hour]}时
              <span>·</span>{genderLabel}
              {chart.yinYangGender && <><span>·</span>{chart.yinYangGender}</>}
            </p>
          </div>
          <div className="mystic-result-meta">
            <span>农历 {lunar.lunarYear} · {lunar.isLeapMonth ? '闰' : ''}{lunar.lunarMonth} · {lunar.lunarDay}</span>
            {lunar.fourPillars && <strong>{lunar.fourPillars.join('　')}</strong>}
          </div>
        </div>

        <div className="chart-workbench mystic-workbench">
          <section className="chart-board-panel mystic-board-panel" aria-label="十二宫紫微命盘">
            <MysticChartBoard chart={chart} onPalaceSelect={setSelectedPalace} />
          </section>
          <aside className="chart-ai-panel mystic-oracle-panel" aria-label="AI 命盘解读">
            <InsightPanel chart={chart} selectedPalace={selectedPalace} variant="mystic" />
          </aside>
        </div>

        <footer className="mystic-page-foot">
          命盘为传统文化研究之参照，不替代现实判断与专业意见
        </footer>
      </div>
    </main>
  );
}
