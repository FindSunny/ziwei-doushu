'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import StarField from '@/components/StarField';
import { useTheme, type Theme } from '@/components/ThemeProvider';

// ─── 滚动入场 wrapper ────────────────────────────────────
function FadeIn({
  children, delay = 0, y = 28, className = '',
}: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function WeakBoundary({ line }: { line: string }) {
  // 之前的版本有 1px 实线 + 12px 渐变阴影，主题切换时形成清晰横线很硬。
  // 改为更柔和的 24px 渐变 + 低 opacity，section 衔接更自然。
  return (
    <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none"
      style={{ background: `linear-gradient(to bottom, ${line}, transparent)`, opacity: 0.45 }} />
  );
}

// ─── 主题切换按钮 ────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换亮色主题' : '切换暗色主题'}
      className="forecast-theme-toggle"
    >
      {isDark ? '暗色' : '亮色'}
    </button>
  );
}

// ─── 功能模块 ────────────────────────────────────────────
const FEATURES = [
  {
    tag: '排盘体系',
    title: '倪海厦正宗\n紫微斗数',
    subtitle: '非简化版，严格遵循倪海厦老师传承',
    points: [
      '纳音五行局起盘，不采用网络简化算法',
      '命宫逆数生时、身宫顺数生时，严格对齐教学规则',
      '十四主星与四化飞星按原法推演，结构完整可复核',
    ],
  },
  {
    tag: '命盘呈现',
    title: '完整十四主星\n四化飞星',
    subtitle: '结构清晰，一眼看懂主轴与重点',
    points: [
      '十四主星完整入宫，主星关系清楚可读',
      '辅星与煞星同屏呈现，避免关键信息缺失',
      '庙旺利陷亮度分级，快速识别强弱',
      '点击任意主星即可查看倪海厦老师对该星的详细解读',
    ],
  },
  {
    tag: 'AI 解读',
    title: '深度解盘\n不止于算',
    subtitle: '倪海厦体系知识库 × Claude AI',
    points: [
      '命格分析：从命宫主星出发，结合三方四正，给出全面的性格与人生格局判断',
      '六大维度解读：事业方向、感情婚姻、财运模式、健康注意、家庭关系、子女缘分',
      '大限流年追踪：当前10年大限重点、今年流年宫位的具体提示与行动建议',
      '自由追问：针对你的命盘直接提问，「今年能换工作吗」「什么时候结婚运最好」',
    ],
  },
  {
    tag: '格局识别',
    title: '自动检测\n命盘格局',
    subtitle: '从星曜组合中发现你的命中注定',
    points: [
      '自动识别11种经典格局：紫府同宫、杀破狼格、机月同梁、廉相格、武曲七杀等',
      '辅弼夹命、日月夹命等特殊格局精准检测，并给出倪海厦体系下的标准解读',
      '四化入命宫迁移宫的特殊状况自动标注，提示需关注的人生议题',
      '格局按吉凶等级分层展示，让你一目了然自己命盘中的优势与挑战',
    ],
  },
];

// ─── 4 大学习板块（hero 后时间轴）──────────────────────────
const SECTIONS = [
  {
    key: 'ziwei',
    name: '紫微',
    en: 'Zi Wei',
    desc: '14 主星 · 13 宫位 · AI 解读',
    status: 'ready' as const,
    when: '5 月',
    icon: '◉',  // 实心圆+内点，紫微星视觉
    note: '',
  },
  {
    key: 'tianji',
    name: '天纪',
    en: 'Tian Ji',
    desc: '紫微 · 周易 · 奇门遁甲',
    status: 'soon' as const,
    when: '6 月',
    icon: '⊙',  // 圆+内点（古文"日"），与 ◉ 同字宽
    note: '',
  },
  {
    key: 'diji',
    name: '地纪',
    en: 'Di Ji',
    desc: '倪师未竟之业 · 后辈补注',
    status: 'soon' as const,
    when: '6 月',
    icon: '⊞',  // 方+井（地/田视觉），与 ⊙ 同字宽
    note: '遗稿研读',
  },
  {
    key: 'renji',
    name: '人纪',
    en: 'Ren Ji',
    desc: '内经 · 伤寒 · 金匮 · 针灸',
    status: 'soon' as const,
    when: '7 月',
    icon: '⊕',  // 圆+十字（医道/阴阳调和），与 ⊙/⊞ 同字宽
    note: '',
  },
];

// ─── 倪海厦核心教义 ──────────────────────────────────────
const NI_TEACHINGS = [
  {
    title: '命宫为本，三方为用',
    body: '倪师始终强调，看命必先看命宫。命宫主星决定一个人的基本格局与天生性格，三方（财帛、官禄、迁移）则决定此人的「用武之地」。四宫联动才是完整的人生图景。',
  },
  {
    title: '对宫借星，不可忽视',
    body: '倪师的独到之处在于重视「对宫」。任何宫位若为空宫，必须借对宫星曜来论断，命宫的对面是迁移宫，两者互相影响，这是很多初学者容易忽略的关键。',
  },
  {
    title: '四化才是命运的手',
    body: '星曜只是基础，四化（化禄、化权、化科、化忌）才是决定运势好坏的关键。同一颗星，有化禄与有化忌，人生轨迹可以截然不同。倪师反复强调：不看四化，命盘只解了一半。',
  },
  {
    title: '大限十年，运势有节',
    body: '倪师将人生划分为12个大限，每个大限10年。他认为人在不同的大限宫位，际遇完全不同。了解自己现在走的是哪个大限、该宫位有何星曜，才能真正把握当下的运势。',
  },
];

// ─── 主题色彩 helper ─────────────────────────────────────
function useColors(theme: Theme) {
  const d = theme === 'dark';
  return {
    bgBase:       d ? '#050b14' : '#eef4f7',
    navBg:        d ? 'rgba(5,11,20,0.82)' : 'rgba(238,244,247,0.82)',
    navBorder:    d ? 'rgba(154,202,214,0.13)' : 'rgba(34,71,91,0.13)',
    goldGrad:     d ? 'linear-gradient(115deg,#edf7f7,#78e3ce,#aa91ef)' : 'linear-gradient(115deg,#153646,#087e78,#7257ad)',
    goldSolid:    d ? '#78e3ce' : '#087e78',
    goldLine:     d ? 'rgba(103,223,200,0.3)' : 'rgba(8,126,120,0.26)',
    tagText:      d ? '#82aaaF' : '#587888',
    textPrimary:  d ? '#edf7f7' : '#102432',
    textSecond:   d ? '#afc2cc' : '#405e70',
    textMuted:    d ? '#8da5b4' : '#5b7483',
    textFaint:    d ? '#718c9d' : '#728793',
    accent:       d ? '#78e3ce' : '#087e78',
    accentSoft:   d ? 'rgba(103,223,200,0.09)' : 'rgba(8,126,120,0.07)',
    cardBg:       d ? 'rgba(12,25,40,0.78)' : 'rgba(255,255,255,0.76)',
    cardBorder:   d ? 'rgba(154,202,214,0.16)' : 'rgba(34,71,91,0.15)',
    cardShadow:   d ? '0 20px 60px rgba(0,0,0,0.3),inset 0 1px 0 rgba(214,248,246,0.06)' : '0 18px 50px rgba(25,55,72,0.09),inset 0 1px 0 #fff',
    featureBg:    d ? 'rgba(12,25,40,0.72)' : 'rgba(255,255,255,0.66)',
    featureBord:  d ? 'rgba(154,202,214,0.14)' : 'rgba(34,71,91,0.13)',
    glowTint:     d ? 'rgba(103,223,200,0.1)' : 'rgba(8,126,120,0.07)',
    glowBlue:     d ? 'rgba(72,146,184,0.1)' : 'rgba(50,130,150,0.055)',
    glowPurple:   d ? 'rgba(145,105,220,0.11)' : 'rgba(114,87,173,0.06)',
    niBg:         d ? 'rgba(12,25,40,0.72)' : 'rgba(255,255,255,0.72)',
    niBorder:     d ? 'rgba(103,223,200,0.18)' : 'rgba(8,126,120,0.17)',
    niDivider:    d ? 'rgba(154,202,214,0.12)' : 'rgba(34,71,91,0.12)',
    niCardBg:     d ? 'rgba(12,25,40,0.7)' : 'rgba(255,255,255,0.72)',
    niCardBord:   d ? 'rgba(154,202,214,0.13)' : 'rgba(34,71,91,0.13)',
    niCardShadow: d ? '0 12px 36px rgba(0,0,0,0.24)' : '0 12px 32px rgba(25,55,72,0.07)',
    starBg:       d ? 'rgba(103,223,200,0.055)' : 'rgba(255,255,255,0.64)',
    starBorder:   d ? 'rgba(103,223,200,0.2)' : 'rgba(8,126,120,0.19)',
    starText:     d ? '#91c7bd' : '#39746f',
    ctaBg:        d ? 'linear-gradient(120deg,#67dfc8,#5fb9d0,#aa91ef)' : 'linear-gradient(120deg,#087e78,#3d91a8,#7257ad)',
    ctaText:      d ? '#071a20' : '#ffffff',
    footerText:   d ? '#607b8c' : '#6d818d',
    scrollLine:   d ? 'rgba(103,223,200,0.35)' : 'rgba(8,126,120,0.28)',
    scrollText:   d ? '#607b8c' : '#728793',
    altSection:   d ? 'rgba(100,160,180,0.025)' : 'rgba(255,255,255,0.3)',
    quoteBg:      d ? 'rgba(103,223,200,0.04)' : 'rgba(255,255,255,0.7)',
  };
}

// ─── 四化简介数据 ─────────────────────────────────────────
const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  '化禄': { attr: '吉化·增益', brief: '福星到宫，主财运与福气增益。所在宫位事物顺遂，能力增强，是命盘中最受欢迎的化星。' },
  '化权': { attr: '吉化·权威', brief: '权力星到宫，主掌控与领导力。所在宫位主强势与决断，喜入官禄宫与命宫，主事业上的实权。' },
  '化科': { attr: '吉化·名誉', brief: '科名星到宫，主声誉与贵人缘。所在宫位主文名与考运，有贵人扶持，宜学术、考试与公开场合。' },
  '化忌': { attr: '凶化·阻碍', brief: '劫数星到宫，主执念与阻碍。所在宫位需特别关注，该宫人生课题将成为重要考验。' },
};

// ─── 主星简介数据 ─────────────────────────────────────────
const STAR_BRIEF: Record<string, { attr: string; brief: string }> = {
  '紫微': { attr: '土·帝王星', brief: '天皇贵星，统御众星。坐命者有孤傲之气，主权威显达，天生具备领导气质，适合独当一面的领导岗位。' },
  '天机': { attr: '木·智慧星', brief: '益寿星，主智谋与变动。聪慧机灵，善于筹谋，心思细腻，宜从事策划、顾问、技术类工作。' },
  '太阳': { attr: '火·官禄主', brief: '官禄主星，主声誉与名望。慷慨大度，重视公众形象，利官场与公职，男命力强，入庙时光明磊落。' },
  '武曲': { attr: '金·财帛主', brief: '财帛主星，主财务与决断。意志坚定，行动果敢，适合财务、金融、军警类职业，孤克之星，利晚婚。' },
  '天同': { attr: '水·福星', brief: '福德主星，主享乐与人缘。性情温和，人缘极好，注重生活品质，感情细腻，晚年运势佳。' },
  '廉贞': { attr: '火·才艺星', brief: '次桃花星，主才艺与情欲。才华出众，感情丰富，适合艺术、政界，多才多艺但需防桃花是非。' },
  '天府': { attr: '土·财库星', brief: '南斗主星，主财库与积蓄。稳重保守，理财能力强，是命盘的稳定力量，适合管理财务与行政。' },
  '太阴': { attr: '水·田宅主', brief: '田宅主星，主财富与阴柔。细腻温柔，感受力强，女命尤佳，利不动产与积蓄，适合文艺或服务业。' },
  '贪狼': { attr: '木水·桃花', brief: '桃花星，主欲望与才艺。多才多艺，欲望旺盛，社交活跃，宜从事艺术、公关、商业，人缘极好。' },
  '巨门': { attr: '水·是非星', brief: '暗星，主口才与是非。口才出众，思辨能力强，适合律师、教育、媒体，注意口舌是非，以辩才立身。' },
  '天相': { attr: '水·印星', brief: '印星，主辅佐与印绶。善于协调，重视礼节，正直守法，适合幕僚、行政、法律类工作，贵人运佳。' },
  '天梁': { attr: '土·荫星', brief: '荫星，主老成与荫蔽。正直稳重，慈悲心强，老天爷会保佑，适合医疗、社会工作、宗教领域。' },
  '七杀': { attr: '金火·将星', brief: '将星，主刚烈与开创。性格刚毅，行动力强，勇于挑战，适合创业、军警、竞争性行业，逢凶化吉。' },
  '破军': { attr: '水·耗星', brief: '耗星，主变动与开拓。勇于突破，不惧改变，一生变动大但有魄力，适合开拓型工作，走别人没走过的路。' },
};

// ─── 功能视觉装饰 ────────────────────────────────────────
function FeatureVisual({ index, colors: c }: { index: number; colors: ReturnType<typeof useColors> }) {
  if (index === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-5">
        <div className="grid grid-cols-4 gap-1.5 w-full max-w-[18rem] mx-auto">
          {Array.from({ length: 16 }).map((_, i) => {
            const isCenter = [5, 6, 9, 10].includes(i);
            const isActive = [0, 3, 12, 15].includes(i);
            return (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-14 rounded-sm flex items-center justify-center text-xs transition-all duration-300"
                style={{
                  border: `1px solid ${isActive ? c.goldLine : c.cardBorder}`,
                  background: isCenter ? 'transparent' : isActive ? c.starBg : c.featureBg,
                  color: isActive ? c.goldSolid : c.textFaint,
                  opacity: isCenter ? 0 : 1,
                }}>
                {isActive ? '★' : ''}
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] tracking-widest transition-colors duration-300"
          style={{ color: c.textFaint }}>倪海厦排盘法</p>
      </div>
    );
  }

  if (index === 1) {
    const [sel, setSel] = useState<string | null>(null);
    const selInfo = sel ? (STAR_BRIEF[sel] ?? SIHUA_BRIEF[sel] ?? null) : null;
    return (
      <div className="flex flex-col gap-4 h-full justify-center">
        {[
          { group: '紫微系', stars: ['紫微', '天机', '太阳', '武曲', '天同', '廉贞'] },
          { group: '天府系', stars: ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'] },
        ].map(group => (
          <div key={group.group}>
            <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
              style={{ color: c.textFaint }}>{group.group}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.stars.map(s => (
                <motion.button key={s}
                  onClick={() => setSel(sel === s ? null : s)}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="text-xs px-2 py-1 rounded-md cursor-pointer"
                  style={{
                    border: `1px solid ${sel === s ? c.goldSolid : c.goldLine}`,
                    color: c.goldSolid,
                    background: sel === s ? `${c.goldLine}30` : 'transparent',
                    fontWeight: sel === s ? 600 : 400,
                  }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-[11px] tracking-widest mb-2 transition-colors duration-300"
            style={{ color: c.textFaint }}>四化飞星</div>
          <div className="flex gap-2 flex-wrap">
            {[['化禄', 'rgba(52,211,153,0.7)'], ['化权', 'rgba(96,165,250,0.7)'], ['化科', 'rgba(250,204,21,0.7)'], ['化忌', 'rgba(248,113,113,0.7)']].map(([label, color]) => (
              <motion.button key={label}
                onClick={() => setSel(sel === label ? null : label)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="text-xs px-2.5 py-1 rounded-md cursor-pointer"
                style={{
                  border: `1px solid ${color}`,
                  color,
                  background: sel === label ? `${color.replace('0.7', '0.15')}` : 'transparent',
                  fontWeight: sel === label ? 600 : 400,
                }}>
                {label}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {selInfo && (
            <motion.div key={sel}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl p-4 mt-1.5"
              style={{ border: `1px solid ${c.goldLine}`, background: c.featureBg }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-semibold" style={{ color: c.goldSolid }}>{sel}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ color: c.tagText, border: `1px solid ${c.goldLine}` }}>{selInfo.attr}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: c.textSecond }}>{selInfo.brief}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (index === 2) {
    const msgs = [
      { role: 'user', text: '我今年的事业运势如何？' },
      { role: 'ai', text: '命宫天机化禄，今年大限走官禄宫，三方有左辅相助，事业有贵人提携，适合主动拓展…' },
      { role: 'user', text: '什么时候感情运最好？' },
    ];
    return (
      <div className="flex flex-col gap-2 h-full justify-center">
        {msgs.map((m, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] text-[11px] px-3 py-2 rounded-lg leading-relaxed"
              style={{
                border: `1px solid ${m.role === 'user' ? c.goldLine : c.cardBorder}`,
                background: m.role === 'user' ? c.starBg : c.featureBg,
                color: m.role === 'user' ? c.goldSolid : c.textSecond,
              }}>
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (index === 3) {
    const patterns = [
      { name: '杀破狼格', desc: '开创进取之命', ok: true },
      { name: '廉相格',   desc: '行政印绶之格', ok: true },
      { name: '化忌入命', desc: '需关注心理课题', ok: false },
    ];
    return (
      <div className="flex flex-col gap-3 h-full justify-center">
        {patterns.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              border: `1px solid ${p.ok ? 'rgba(96,165,250,0.25)' : 'rgba(251,146,60,0.25)'}`,
              background: p.ok ? 'rgba(96,165,250,0.05)' : 'rgba(251,146,60,0.05)',
            }}>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: p.ok ? 'rgba(96,165,250,0.6)' : 'rgba(251,146,60,0.6)' }} />
            <div>
              <div className="text-[11px] font-medium"
                style={{ color: p.ok ? 'rgba(147,197,253,0.8)' : 'rgba(253,186,116,0.8)' }}>{p.name}</div>
              <div className="text-[10px]" style={{ color: c.textMuted }}>{p.desc}</div>
            </div>
          </motion.div>
        ))}
        <div className="text-[9px] mt-2 tracking-wider text-center" style={{ color: c.textFaint }}>
          自动识别 11 种经典格局
        </div>
      </div>
    );
  }

  return null;
}

// ─── 原创星象仪表（纯 SVG，无外部素材）─────────────────────
function ForecastInstrument() {
  const branches = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'];
  const points = [[105,145],[151,102],[238,80],[333,105],[391,174],[404,274],[356,371],[245,412],[139,365],[90,276]];
  return (
    <div className="forecast-instrument-wrap">
      <div className="forecast-instrument">
        <div className="forecast-instrument-head">
          <strong>个人星象坐标</strong>
          <span>SYSTEM / READY</span>
        </div>
        <svg className="forecast-dial" viewBox="0 0 500 500" role="img" aria-label="十二宫星象仪表视觉">
          <defs>
            <radialGradient id="dial-core">
              <stop offset="0%" stopColor="var(--ac)" stopOpacity="0.16" />
              <stop offset="65%" stopColor="var(--violet)" stopOpacity="0.045" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="dial-line" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--ac)" />
              <stop offset="100%" stopColor="var(--violet)" />
            </linearGradient>
            <filter id="dial-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx="250" cy="250" r="220" fill="url(#dial-core)" />
          <g fill="none" stroke="var(--t-border)">
            <circle cx="250" cy="250" r="205" />
            <circle cx="250" cy="250" r="170" />
            <circle cx="250" cy="250" r="118" />
            <circle cx="250" cy="250" r="78" strokeDasharray="2 7" />
            <path d="M45 250H455M250 45V455" strokeDasharray="2 9" />
            <path d="M105 105L395 395M395 105L105 395" strokeDasharray="2 12" opacity="0.5" />
          </g>
          <g className="forecast-dial-orbit" stroke="var(--ac)" fill="none">
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i * 6 - 90) * Math.PI / 180;
              const major = i % 5 === 0;
              const r1 = major ? 194 : 199;
              const r2 = 205;
              return <line key={i} x1={250 + Math.cos(a) * r1} y1={250 + Math.sin(a) * r1} x2={250 + Math.cos(a) * r2} y2={250 + Math.sin(a) * r2} opacity={major ? 0.65 : 0.24} strokeWidth={major ? 1.4 : 0.8} />;
            })}
            <path d="M250 45A205 205 0 0 1 427 147" strokeWidth="2" opacity="0.7" />
            <circle cx="427" cy="147" r="3.5" fill="var(--ac)" filter="url(#dial-glow)" />
          </g>
          <g className="forecast-dial-orbit-reverse" fill="none">
            <ellipse cx="250" cy="250" rx="166" ry="98" transform="rotate(-24 250 250)" stroke="var(--violet)" strokeOpacity="0.28" />
            <circle cx="390" cy="181" r="4" fill="var(--violet)" filter="url(#dial-glow)" />
            <circle cx="118" cy="319" r="2.5" fill="var(--ac)" />
          </g>
          <polyline points={points.map(p => p.join(',')).join(' ')} fill="rgba(var(--ac-rgb),0.035)" stroke="url(#dial-line)" strokeOpacity="0.42" strokeWidth="1" />
          {points.map(([x,y], i) => <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 3 : 1.8} fill={i % 3 === 0 ? 'var(--ac)' : 'var(--violet)'} opacity={i % 2 === 0 ? 0.9 : 0.55} />)}
          <g fill="var(--tx-3)" fontSize="11" fontFamily="var(--font)" textAnchor="middle">
            {branches.map((branch, i) => {
              const a = (i * 30 - 90) * Math.PI / 180;
              return <text key={branch} x={250 + Math.cos(a) * 183} y={254 + Math.sin(a) * 183}>{branch}</text>;
            })}
          </g>
          <g textAnchor="middle">
            <text x="250" y="218" fill="var(--ac)" fontSize="9" letterSpacing="4" fontFamily="var(--font-mono)">ZI WEI</text>
            <text x="250" y="272" fill="var(--tx-0)" fontSize="52" fontWeight="500" fontFamily="var(--font)">紫微</text>
            <text x="250" y="298" fill="var(--tx-3)" fontSize="10" letterSpacing="3" fontFamily="var(--font)">十二宫 · 星曜定位</text>
          </g>
          <g className="forecast-dial-pulse" fill="var(--ac)">
            <circle cx="250" cy="80" r="2" /><circle cx="151" cy="102" r="1.5" /><circle cx="404" cy="274" r="1.5" />
          </g>
        </svg>
        <div className="forecast-instrument-foot">
          <div><span>PALACES</span><strong>十二宫位</strong></div>
          <div><span>CORE STARS</span><strong>十四主星</strong></div>
          <div><span>ENGINE</span><strong>本地排盘</strong></div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页 ─────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = useColors(theme);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  // 把 body / html 背景同步到 home 主题色，消除半透明 nav 透出 #fafaf9 的色差
  // useLayoutEffect 保证在浏览器绘制前同步更新，避免与根 div 的 transition 不同步
  useLayoutEffect(() => {
    document.documentElement.style.background = c.bgBase;
    document.body.style.background = c.bgBase;
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
    };
  }, [c.bgBase]);

  return (
    <div style={{ background: c.bgBase, transition: 'background 0.35s ease' }} className="forecast-home overflow-x-hidden">
      <StarField />

      {/* 全局光晕 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowTint} 0%, transparent 70%)` }} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowBlue} 0%, transparent 70%)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(ellipse, ${c.glowPurple} 0%, transparent 70%)` }} />
      </div>

      {/* ── 顶部导航 ── */}
      <nav className="forecast-nav">
        <a href="/" className="forecast-brand" aria-label="紫微命盘首页">
          <span className="forecast-brand-mark" aria-hidden="true" />
          <span className="forecast-brand-copy">
            <strong>紫微命盘</strong>
            <small>FORECAST CENTER</small>
          </span>
        </a>
        <span className="forecast-status">LOCAL ASTROLOGY SYSTEM</span>
        <div className="forecast-nav-actions">
          <ThemeToggle />
          <button type="button" onClick={() => router.push('/heming')} className="forecast-nav-link">合盘</button>
          <button type="button" onClick={() => router.push('/chart')} className="forecast-nav-cta">立即起盘</button>
        </div>
      </nav>

      {/* ══ HERO · 星象仪表盘 ═════════════════════════════ */}
      <section ref={heroRef} className="forecast-hero">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="forecast-hero-copy">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="forecast-eyebrow">
            紫微斗数 · 倪海厦体系
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.08, ease: [0.22,1,0.36,1] }}>
            <h1>
              <span className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'}`}>紫微命盘</span>
              <span className="forecast-hero-title-sub">以星象为坐标，读懂自己的节奏</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65, delay: 0.24 }} className="forecast-hero-description">
            输入出生年月日时，生成专属紫微斗数命盘。十四主星、四化飞星与大限流年清晰呈现，再由 AI 陪你探索命盘背后的性格与人生课题。
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.36 }} className="forecast-hero-actions">
            <button type="button" onClick={() => router.push('/chart')} className="forecast-hero-primary">立即起盘 <span>↗</span></button>
            <button type="button" onClick={() => router.push('/heming')} className="forecast-hero-secondary">探索紫微合盘</button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }} className="forecast-hero-metrics">
            <div className="forecast-hero-metric"><strong>12 宫</strong><span>完整人生坐标</span></div>
            <div className="forecast-hero-metric"><strong>14 主星</strong><span>星曜关系可读</span></div>
            <div className="forecast-hero-metric"><strong>本地计算</strong><span>出生信息即时排盘</span></div>
          </motion.div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.18, ease: [0.22,1,0.36,1] }}>
          <ForecastInstrument />
        </motion.div>
      </section>

      {/* ══ 哲学引言 ══════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden min-h-[82svh] lg:min-h-[92vh] flex items-center" style={{ padding: '72px 24px' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #050b14 0%, #081524 18%, #11182f 42%, #10132a 62%, #071321 84%, #050b14 100%)'
              : 'linear-gradient(to bottom, #eef4f7 0%, #dce9ed 10%, #263b52 30%, #172b40 52%, #263b52 74%, #dce9ed 92%, #eef4f7 100%)',
            transition: 'background 0.4s ease',
          }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-bold" style={{ fontSize: 'clamp(220px, 38vw, 460px)', color: 'rgba(103,223,200,0.025)', lineHeight: 1, fontFamily: 'serif' }}>命</span>
        </div>
        <FadeIn className="relative mx-auto text-center w-full" y={20}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, rgba(103,223,200,0.4))' }} />
            <span className="text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(103,223,200,0.58)' }}>命 · 运 · 观</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, rgba(103,223,200,0.4))' }} />
          </div>
          <div className="space-y-3" style={{ maxWidth: '840px', margin: '0 auto' }}>
            {[
              { text: '提前窥探命运的意义', size: 'clamp(17px, 2.2vw, 28px)', color: 'rgba(215,228,252,0.72)', delay: 0.1 },
              { text: '不在于预知未来', size: 'clamp(21px, 2.6vw, 32px)', color: 'rgba(220,232,250,0.74)', delay: 0.25 },
              { text: '而在于不断认识自己', size: 'clamp(24px, 3vw, 40px)', color: 'rgba(218,230,248,0.8)', delay: 0.34 },
            ].map((line, i) => (
              <motion.p key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: line.delay }}
                className="tracking-wider" style={{ fontSize: line.size, color: line.color, fontWeight: 400 }}>
                {line.text}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="grad-text grad-text-dark font-bold"
              style={{ fontSize: 'clamp(24px, 3.4vw, 48px)', letterSpacing: '0.05em', lineHeight: 1.35 }}>
              最终书写属于自己的人生剧本
            </motion.p>
          </div>
        </FadeIn>
      </section>

      {/* ══ 4 大学习板块时间轴 ════════════════════════════ */}
      <section className="relative z-10 py-20 lg:py-24 px-6"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.03) 50%, transparent 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(184,146,42,0.04) 50%, transparent 100%)',
        }}>
        <FadeIn className="text-center mb-14">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
            <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: c.goldSolid, opacity: 0.7 }}>Curriculum</span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
          </div>
          <div className="text-2xl lg:text-3xl font-bold mb-2 tracking-[0.15em]" style={{ color: c.textPrimary }}>
            倪师方法论 · 渐次展开
          </div>
          <div className="text-xs lg:text-sm tracking-[0.1em]" style={{ color: c.textMuted }}>
            从紫微入门，逐步开放天纪 / 地纪 / 人纪学习模块
          </div>
        </FadeIn>

        <div className="max-w-sm lg:max-w-5xl mx-auto relative">
          {/* 横向连接线（仅桌面）*/}
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5"
            style={{
              background: `linear-gradient(90deg, ${c.goldSolid} 0%, ${c.goldSolid} 25%, ${c.goldLine} 25%)`,
              opacity: 0.6,
            }} />

          {/* 纵向连接线（仅手机）—— 圆点贴在线上，做"地铁线路图"风格 */}
          <div className="lg:hidden absolute left-7 top-7 bottom-7 w-px -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, ${c.goldSolid} 0%, ${c.goldSolid} 22%, ${c.goldLine} 22%)`,
              opacity: 0.6,
            }} />

          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-4 lg:gap-4">
            {SECTIONS.map((s, i) => {
              const ready = s.status === 'ready';
              return (
                <motion.div key={s.key}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="relative flex flex-row lg:flex-col items-center lg:items-center text-left lg:text-center gap-4 lg:gap-0">
                  {/* 节点圆 */}
                  <div className="relative w-14 h-14 shrink-0 rounded-full flex items-center justify-center lg:mb-3"
                    style={{
                      background: ready
                        ? `linear-gradient(135deg, ${c.goldSolid} 0%, ${c.goldSolid}cc 100%)`
                        : (theme === 'dark' ? 'rgba(184,146,42,0.05)' : '#fdf8ee'),
                      border: ready ? 'none' : `2px dashed ${c.goldLine}`,
                      color: ready ? (theme === 'dark' ? '#071a20' : '#ffffff') : c.textMuted,
                      boxShadow: ready ? `0 4px 16px ${c.goldSolid}55` : 'none',
                    }}>
                    <span className="text-2xl">{s.icon}</span>
                    {ready && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ background: '#10b981', boxShadow: '0 2px 6px rgba(16,185,129,0.4)' }}>
                        ✓
                      </div>
                    )}
                  </div>
                  {/* 文字组：手机端右排单列；桌面端居中堆叠 */}
                  <div className="flex-1 lg:flex-none flex flex-col items-start lg:items-center min-w-0">
                    {/* 顶行：时间标签 + 板块名 + note（手机端 inline；桌面端依然分行） */}
                    <div className="flex items-baseline gap-2 lg:flex-col lg:gap-0 lg:mb-1">
                      <div className="text-[10px] tracking-[0.25em] lg:mb-1.5"
                        style={{ color: ready ? '#10b981' : c.textMuted, fontWeight: 500 }}>
                        {s.when}
                      </div>
                      <div className="text-base lg:text-xl font-semibold tracking-[0.15em]"
                        style={{ color: c.textPrimary }}>
                        {s.name}
                      </div>
                      {s.note && (
                        <div className="text-[9px] tracking-[0.15em] px-2 py-0.5 rounded-full lg:hidden"
                          style={{
                            color: c.goldSolid,
                            background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                            border: `1px solid ${c.goldLine}`,
                            opacity: 0.85,
                          }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                    {/* 桌面专属 note（手机已在顶行 inline 展示）*/}
                    {s.note && (
                      <div className="hidden lg:block text-[9px] tracking-[0.15em] mb-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          color: c.goldSolid,
                          background: theme === 'dark' ? 'rgba(184,146,42,0.1)' : 'rgba(184,146,42,0.08)',
                          border: `1px solid ${c.goldLine}`,
                          opacity: 0.85,
                        }}>
                        {s.note}
                      </div>
                    )}
                    {/* 简介 */}
                    <div className="text-[11px] lg:text-xs leading-relaxed lg:max-w-[200px] mt-0.5 lg:mt-0"
                      style={{ color: c.textSecond }}>
                      {s.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 功能详解 ══════════════════════════════════════ */}
      <section className="relative z-10">
        {FEATURES.map((feature, i) => (
          <div key={i}
            className={`flex items-center px-6 md:px-10 lg:px-14 py-20 md:py-24 ${i <= 2 ? 'min-h-[82svh] lg:min-h-[92vh]' : ''}`}
            style={{ background: i % 2 === 1 ? c.altSection : 'transparent' }}>
            <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
              <div className={`grid grid-cols-1 ${i % 2 === 0 ? 'lg:grid-cols-[0.45fr_0.55fr]' : 'lg:grid-cols-[0.55fr_0.45fr]'} gap-10 lg:gap-16 items-start ${i % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                {/* 文字区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <FadeIn delay={0}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px w-8" style={{ background: c.goldLine }} />
                      <span className="text-[10px] tracking-[0.22em] sm:tracking-[0.5em] uppercase" style={{ color: c.tagText }}>{feature.tag}</span>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.1}>
                    <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold leading-tight mb-5 tracking-tight`}
                      style={{
                        fontSize: i < 2 ? 'clamp(36px, 4vw, 56px)' : 'clamp(30px, 3.5vw, 48px)',
                        whiteSpace: 'pre-line',
                      }}>
                      {feature.title}
                    </h2>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <p className="text-base mb-8 leading-relaxed" style={{ color: c.textSecond }}>{feature.subtitle}</p>
                  </FadeIn>
                  <div className="space-y-4">
                    {feature.points.map((point, j) => (
                      <FadeIn key={j} delay={0.25 + j * 0.08}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-2 w-1 h-1 rounded-full" style={{ background: c.goldSolid, opacity: 0.6 }} />
                          <p className="text-sm leading-relaxed" style={{ color: c.textMuted }}>{point}</p>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </div>
                {/* 视觉装饰区 */}
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <FadeIn delay={0.15}>
                    <div className="relative rounded-2xl overflow-hidden p-8 md:p-12"
                      style={{
                        border: `1px solid ${c.featureBord}`,
                        background: c.featureBg,
                        minHeight: i <= 1 ? '540px' : i === 2 ? '460px' : '320px',
                        boxShadow: c.cardShadow,
                      }}>
                      <FeatureVisual index={i} colors={c} />
                    </div>
                  </FadeIn>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══ 天·地·人 三分理论 ════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20"
        style={{ background: c.altSection, minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.22em] sm:tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Ni Haixia · Philosophy</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-5 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                天 · 地 · 人
              </h2>
              <p className="max-w-2xl mx-auto text-sm leading-relaxed" style={{ color: c.textSecond }}>
                倪海厦老师的核心命运观：命运从来不是人生的全部。<br />
                他将影响人生的力量分为三个同等重要的维度。
              </p>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {[
              { glyph: '天', label: '先天命运', pct: '⅓', color: c.goldSolid, borderColor: c.goldLine, desc: '紫微斗数所揭示的，是一个人的先天命盘格局——出生时间决定的星曜布局、五行局数、命宫主星。这只是命运的三分之一，是人生的底色，而非全貌。', sub: '命盘 · 星曜 · 五行' },
              { glyph: '地', label: '地理环境', pct: '⅓', color: 'rgba(96,165,250,0.9)', borderColor: 'rgba(96,165,250,0.3)', desc: '你所在的地理环境、城市、国家、风水格局，乃至家庭背景与社会结构，共同构成了命运的第二个维度。同一命盘，生在不同地方，际遇可以天壤之别。', sub: '地域 · 风水 · 环境' },
              { glyph: '人', label: '人心意念', pct: '⅓', color: 'rgba(100,216,139,0.9)', borderColor: 'rgba(100,216,139,0.3)', desc: '个人的意志、心态、选择与行动，才是改变命运最主动的力量。倪师强调：了解命盘是为了更好地做人，而不是坐等命运安排。精进自己，是最强的破局之道。', sub: '意志 · 选择 · 行动' },
            ].map((item, i) => (
              <FadeIn key={item.glyph} delay={0.1 + i * 0.12}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.1 }}
                  className="rounded-2xl p-7 h-full flex flex-col"
                  style={{ background: c.cardBg, border: `1px solid ${item.borderColor}`, boxShadow: c.cardShadow }}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="text-5xl font-bold leading-none" style={{ color: item.color }}>{item.glyph}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: item.color }}>{item.pct}</div>
                      <div className="text-[9px] mt-0.5 tracking-widest" style={{ color: c.textMuted }}>of life</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-0.5" style={{ color: item.color }}>{item.label}</div>
                    <div className="text-[10px] tracking-wider" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                  <div className="h-px mb-4" style={{ background: item.borderColor }} />
                  <p className="text-xs leading-relaxed flex-1" style={{ color: c.textSecond }}>{item.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed" style={{ color: c.textSecond }}>
                「命运不是人生的全部，加上地理位置和人念，才是。」
              </p>
              <p className="mt-2 text-[10px] tracking-widest" style={{ color: c.tagText }}>— 倪海厦</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ 倪海厦介绍 ════════════════════════════════════ */}
      <section className="relative z-10 flex items-center px-6 md:px-10 lg:px-14 py-20" style={{ minHeight: '82svh' }}>
        <WeakBoundary line={c.navBorder} />
        <div className="mx-auto w-full" style={{ maxWidth: '1280px' }}>
          <FadeIn>
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.goldLine})` }} />
                <span className="text-[10px] tracking-[0.22em] sm:tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Master · 1953 – 2012</span>
                <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.goldLine})` }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-6 tracking-tight`}
                style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                倪海厦老师
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed text-sm" style={{ color: c.textSecond }}>
                当代华人圈最具影响力的中医与术数大家之一<br />
                美国汉唐中医学院创办人 ·「人纪」「天纪」两大教学体系传世
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl p-8 md:p-10 mb-8"
              style={{ border: `1px solid ${c.niBorder}`, background: c.niBg, boxShadow: c.cardShadow }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: '生于', value: '1954年', sub: '台湾' },
                  { label: '离世', value: '2012年', sub: '1月31日 · 享年58' },
                  { label: '传承', value: '紫微斗数', sub: '经方中医 · 易经' },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-xl px-4 py-3"
                    style={{ border: `1px solid ${c.niDivider}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-[10px] tracking-[0.3em] mb-1" style={{ color: c.textFaint }}>{item.label}</div>
                    <div className="text-2xl font-semibold mb-0.5" style={{ color: c.goldSolid }}>{item.value}</div>
                    <div className="text-[11px]" style={{ color: c.textMuted }}>{item.sub}</div>
                  </div>
                ))}
              </div>
              <div className="h-px mb-8" style={{ background: c.niDivider }} />
              <div className="space-y-4 text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: c.textSecond }}>
                <p>
                  <strong style={{ color: c.goldSolid }}>生平履历</strong>：
                  倪海厦先生（1954–2012）出生于台湾，早年师承多位中医名家，专研经方派（《伤寒论》传承）。
                  中年赴美行医，在美国创立<strong>汉唐中医学院</strong>，二十余年间系统传授中医与传统术数。
                  2012 年 1 月 31 日因肝癌在台湾离世，享年 58 岁。
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>教学体系</strong>：
                  倪师将毕生所学整理为两大公开教学系列。
                  <strong>「人纪」</strong>涵盖《针灸大成》《神农本草经》《黄帝内经》《伤寒论》《金匮要略》——
                  这是「人之纪」，奠定中医学习的完整路径；
                  <strong>「天纪」</strong>涵盖紫微斗数与《易经》——这是「天之纪」，是术数研究的体系化成果。
                  两者相合，是倪师留给后世最完整的传承。
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>紫微立场</strong>：
                  倪师在紫微斗数上明确属<strong>南派三合派</strong>，主张「以命宫为本、以三方四正为用、以四化为纲」。
                  他在《天纪》课程中明言：「<em>飞星（四化）飞来飞去太复杂，不搞这个，毕竟大道至简</em>」——
                  这一立场将其与繁琐的飞星派清晰区分。
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>治学态度</strong>：
                  倪师反对死记硬背口诀，强调「理解原理胜过背诵」「逻辑可复核胜过神秘玄学」。
                  这种态度让紫微斗数从师徒密传的封闭体系，走向系统化、可验证、可学习的现代知识体系。
                </p>
                <p>
                  <strong style={{ color: c.goldSolid }}>当代影响</strong>：
                  倪师的讲课视频在 B 站、YouTube 与各大平台广泛流传，是新一代命理与中医爱好者公认的入门必修。
                  他不仅是紫微斗数的传承者，更是把传统命理与中医带入现代知识体系的关键人物之一。
                </p>
                <p style={{ fontSize: '11px', color: c.textMuted, fontStyle: 'italic', marginTop: '12px' }}>
                  本平台所有解读基于倪师《天纪》公开教学讲义、《紫微斗数全书》明版、传统三合派古籍整理而成，
                  仅作文化与个人成长参考。倪师本人与本平台无任何商业关联。
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NI_TEACHINGS.map((teaching, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.1 }}
                  className="rounded-xl p-6 h-full"
                  style={{ border: `1px solid ${c.niCardBord}`, background: c.niCardBg, boxShadow: c.niCardShadow }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                      style={{ borderColor: c.goldLine }}>
                      <span className="text-[9px]" style={{ color: c.goldSolid }}>{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-medium leading-relaxed" style={{ color: c.goldSolid }}>{teaching.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed pl-8" style={{ color: c.textSecond }}>{teaching.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 合盘入口 ══════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-10 lg:px-14 py-20">
        <div className="mx-auto" style={{ maxWidth: '1280px' }}>
          <div className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
            }}>
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-8" style={{ background: c.goldLine }} />
                <span className="text-[10px] tracking-[0.22em] sm:tracking-[0.5em] uppercase" style={{ color: c.tagText }}>Compatibility · Analysis</span>
                <div className="h-px w-8" style={{ background: c.goldLine }} />
              </div>
              <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-4 tracking-tight`}
                style={{ fontSize: 'clamp(26px, 3.5vw, 40px)' }}>
                紫微合盘
              </h2>
              <p className="text-sm leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: c.textSecond }}>
                输入两个人的出生信息，AI 基于倪海厦体系分析夫妻宫互参、命宫兼容性与三方四正交互，<br className="hidden md:block" />
                给出感情匹配度、合伙可行性与最佳相处建议。
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                {['感情匹配度分析', '合伙创业评估', '亲子缘分解读', '婚前相性评估'].map(item => (
                  <span key={item} style={{
                    fontSize: '12px', padding: '5px 14px', borderRadius: '20px',
                    background: 'var(--ac-bg)',
                    border: `1px solid ${c.goldLine}`,
                    color: c.goldSolid,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/heming')}
                className="px-10 py-3 font-medium text-sm tracking-widest rounded-full"
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(140,100,20,0.1)',
                  border: `1px solid ${c.goldLine}`,
                  color: c.goldSolid,
                  cursor: 'pointer',
                }}>
                开始合盘分析
              </motion.button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══ 最终 CTA ══════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6 text-center" style={{ background: c.altSection }}>
        <FadeIn>
          <p className="text-[10px] tracking-[0.6em] uppercase mb-6" style={{ color: c.tagText }}>开始你的命盘之旅</p>
          <h2 className={`grad-text ${theme === 'dark' ? 'grad-text-dark' : 'grad-text-light'} font-bold mb-8 tracking-tight leading-tight`}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)' }}>
            你的紫微命盘<br />等你解读
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: c.textSecond }}>
            输入出生年月日时，在几秒内生成你的专属命盘<br />
            再由 AI 按倪海厦体系为你深度解读
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/chart')}
            className="px-14 py-4 font-semibold text-base tracking-widest rounded-full"
            style={{ background: c.ctaBg, color: c.ctaText }}>
            免费起盘
          </motion.button>
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            <motion.a
              href="/knowledge"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              ✦ 紫微斗数知识库 →
            </motion.a>
            <motion.a
              href="/library"
              whileHover={{ scale: 1.02 }}
              className="text-xs tracking-[0.2em] inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                color: c.goldSolid,
                border: `1px solid ${c.goldLine}`,
                background: 'transparent',
                textDecoration: 'none',
              }}>
              📜 古籍原典库 →
            </motion.a>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6"
        style={{ borderTop: `1px solid ${c.niCardBord}` }}>

        {/* 4 板块导航占位（已上线 + 即将开放）*/}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="text-[9px] tracking-[0.3em] text-center mb-4 uppercase"
            style={{ color: c.textMuted, opacity: 0.6 }}>
            倪师方法论 · 学术体系
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {SECTIONS.map(s => {
              const ready = s.status === 'ready';
              return (
                <a
                  key={s.key}
                  href={ready ? '/chart' : undefined}
                  onClick={ready ? undefined : (e) => e.preventDefault()}
                  className="rounded-lg px-3 py-3 text-center transition-all"
                  style={{
                    background: ready ? c.starBg : 'transparent',
                    border: `1px ${ready ? 'solid' : 'dashed'} ${ready ? c.goldLine : c.navBorder}`,
                    cursor: ready ? 'pointer' : 'not-allowed',
                    opacity: ready ? 1 : 0.5,
                    textDecoration: 'none',
                  }}
                >
                  <div className="text-base font-semibold mb-0.5 tracking-[0.1em]"
                    style={{ color: ready ? c.goldSolid : c.textMuted }}>
                    {s.name}
                  </div>
                  <div className="text-[9px] tracking-wider"
                    style={{ color: ready ? '#10b981' : c.textMuted }}>
                    {ready ? '✓ 已上线' : `${s.when} 开放`}
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] tracking-wider mb-3" style={{ color: c.footerText }}>
            紫微命盘 · 基于倪海厦正宗体系 · 仅供参考，命运掌握在自己手中
          </p>
          <p className="text-[10px] tracking-wider mb-3 max-w-2xl mx-auto leading-relaxed"
            style={{ color: c.footerText, opacity: 0.85 }}>
            本平台基于中国传统文化研究，仅提供学习参考。<br className="sm:hidden" />
            不构成任何医疗、投资、法律或重大决策建议。
          </p>
          <p className="text-[10px] tracking-wider" style={{ color: c.footerText }}>
            <a href="/terms" style={{ color: c.footerText, textDecoration: 'underline' }}>服务条款</a>
            {' · '}
            <a href="/privacy" style={{ color: c.footerText, textDecoration: 'underline' }}>隐私政策</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
