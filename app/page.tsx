'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';

const STARS = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'];

const FEATURES = [
  {
    tag: '排盘体系 · 卷一',
    title: '倪海厦正宗\n紫微斗数',
    subtitle: '非简化版，严格遵循倪海厦老师传承',
    points: ['纳音五行局起盘，不采用网络简化算法', '命宫逆数生时、身宫顺数生时，严格对齐教学规则', '十四主星与四化飞星按原法推演，结构完整可复核'],
  },
  {
    tag: '命盘呈现 · 卷二',
    title: '完整十四主星\n四化飞星',
    subtitle: '结构清晰，一眼看懂主轴与重点',
    points: ['十四主星完整入宫，主星关系清楚可读', '辅星与煞星同屏呈现，避免关键信息缺失', '庙旺利陷亮度分级，快速识别强弱', '点击任意主星即可查看倪海厦老师对该星的详细解读'],
  },
  {
    tag: 'AI 解读 · 卷三',
    title: '深度解盘\n不止于算',
    subtitle: '倪海厦体系知识库 × Claude AI',
    points: ['命格分析：从命宫主星出发，结合三方四正，给出全面的性格与人生格局判断', '六大维度解读：事业方向、感情婚姻、财运模式、健康注意、家庭关系、子女缘分', '大限流年追踪：当前10年大限重点、今年流年宫位的具体提示与行动建议', '自由追问：针对你的命盘直接提问，「今年能换工作吗」「什么时候结婚运最好」'],
  },
  {
    tag: '格局识别 · 卷四',
    title: '自动检测\n命盘格局',
    subtitle: '从星曜组合中发现你的命中注定',
    points: ['自动识别11种经典格局：紫府同宫、杀破狼格、机月同梁、廉相格、武曲七杀等', '辅弼夹命、日月夹命等特殊格局精准检测，并给出倪海厦体系下的标准解读', '四化入命宫迁移宫的特殊状况自动标注，提示需关注的人生议题', '格局按吉凶等级分层展示，让你一目了然自己命盘中的优势与挑战'],
  },
];

const SECTIONS = [
  { key: 'ziwei', name: '紫微', en: 'Zi Wei', desc: '14 主星 · 13 宫位 · AI 解读', status: '已上线', when: '5 月' },
  { key: 'tianji', name: '天纪', en: 'Tian Ji', desc: '紫微 · 周易 · 奇门遁甲', status: '即将开放', when: '6 月' },
  { key: 'diji', name: '地纪', en: 'Di Ji', desc: '倪师未竟之业 · 后辈补注 · 遗稿研读', status: '即将开放', when: '6 月' },
  { key: 'renji', name: '人纪', en: 'Ren Ji', desc: '内经 · 伤寒 · 金匮 · 针灸', status: '即将开放', when: '7 月' },
];

const NI_TEACHINGS = [
  { title: '命宫为本，三方为用', body: '倪师始终强调，看命必先看命宫。命宫主星决定一个人的基本格局与天生性格，三方（财帛、官禄、迁移）则决定此人的「用武之地」。四宫联动才是完整的人生图景。' },
  { title: '对宫借星，不可忽视', body: '倪师的独到之处在于重视「对宫」。任何宫位若为空宫，必须借对宫星曜来论断，命宫的对面是迁移宫，两者互相影响，这是很多初学者容易忽略的关键。' },
  { title: '四化才是命运的手', body: '星曜只是基础，四化（化禄、化权、化科、化忌）才是决定运势好坏的关键。同一颗星，有化禄与有化忌，人生轨迹可以截然不同。倪师反复强调：不看四化，命盘只解了一半。' },
  { title: '大限十年，运势有节', body: '倪师将人生划分为12个大限，每个大限10年。他认为人在不同的大限宫位，际遇完全不同。了解自己现在走的是哪个大限、该宫位有何星曜，才能真正把握当下的运势。' },
];

const SIHUA_BRIEF: Record<string, { attr: string; brief: string }> = {
  '化禄': { attr: '吉化·增益', brief: '福星到宫，主财运与福气增益。所在宫位事物顺遂，能力增强，是命盘中最受欢迎的化星。' },
  '化权': { attr: '吉化·权威', brief: '权力星到宫，主掌控与领导力。所在宫位主强势与决断，喜入官禄宫与命宫，主事业上的实权。' },
  '化科': { attr: '吉化·名誉', brief: '科名星到宫，主声誉与贵人缘。所在宫位主文名与考运，有贵人扶持，宜学术、考试与公开场合。' },
  '化忌': { attr: '凶化·阻碍', brief: '劫数星到宫，主执念与阻碍。所在宫位需特别关注，该宫人生课题将成为重要考验。' },
};

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

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={isDark ? '切换亮色主题' : '切换暗色主题'}>
      <span className="theme-toggle-mark" aria-hidden="true" />
      <span className="theme-toggle-label">{isDark ? '暗色' : '亮色'}</span>
    </button>
  );
}

function StarMap() {
  const points = [[260, 72], [345, 128], [397, 228], [355, 337], [259, 408], [157, 343], [112, 229], [166, 128]];
  return (
    <svg className="hero-star-map" viewBox="0 0 520 520" fill="none" aria-hidden="true">
      <g className="star-map-orbit" stroke="currentColor">
        <circle cx="260" cy="240" r="190" strokeOpacity="0.24" />
        <circle cx="260" cy="240" r="142" strokeOpacity="0.18" strokeDasharray="2 8" />
        <circle cx="260" cy="240" r="78" strokeOpacity="0.28" />
        <path d="M70 240H450M260 50V430" strokeOpacity="0.1" />
        <path d="M126 106L394 374M394 106L126 374" strokeOpacity="0.08" />
        <path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join('') + 'Z'} strokeOpacity="0.48" />
        <path d="M260 72L355 337L112 229L397 228L157 343L260 72Z" strokeOpacity="0.18" />
        {points.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={i === 0 ? 6 : 4} fill="var(--bg-0)" strokeOpacity="0.8" /><circle cx={x} cy={y} r="1.5" fill="currentColor" stroke="none" /></g>)}
        <circle cx="260" cy="240" r="7" fill="var(--cinnabar)" fillOpacity="0.85" stroke="none" />
      </g>
    </svg>
  );
}

function FeatureVisual({ index }: { index: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedInfo = selected ? STAR_BRIEF[selected] ?? SIHUA_BRIEF[selected] : null;

  if (index === 0) {
    return (
      <>
        <div className="mini-chart">
          {Array.from({ length: 16 }).map((_, i) => {
            const center = [5, 6, 9, 10].includes(i);
            const active = [0, 3, 12, 15].includes(i);
            return <div key={i} className={`mini-chart-cell ${center ? 'center' : ''} ${active ? 'active' : ''}`}>{center ? (i === 5 ? '紫微' : i === 10 ? '斗数' : '') : active ? ['命', '财', '官', '迁'][[0, 3, 12, 15].indexOf(i)] : '·'}</div>;
          })}
        </div>
        <p className="visual-caption">十二宫有序 · 三方四正互参</p>
      </>
    );
  }
  if (index === 1) {
    return (
      <div>
        {[{ group: '紫微系', stars: STARS.slice(0, 6) }, { group: '天府系', stars: STARS.slice(6) }, { group: '四化飞星', stars: Object.keys(SIHUA_BRIEF) }].map(group => (
          <div className="star-picker-group" key={group.group}>
            <div className="star-picker-label">{group.group}</div>
            <div className="star-picker-buttons">
              {group.stars.map(star => <button type="button" key={star} className={`star-picker-button ${selected === star ? 'active' : ''}`} onClick={() => setSelected(selected === star ? null : star)}>{star}</button>)}
            </div>
          </div>
        ))}
        {selectedInfo && <div className="star-brief"><span className="star-brief-title">{selected}</span><span className="star-brief-attr">{selectedInfo.attr}</span><p>{selectedInfo.brief}</p></div>}
      </div>
    );
  }
  if (index === 2) {
    return (
      <div className="demo-dialog">
        <div className="demo-message user">我今年的事业运势如何？</div>
        <div className="demo-message">命宫天机化禄，今年大限走官禄宫，三方有左辅相助，事业有贵人提携，适合主动拓展…</div>
        <div className="demo-message user">什么时候感情运最好？</div>
        <p className="visual-caption">围绕同一张命盘 · 持续追问</p>
      </div>
    );
  }
  return (
    <div>
      {[['杀破狼格', '开创进取之命'], ['廉相格', '行政印绶之格'], ['化忌入命', '需关注心理课题']].map(([name, desc]) => <div className="pattern-demo" key={name}><div className="pattern-demo-title">{name}</div><p>{desc}</p></div>)}
      <p className="visual-caption">自动识别 11 种经典格局</p>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="home-page">
      <nav className="home-nav" aria-label="首页导航">
        <div className="home-brand"><span className="brand-seal">紫</span>紫微命盘</div>
        <div className="home-nav-actions">
          <ThemeToggle />
          <button type="button" className="home-nav-link nav-heming" onClick={() => router.push('/heming')}>合盘</button>
          <button type="button" className="home-nav-link" onClick={() => router.push('/chart')}>立即起盘 →</button>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-folio">ZI WEI DOU SHU · 东方星曜全书</div>
        <div className="hero-copy">
          <div className="hero-kicker">紫微斗数 · 倪海厦体系</div>
          <h1 className="hero-title"><small>观星曜之位，读人生之书</small>紫微<span className="title-second">命盘</span><span className="hero-seal" aria-hidden="true"><span>知</span><span>命</span><span>行</span><span>己</span></span></h1>
          <p className="hero-subtitle">紫微为门 · 天地人为路 · 倪海厦为师</p>
          <p className="hero-description">AI 答疑 · 知行合一。输入出生年月日时，生成专属紫微斗数命盘 — 后续天纪、地纪、人纪学习模块陆续开放。</p>
          <div className="hero-actions"><button type="button" className="btn-primary" onClick={() => router.push('/chart')}>立即起盘 <span aria-hidden="true">→</span></button><a className="hero-text-link" href="/knowledge">先读星曜知识</a></div>
          <div className="hero-stars" aria-label="十四主星">{STARS.map(star => <span key={star}>{star}</span>)}</div>
        </div>
        <div className="hero-visual">
          <StarMap />
          <span className="hero-star-label label-north">北辰居所</span>
          <span className="hero-star-label label-east">东方七宿</span>
          <div className="hero-visual-note"><strong>5/1 — 5/8 · 限时回馈</strong>全部功能 + AI 提问 · 全免费</div>
        </div>
      </section>

      <section className="home-section alt">
        <div className="home-section-inner philosophy-grid">
          <div><span className="eyebrow">命 · 运 · 观</span><p className="section-copy">提前窥探命运的意义，是认识，也是书写。</p></div>
          <h2 className="philosophy-lines"><span>不在于预知未来</span><span>而在于不断认识自己</span><span className="emphasis">最终书写属于自己的人生剧本</span></h2>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-inner">
          <span className="eyebrow">Curriculum · 学习次序</span>
          <h2 className="section-heading">倪师方法论 · 渐次展开</h2>
          <p className="section-copy">从紫微入门，逐步开放天纪 / 地纪 / 人纪学习模块</p>
          <div className="curriculum-grid">{SECTIONS.map((section, i) => <div className="curriculum-item" key={section.key}><span className="curriculum-number">0{i + 1} / {section.when}</span><h3 className="curriculum-title">{section.name}</h3><div className="curriculum-en">{section.en}</div><p className="curriculum-desc">{section.desc}</p><span className="curriculum-status">{section.status}</span></div>)}</div>
        </div>
      </section>

      <section className="home-section alt">
        <div className="home-section-inner">
          <span className="eyebrow">Four chapters · 排盘与解读</span>
          <h2 className="section-heading">一张命盘，四层阅读</h2>
          <div className="feature-list">{FEATURES.map((feature, i) => <article className="feature-row" key={feature.tag}><div className="feature-copy"><span className="eyebrow">{feature.tag}</span><h3 className="feature-title">{feature.title}</h3><p className="section-copy">{feature.subtitle}</p><ul className="feature-points">{feature.points.map(point => <li key={point}>{point}</li>)}</ul></div><div className="feature-visual"><FeatureVisual index={i} /></div></article>)}</div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-inner">
          <span className="eyebrow">Ni Haixia · Philosophy</span>
          <h2 className="section-heading">天 · 地 · 人</h2>
          <p className="section-copy">倪海厦老师的核心命运观：命运从来不是人生的全部。他将影响人生的力量分为三个同等重要的维度。</p>
          <div className="three-grid">{[
            { glyph: '天', label: '先天命运', desc: '紫微斗数所揭示的，是一个人的先天命盘格局——出生时间决定的星曜布局、五行局数、命宫主星。这只是命运的三分之一，是人生的底色，而非全貌。', sub: '命盘 · 星曜 · 五行' },
            { glyph: '地', label: '地理环境', desc: '你所在的地理环境、城市、国家、风水格局，乃至家庭背景与社会结构，共同构成了命运的第二个维度。同一命盘，生在不同地方，际遇可以天壤之别。', sub: '地域 · 风水 · 环境' },
            { glyph: '人', label: '人心意念', desc: '个人的意志、心态、选择与行动，才是改变命运最主动的力量。倪师强调：了解命盘是为了更好地做人，而不是坐等命运安排。精进自己，是最强的破局之道。', sub: '意志 · 选择 · 行动' },
          ].map(item => <article className="three-card" key={item.glyph}><div className="three-card-head"><span className="three-glyph">{item.glyph}</span><span className="three-fraction">⅓</span></div><h3>{item.label}</h3><div className="three-card-sub">{item.sub}</div><p>{item.desc}</p></article>)}</div>
        </div>
      </section>

      <section className="home-section alt">
        <div className="home-section-inner">
          <div className="master-layout">
            <div><span className="eyebrow">Master · 1953 – 2012</span><h2 className="section-heading">倪海厦老师</h2><p className="section-copy">当代华人圈最具影响力的中医与术数大家之一<br />美国汉唐中医学院创办人 ·「人纪」「天纪」两大教学体系传世</p></div>
            <div>
              <div className="master-facts">{[['生于', '1954年', '台湾'], ['离世', '2012年', '1月31日 · 享年58'], ['传承', '紫微斗数', '经方中医 · 易经']].map(([label, value, sub]) => <div className="master-fact" key={label}><small>{label}</small><strong>{value}</strong><span>{sub}</span></div>)}</div>
              <div className="master-prose">
                <p><strong>生平履历</strong>：倪海厦先生（1954–2012）出生于台湾，早年师承多位中医名家，专研经方派（《伤寒论》传承）。中年赴美行医，在美国创立汉唐中医学院，二十余年间系统传授中医与传统术数。2012 年 1 月 31 日因肝癌在台湾离世，享年 58 岁。</p>
                <p><strong>教学体系</strong>：倪师将毕生所学整理为两大公开教学系列。「人纪」涵盖《针灸大成》《神农本草经》《黄帝内经》《伤寒论》《金匮要略》；「天纪」涵盖紫微斗数与《易经》。</p>
                <p><strong>紫微立场</strong>：倪师在紫微斗数上明确属南派三合派，主张「以命宫为本、以三方四正为用、以四化为纲」，强调大道至简。</p>
                <p><strong>治学态度</strong>：倪师反对死记硬背口诀，强调「理解原理胜过背诵」「逻辑可复核胜过神秘玄学」。</p>
                <p><strong>当代影响</strong>：倪师的讲课视频在 B 站、YouTube 与各大平台广泛流传，是新一代命理与中医爱好者公认的入门必修。</p>
                <p>本平台所有解读基于倪师《天纪》公开教学讲义、《紫微斗数全书》明版、传统三合派古籍整理而成，仅作文化与个人成长参考。倪师本人与本平台无任何商业关联。</p>
              </div>
            </div>
          </div>
          <div className="teaching-grid">{NI_TEACHINGS.map(teaching => <article className="teaching-card" key={teaching.title}><h3>{teaching.title}</h3><p>{teaching.body}</p></article>)}</div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section-inner">
          <div className="heming-entry"><div><span className="eyebrow">Compatibility · Analysis</span><h2>紫微合盘</h2><p className="section-copy">输入两个人的出生信息，AI 基于倪海厦体系分析夫妻宫互参、命宫兼容性与三方四正交互，给出感情匹配度、合伙可行性与最佳相处建议。</p><div className="heming-tags">{['感情匹配度分析', '合伙创业评估', '亲子缘分解读', '婚前相性评估'].map(item => <span key={item}>{item}</span>)}</div></div><button type="button" className="btn-ghost" onClick={() => router.push('/heming')}>开始合盘分析 →</button></div>
        </div>
      </section>

      <section className="home-section alt final-cta">
        <span className="eyebrow">开始你的命盘之旅</span>
        <h2>你的紫微命盘<br />等你解读</h2>
        <p>输入出生年月日时，在几秒内生成你的专属命盘<br />再由 AI 按倪海厦体系为你深度解读</p>
        <button type="button" className="btn-primary" onClick={() => router.push('/chart')}>免费起盘 →</button>
        <div className="final-links"><a className="btn-ghost" href="/knowledge">紫微斗数知识库 →</a><a className="btn-ghost" href="/library">古籍原典库 →</a></div>
      </section>

      <footer className="home-footer">
        <div className="footer-nav">{SECTIONS.map(section => section.key === 'ziwei' ? <a href="/chart" key={section.key}>{section.name}<small>已上线</small></a> : <span key={section.key}>{section.name}<small>{section.when} 开放</small></span>)}</div>
        <p>紫微命盘 · 基于倪海厦正宗体系 · 仅供参考，命运掌握在自己手中</p>
        <p>本平台基于中国传统文化研究，仅提供学习参考。不构成任何医疗、投资、法律或重大决策建议。</p>
        <p><a href="/terms">服务条款</a>{' · '}<a href="/privacy">隐私政策</a></p>
      </footer>
    </main>
  );
}
