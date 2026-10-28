import { BRANCHES } from '@/lib/ziwei/constants';

const TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

interface ChartCoreProps {
  mingGongBranch: number;
  shenGongBranch: number;
  wuxingJuName: string;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  currentDaXian?: {
    startAge: number;
    endAge: number;
    palaceName: string;
  };
}

export default function ChartCore({
  mingGongBranch,
  shenGongBranch,
  wuxingJuName,
  lunarYear,
  lunarMonth,
  lunarDay,
  isLeapMonth,
  currentDaXian,
}: ChartCoreProps) {
  return (
    <div className="mystic-core">
      <div className="mystic-core-dial" aria-hidden="true">
        <svg viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="108" className="mystic-dial-ring-outer" />
          <circle cx="120" cy="120" r="92" className="mystic-dial-ring" />
          <circle cx="120" cy="120" r="62" className="mystic-dial-ring-muted" />
          {Array.from({ length: 24 }, (_, index) => {
            const angle = index * 15 * Math.PI / 180;
            return (
              <line
                key={index}
                x1={(120 + Math.sin(angle) * 96).toFixed(2)}
                y1={(120 - Math.cos(angle) * 96).toFixed(2)}
                x2={(120 + Math.sin(angle) * 106).toFixed(2)}
                y2={(120 - Math.cos(angle) * 106).toFixed(2)}
                className="mystic-dial-tick"
              />
            );
          })}
          <path d="M120 12 202 207 38 207Z" className="mystic-dial-geometry" />
          <path d="M120 228 38 33 202 33Z" className="mystic-dial-geometry mystic-dial-geometry-reverse" />
        </svg>
        <div className="mystic-core-trigrams">
          {TRIGRAMS.map((trigram, index) => {
            const angle = index * 45 * Math.PI / 180;
            return (
              <span
                key={trigram}
                style={{
                  left: `${(50 + Math.sin(angle) * 39).toFixed(2)}%`,
                  top: `${(50 - Math.cos(angle) * 39).toFixed(2)}%`,
                }}
              >
                {trigram}
              </span>
            );
          })}
        </div>
        <span className="mystic-core-axis">玄枢</span>
      </div>

      <div className="mystic-core-copy">
        <span className="mystic-core-kicker">NATAL PIVOT</span>
        <div className="mystic-core-title">紫微垣</div>
        <div className="mystic-core-locations">
          <span>命宫 <b>{BRANCHES[mingGongBranch]}</b></span>
          <span>身宫 <b>{BRANCHES[shenGongBranch]}</b></span>
          <span>{wuxingJuName}</span>
        </div>
        {currentDaXian && (
          <div className="mystic-core-cycle">
            <span>行至</span>
            <strong>{currentDaXian.startAge}—{currentDaXian.endAge}</strong>
            <small>{currentDaXian.palaceName}</small>
          </div>
        )}
        <div className="mystic-core-date">
          农历 {lunarYear} · {isLeapMonth ? '闰' : ''}{lunarMonth} · {lunarDay}
        </div>
      </div>
    </div>
  );
}
