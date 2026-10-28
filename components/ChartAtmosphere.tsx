export default function ChartAtmosphere() {
  return (
    <>
      <div className="mystic-backdrop-photo" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet="/images/mystic-armillary-mobile.jpg" />
          <img
            src="/images/mystic-armillary-desktop.jpg"
            alt=""
            loading="eager"
            decoding="async"
          />
        </picture>
        <span className="mystic-backdrop-veil" />
      </div>
      <div className="mystic-atmosphere" aria-hidden="true">
        <svg viewBox="0 0 1600 1100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="mystic-halo" cx="50%" cy="38%" r="58%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="58%" stopColor="currentColor" stopOpacity="0.025" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <pattern id="mystic-stars" width="260" height="220" patternUnits="userSpaceOnUse">
            <circle cx="24" cy="32" r="1" fill="currentColor" opacity="0.35" />
            <circle cx="91" cy="146" r="0.8" fill="currentColor" opacity="0.22" />
            <circle cx="178" cy="61" r="1.4" fill="currentColor" opacity="0.4" />
            <circle cx="226" cy="190" r="0.7" fill="currentColor" opacity="0.24" />
            <circle cx="142" cy="207" r="0.8" fill="currentColor" opacity="0.18" />
          </pattern>
        </defs>
        <rect width="1600" height="1100" fill="url(#mystic-stars)" />
        <rect width="1600" height="1100" fill="url(#mystic-halo)" />
        <g className="mystic-sky-rings">
          <circle cx="800" cy="438" r="308" />
          <circle cx="800" cy="438" r="390" />
          <circle cx="800" cy="438" r="520" />
          <path d="M800 104v668M466 438h668" />
          <path d="M567 205 1033 671M1033 205 567 671" />
        </g>
        <g className="mystic-sky-constellation">
          <path d="M114 216 168 178 221 210 265 154 338 187" />
          <path d="M1288 182 1334 236 1402 207 1462 285" />
          <path d="M196 754 256 718 306 770 390 735" />
          <path d="M1218 780 1282 724 1366 766 1438 706" />
          <circle cx="114" cy="216" r="2.5" />
          <circle cx="168" cy="178" r="1.8" />
          <circle cx="221" cy="210" r="2.1" />
          <circle cx="265" cy="154" r="1.6" />
          <circle cx="338" cy="187" r="2.4" />
          <circle cx="1288" cy="182" r="2" />
          <circle cx="1334" cy="236" r="2.4" />
          <circle cx="1402" cy="207" r="1.7" />
          <circle cx="1462" cy="285" r="2.5" />
        </g>
        <g className="mystic-sky-clouds">
          <path d="M-80 846c116-58 194-15 274-47 91-37 150-1 229 17 93 21 190-39 306-14 123 27 238 79 371 47 109-26 225-15 330 32 100 45 186 15 274-16" />
          <path d="M-90 882c133-53 212-5 301-39 96-36 160 4 251 25 95 22 187-34 289-8 143 35 241 78 360 49 135-33 243-6 344 27 87 29 161 9 236-10" />
          <path d="M-40 164c101-52 185-30 268-6 74 21 144-19 221-29 83-11 163 35 255 13 98-23 190-17 284 16" />
        </g>
      </svg>
        <span className="mystic-atmosphere-glow" />
        <span className="mystic-atmosphere-grain" />
      </div>
    </>
  );
}
