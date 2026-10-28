const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const STAR_POINTS: [number, number][] = [
  [280, 66], [345, 96], [396, 158], [412, 245], [386, 328], [330, 382],
  [246, 405], [168, 377], [112, 314], [96, 228], [132, 142], [205, 91],
  [210, 260], [286, 306], [330, 242], [242, 186], [176, 236],
];

export default function HomeOrrery() {
  return (
    <div className="mystic-home-orrery" role="img" aria-label="紫微垣星图：十二地支、星曜与天盘刻度">
      <span className="mystic-home-orrery-side is-left" aria-hidden="true">天纪</span>
      <span className="mystic-home-orrery-side is-right" aria-hidden="true">紫垣</span>
      <div className="mystic-home-orrery-dial">
        <svg viewBox="0 0 560 560">
          <g className="mystic-home-orrery-static">
            <circle cx="280" cy="280" r="246" />
            <circle cx="280" cy="280" r="206" />
            <circle cx="280" cy="280" r="152" />
            <circle cx="280" cy="280" r="102" />
            <path d="M280 18v524M18 280h524" />
            <path d="M96 96 464 464M464 96 96 464" />
            <path d="M280 74 458 390 102 390Z" />
            <path d="M280 486 102 170 458 170Z" />
          </g>

          <g className="mystic-home-orrery-ticks">
            {Array.from({ length: 72 }, (_, index) => {
              const angle = index * 5 * Math.PI / 180;
              const major = index % 6 === 0;
              const inner = major ? 228 : 236;
              return (
                <line
                  key={index}
                  x1={(280 + Math.sin(angle) * inner).toFixed(2)}
                  y1={(280 - Math.cos(angle) * inner).toFixed(2)}
                  x2={(280 + Math.sin(angle) * 246).toFixed(2)}
                  y2={(280 - Math.cos(angle) * 246).toFixed(2)}
                  className={major ? 'is-major' : ''}
                />
              );
            })}
          </g>

          <g className="mystic-home-orrery-branches">
            {BRANCHES.map((branch, index) => {
              const angle = index * 30 * Math.PI / 180;
              return (
                <text
                  key={branch}
                  x={(280 + Math.sin(angle) * 182).toFixed(2)}
                  y={(284 - Math.cos(angle) * 182).toFixed(2)}
                  textAnchor="middle"
                >
                  {branch}
                </text>
              );
            })}
          </g>

          <g className="mystic-home-orrery-constellation">
            <path d="M280 66 345 96 396 158 412 245 386 328 330 382 246 405 168 377 112 314 96 228 132 142 205 91 280 66" />
            <path d="M210 260 242 186 330 242 386 328M210 260 176 236 96 228M210 260 286 306 330 382" />
            {STAR_POINTS.map(([x, y], index) => (
              <circle key={index} cx={x} cy={y} r={index % 4 === 0 ? 3.1 : 1.7} className={index % 4 === 0 ? 'is-major' : ''} />
            ))}
          </g>

          <g className="mystic-home-orrery-wanderer">
            <circle cx="280" cy="82" r="9" className="mystic-home-wanderer-halo" />
            <circle cx="280" cy="82" r="3" className="mystic-home-wanderer-dot" />
          </g>

          <g className="mystic-home-orrery-core">
            <circle cx="280" cy="280" r="76" />
            <circle cx="280" cy="280" r="66" />
            <text x="280" y="268" textAnchor="middle" className="mystic-home-core-small">ZI WEI</text>
            <text x="280" y="307" textAnchor="middle" className="mystic-home-core-main">紫微</text>
            <text x="280" y="328" textAnchor="middle" className="mystic-home-core-caption">天枢 · 命垣</text>
          </g>

          <g className="mystic-home-orrery-notes">
            <text x="280" y="41" textAnchor="middle">紫微垣</text>
            <text x="518" y="284" textAnchor="middle">天市</text>
            <text x="280" y="531" textAnchor="middle">太微</text>
            <text x="42" y="284" textAnchor="middle">二十八宿</text>
          </g>
        </svg>
      </div>
      <div className="mystic-home-orrery-caption">
        <div><span>十二宫位</span><strong>人生坐标</strong></div>
        <i aria-hidden="true" />
        <div><span>十四主星</span><strong>星曜成象</strong></div>
        <i aria-hidden="true" />
        <div><span>四化流年</span><strong>气机流转</strong></div>
      </div>
    </div>
  );
}
