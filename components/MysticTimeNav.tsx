'use client';
import { motion } from 'framer-motion';
import { STEMS, SI_HUA_TABLE } from '@/lib/ziwei/constants';
import type { ZiweiChart } from '@/lib/ziwei/types';

export type TimeView = 'mingpan' | 'daxian' | 'liunian';

interface TimeNavProps {
  chart: ZiweiChart;
  view: TimeView;
  liunianYear: number;
  onViewChange: (view: TimeView) => void;
  onYearChange: (year: number) => void;
}

/** 由年份计算天干索引 (0-9) */
export function getYearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

/** 根据天干索引返回四化映射：starName → SiHua */
export function buildSiHuaOverlay(stemIndex: number): Record<string, string> {
  const stars = SI_HUA_TABLE[stemIndex];
  if (!stars) return {};
  return {
    [stars[0]]: '禄',
    [stars[1]]: '权',
    [stars[2]]: '科',
    [stars[3]]: '忌',
  };
}

const SIHUA_COLORS: Record<string, string> = {
  '禄': 'var(--m-lu, #86a889)',
  '权': 'var(--m-quan, #7e9ab7)',
  '科': 'var(--m-ke, #c8a660)',
  '忌': 'var(--m-ji, #b35547)',
};

export default function MysticTimeNav({
  chart,
  view,
  liunianYear,
  onViewChange,
  onYearChange,
}: TimeNavProps) {
  const currentDx = chart.daXians[chart.currentDaXianIndex];

  // 计算当前叠加四化信息
  const getOverlayInfo = (): { stemName: string; overlay: Record<string, string> } | null => {
    if (view === 'mingpan') return null;

    if (view === 'daxian' && currentDx) {
      const dxPalace = chart.palaces.find(p => p.branch === currentDx.palaceBranch);
      if (!dxPalace) return null;
      const stemIndex = dxPalace.stem;
      return {
        stemName: STEMS[stemIndex],
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    if (view === 'liunian') {
      const stemIndex = getYearStemIndex(liunianYear);
      return {
        stemName: STEMS[stemIndex],
        overlay: buildSiHuaOverlay(stemIndex),
      };
    }

    return null;
  };

  const overlayInfo = getOverlayInfo();

  return (
    <div className="time-nav mystic-time-nav mb-3">
      <div className="mystic-time-label" aria-hidden="true">
        <span>运限</span>
        <small>TIME CYCLES</small>
      </div>

      <div className="mystic-time-main">
        <div className="mystic-time-tabs">
          <TabButton active={view === 'mingpan'} onClick={() => onViewChange('mingpan')}>
            本命
          </TabButton>

          <TabButton active={view === 'daxian'} onClick={() => onViewChange('daxian')}>
            {currentDx ? `大限 ${currentDx.startAge}–${currentDx.endAge}` : '大限'}
          </TabButton>

          <div className={`mystic-year-tab${view === 'liunian' ? ' is-active' : ''}`}>
            <button type="button" className="mystic-year-view" onClick={() => onViewChange('liunian')}>
              流年
            </button>
            <span className="mystic-year-divider" aria-hidden="true" />
            <div className="mystic-year-controls">
              <button
                type="button"
                aria-label="查看上一年流年"
                onClick={() => { onYearChange(liunianYear - 1); if (view !== 'liunian') onViewChange('liunian'); }}
              >
                ‹
              </button>
              <button type="button" className="mystic-year-number" onClick={() => onViewChange('liunian')}>
                {liunianYear}
              </button>
              <button
                type="button"
                aria-label="查看下一年流年"
                onClick={() => { onYearChange(liunianYear + 1); if (view !== 'liunian') onViewChange('liunian'); }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {overlayInfo && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mystic-time-overlay"
          >
            <span className="mystic-overlay-lead">
              {view === 'daxian' ? '大限' : liunianYear} · {overlayInfo.stemName}年四化
            </span>
            {(['禄', '权', '科', '忌'] as const).map(sh => {
              const starName = Object.keys(overlayInfo.overlay).find(k => overlayInfo.overlay[k] === sh);
              if (!starName) return null;
              return (
                <span key={sh} className="mystic-overlay-item" data-sihua={sh} style={{ color: SIHUA_COLORS[sh] }}>
                  {starName}化{sh}
                </span>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mystic-time-tab${active ? ' is-active' : ''}`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
