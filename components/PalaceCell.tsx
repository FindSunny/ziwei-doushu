'use client';
import { motion } from 'framer-motion';
import type { Palace, Star } from '@/lib/ziwei/types';
import { STEMS, BRANCHES } from '@/lib/ziwei/constants';
import clsx from 'clsx';

interface PalaceCellProps {
  palace: Palace;
  onClick?: () => void;
  onStarClick?: (star: Star) => void;
  isSelected?: boolean;
  isSanFang?: boolean;
  delay?: number;
  /** 叠加四化：星名 → 四化类型（'禄'/'权'/'科'/'忌'） */
  overlayStarSiHua?: Record<string, string>;
  /** 叠加标签：'年'（流年）或 '限'（大限） */
  overlayLabel?: string;
  /** 点击叠加四化 badge 回调 */
  onSiHuaClick?: (starName: string, siHua: string) => void;
}

const SIHUA_STYLES: Record<string, string> = {
  '禄': 'badge-lu',
  '权': 'badge-quan',
  '科': 'badge-ke',
  '忌': 'badge-ji',
};

const SiHuaBadge = ({
  siHua,
  overlay,
  label,
  onClick,
}: {
  siHua: string;
  overlay?: boolean;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <span
      className={clsx(
        'sihua-badge inline-flex items-center px-1 rounded-sm border leading-none py-px font-bold ml-1 flex-shrink-0',
        SIHUA_STYLES[siHua],
        overlay && 'border-dashed opacity-80',
        onClick && 'cursor-pointer hover:opacity-100',
      )}
      onClick={onClick}
    >
      {overlay && label && <span className="mr-px opacity-70">{label}</span>}
      {siHua}
    </span>
  );
};

export default function PalaceCell({
  palace, onClick, onStarClick, isSelected, isSanFang, delay = 0,
  overlayStarSiHua, overlayLabel, onSiHuaClick,
}: PalaceCellProps) {
  const { branch, stem, name, stars, daXianAge, isCurrentDaXian, isMingGong, isShenGong } = palace;
  const ganzhi = `${STEMS[stem]}${BRANCHES[branch]}`;

  const majorStars = stars.filter(s => s.type === 'major');
  const luckyStars = stars.filter(s => s.type === 'lucky');
  const shaStars = stars.filter(s => s.type === 'sha');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      onClick={onClick}
      className="palace-cell relative flex flex-col p-2.5 cursor-pointer transition-all duration-200 h-full"
      style={{
        minHeight: '128px',
        background: isSelected
          ? 'var(--cinnabar-soft)'
          : isSanFang
          ? 'var(--ac-bg)'
          : isCurrentDaXian
          ? 'var(--ac-bg)'
          : 'var(--t-bg)',
        boxShadow: isCurrentDaXian
          ? 'inset 2px 0 0 var(--ac)'
          : isSelected
          ? 'inset 0 0 0 1.5px var(--cinnabar)'
          : isSanFang
          ? 'inset 0 0 0 1px var(--ac-bdr)'
          : isMingGong
          ? 'inset 0 2px 0 var(--cinnabar-border)'
          : 'none',
      }}
    >
      {/* 大限年龄 */}
      {daXianAge && (
        <div
          className="absolute top-1 right-1 text-[11px] font-mono tabular-nums"
          style={{ color: isCurrentDaXian ? 'var(--t-gold)' : 'var(--t-faint)', opacity: isCurrentDaXian ? 1 : 0.75 }}
        >
          {daXianAge[0]}–{daXianAge[1]}
        </div>
      )}

      {/* 宫名行 */}
      <div className="flex items-center gap-1 mb-0.5 pr-8">
        <span
          className="text-[12px] font-medium tracking-wide"
          style={{ color: isMingGong ? 'var(--cinnabar)' : isShenGong ? 'var(--t-gold)' : 'var(--t-faint)' }}
        >
          {name}
        </span>
        {isMingGong && (
          <span className="text-[9px] px-0.5 rounded-sm leading-tight" style={{ color: 'var(--cinnabar)', border: '1px solid var(--cinnabar-border)' }}>命</span>
        )}
        {isShenGong && (
          <span className="text-[9px] px-0.5 rounded-sm leading-tight" style={{ color: 'var(--t-gold)', border: '1px solid var(--ac-bdr)' }}>身</span>
        )}
      </div>

      {/* 干支 */}
      <div className="text-[11px] font-mono mb-1" style={{ color: 'var(--t-faint)', opacity: 0.75 }}>{ganzhi}</div>

      {/* 主星 */}
      <div className="flex flex-col gap-0.5 flex-1">
        {majorStars.length === 0 && (
          <span className="text-[12px] italic" style={{ color: 'var(--t-faint)', opacity: 0.6 }}>空宫</span>
        )}
        {majorStars.map((star) => {
          const overlaySiHua = overlayStarSiHua?.[star.name];
          return (
            <div
              key={star.name}
              className="palace-major-row flex items-center min-w-0"
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span
                className="palace-major-star font-serif text-[16px] leading-tight font-bold tracking-tight cursor-pointer transition-all"
                style={{ color: 'var(--t-text)', opacity: star.brightness === 'dim' ? 0.55 : star.brightness === 'bright' ? 1 : 0.84 }}
              >
                {star.name}
              </span>
              {star.siHua && <SiHuaBadge siHua={star.siHua} />}
              {overlaySiHua && (
                <SiHuaBadge
                  siHua={overlaySiHua}
                  overlay
                  label={overlayLabel}
                  onClick={e => {
                    e.stopPropagation();
                    onSiHuaClick?.(star.name, overlaySiHua);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 吉星 */}
      {luckyStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1 mt-0.5">
          {luckyStars.map(s => {
            const overlaySiHua = overlayStarSiHua?.[s.name];
            return (
              <span key={s.name} className="inline-flex items-center text-[11px] leading-tight" style={{ color: 'var(--t-gold)' }}>
                {s.name}
                {s.siHua && <SiHuaBadge siHua={s.siHua} />}
                {overlaySiHua && (
                  <SiHuaBadge
                    siHua={overlaySiHua}
                    overlay
                    label={overlayLabel}
                    onClick={e => {
                      e.stopPropagation();
                      onSiHuaClick?.(s.name, overlaySiHua);
                    }}
                  />
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* 煞星 */}
      {shaStars.length > 0 && (
        <div className="flex flex-wrap gap-x-1">
          {shaStars.map(s => (
            <span key={s.name} className="text-[11px] leading-tight" style={{ color: 'var(--ji)', opacity: 0.78 }}>
              {s.name}{s.siHua && <SiHuaBadge siHua={s.siHua} />}
            </span>
          ))}
        </div>
      )}

    </motion.div>
  );
}
