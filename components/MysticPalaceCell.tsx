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
      className={clsx('sihua-badge', overlay && 'is-overlay', onClick && 'is-clickable')}
      data-sihua={siHua}
      onClick={onClick}
    >
      {overlay && label && <span className="sihua-overlay-label">{label}</span>}
      {siHua}
    </span>
  );
};

export default function MysticPalaceCell({
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
      className={clsx(
        'palace-cell mystic-palace-cell relative flex flex-col cursor-pointer',
        isCurrentDaXian && 'is-current-daxian',
        isSelected && 'is-selected',
        isSanFang && 'is-sanfang',
        isMingGong && 'is-ming',
        isShenGong && 'is-shen',
      )}
      style={{ minHeight: '128px' }}
      aria-current={isSelected ? 'true' : undefined}
    >
      {/* 大限年龄 */}
      {daXianAge && (
        <div className={clsx(
          'mystic-palace-age absolute top-1 right-1',
          isCurrentDaXian && 'is-current',
        )}>
          {daXianAge[0]}–{daXianAge[1]}
        </div>
      )}

      {/* 宫名行 */}
      <div className="palace-cell-name mystic-palace-name flex items-center mb-0.5">
        <span>{name}</span>
        {isMingGong && <i className="mystic-palace-seal is-ming-seal">命</i>}
        {isShenGong && <i className="mystic-palace-seal is-shen-seal">身</i>}
      </div>

      {/* 干支 */}
      <div className="mystic-palace-ganzhi mb-1">{ganzhi}</div>

      {/* 主星 */}
      <div className="flex flex-col gap-0.5 flex-1">
        {majorStars.length === 0 && (
          <span className="mystic-empty-star">空宫</span>
        )}
        {majorStars.map((star) => {
          const overlaySiHua = overlayStarSiHua?.[star.name];
          return (
            <div
              key={star.name}
              className="palace-major-row flex items-center"
              onClick={e => { e.stopPropagation(); onStarClick?.(star); }}
            >
              <span className={clsx('palace-major-star', `is-${star.brightness || 'normal'}`)}>
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
              <span key={s.name} className="mystic-lucky-star inline-flex items-center leading-tight">
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
            <span key={s.name} className="mystic-sha-star leading-tight">
              {s.name}{s.siHua && <SiHuaBadge siHua={s.siHua} />}
            </span>
          ))}
        </div>
      )}

    </motion.div>
  );
}
