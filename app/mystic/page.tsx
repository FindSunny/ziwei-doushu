'use client';
import { useRouter } from 'next/navigation';
import ChartAtmosphere from '@/components/ChartAtmosphere';
import HomeOrrery from '@/components/HomeOrrery';
import { MysticBrand, MysticThemeButton } from '@/components/MysticBrand';
import StyleSwitch from '@/components/StyleSwitch';

const PATHS = [
  {
    number: '壹',
    glyph: '命',
    title: '本命排盘',
    en: 'NATAL CHART',
    description: '十二宫位布列，十四主星归垣。以出生时刻为引，展开属于你的先天命盘。',
    action: '启盘问命',
    href: '/chart',
  },
  {
    number: '贰',
    glyph: '合',
    title: '双命合参',
    en: 'TWO CHARTS',
    description: '两盘并观，照见情感、合伙、亲子与朋友关系中的呼应和磨合。',
    action: '进入合盘',
    href: '/heming',
  },
  {
    number: '叁',
    glyph: '典',
    title: '典籍星图',
    en: 'CLASSICS',
    description: '从《紫微斗数全书》到天纪讲义，沿着原典与知识图谱回到星命本源。',
    action: '翻阅典籍',
    href: '/library',
  },
] as const;

const METHODS = [
  {
    chapter: '卷一',
    tag: '排盘体系',
    title: '命宫为体\n三方为用',
    description: '不采用简化起盘，命宫逆数生时、身宫顺数生时，十四主星与四化依原法布列。',
    points: ['纳音五行局起盘', '命身宫顺逆推演', '四化飞星完整呈现'],
  },
  {
    chapter: '卷二',
    tag: '星曜成象',
    title: '十四主星\n各归其位',
    description: '主星、辅星、煞星与庙旺利陷同盘呈现，星曜之间的呼应清楚可读。',
    points: ['十四主星完整入宫', '庙旺利陷分层辨识', '点击主星查看星义'],
  },
  {
    chapter: '卷三',
    tag: '天机批注',
    title: '因盘而问\n依理而答',
    description: '围绕命宫、三方四正、大限流年展开解释，不作脱离盘面的确定性预言。',
    points: ['命格与六亲主题解读', '大限流年追踪', '可继续追问具体议题'],
  },
  {
    chapter: '卷四',
    tag: '格局辨识',
    title: '星曜交汇\n见其格局',
    description: '从紫府同宫、杀破狼到机月同梁，自动辨认经典组合与需要留意的宫位关系。',
    points: ['十一类经典格局', '吉凶层次分层展示', '特殊组合重点标注'],
  },
];

const VOLUMES = [
  { name: '紫微', en: 'ZI WEI', description: '十四主星 · 十二宫位 · 四化流年', status: '已开卷' },
  { name: '天纪', en: 'TIAN JI', description: '紫微斗数 · 周易 · 奇门遁甲', status: '待启' },
  { name: '地纪', en: 'DI JI', description: '地理环境 · 宅命互参', status: '待启' },
  { name: '人纪', en: 'REN JI', description: '内经 · 伤寒 · 金匮 · 针灸', status: '待启' },
];

const TRIAD = [
  {
    glyph: '天',
    title: '先天命盘',
    en: 'HEAVEN',
    copy: '出生时刻定下星曜布局与五行局数，是人生的底色，而非全部答案。',
  },
  {
    glyph: '地',
    title: '地理环境',
    en: 'EARTH',
    copy: '城市、家宅与所处环境，改变同一张命盘落地的方式与际遇。',
  },
  {
    glyph: '人',
    title: '人心意念',
    en: 'HUMAN',
    copy: '心念、选择与行动，是命运中最能由自己掌握的一笔。',
  },
];

const TEACHINGS = [
  { title: '命宫为本，三方为用', copy: '看命先看命宫，再观财帛、官禄、迁移三方的呼应，四宫合看，方见全貌。' },
  { title: '对宫借星，不可忽视', copy: '空宫须借对宫星曜参看。命宫与迁移相对，彼此牵连，常是理解命主的关键。' },
  { title: '四化才是命运的手', copy: '星曜是底色，四化决定气机流转。同一星曜，逢禄逢忌，人生轨迹便有不同。' },
];

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mystic-home-heading">
      <span className="mystic-home-heading-number" aria-hidden="true">{number}</span>
      <div>
        <span className="mystic-home-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="mystic-chart-page mystic-home-page">
      <ChartAtmosphere />

      <header className="chart-topbar mystic-topbar mystic-home-topbar">
        <a href="/mystic" className="mystic-brand-button" aria-label="紫微垣首页">
          <MysticBrand />
        </a>
        <span className="mystic-topbar-separator" aria-hidden="true" />
        <nav className="mystic-home-links" aria-label="主要导航">
          <button type="button" onClick={() => router.push('/mystic/chart')}>命盘</button>
          <button type="button" onClick={() => router.push('/mystic/heming')}>合盘</button>
          <a href="/library">典籍</a>
        </nav>
        <div className="mystic-topbar-spacer" />
        <StyleSwitch current="mystic" />
        <MysticThemeButton />
        <button type="button" className="mystic-home-topbar-cta" onClick={() => router.push('/mystic/chart')}>
          启盘 <span aria-hidden="true">↗</span>
        </button>
      </header>

      <section className="mystic-home-hero">
        <div className="mystic-home-hero-copy">
          <div className="mystic-kicker"><span aria-hidden="true" />倪海厦《天纪》体系 · 紫微斗数</div>
          <h1>
            <span>观星</span>
            <em>见己</em>
          </h1>
          <p className="mystic-home-lead">
            以生辰为引，观十二宫星曜之序。<br />
            在古老星图里，看见自己的禀赋、际遇与人生课题。
          </p>
          <div className="mystic-home-actions">
            <button type="button" className="mystic-primary-action" onClick={() => router.push('/mystic/chart')}>
              启盘问命 <span aria-hidden="true">↗</span>
            </button>
            <button type="button" className="mystic-secondary-action" onClick={() => router.push('/mystic/heming')}>
              双命合参
            </button>
          </div>
          <div className="mystic-home-metrics">
            <div><strong>十二</strong><span>宫位成象</span></div>
            <div><strong>十四</strong><span>主星归垣</span></div>
            <div><strong>四化</strong><span>流年流转</span></div>
            <div><strong>本地</strong><span>排盘推演</span></div>
          </div>
          <p className="mystic-home-note">排盘计算在浏览器本地完成 · 仅作传统命理文化研究</p>
        </div>
        <HomeOrrery />
      </section>

      <section className="mystic-home-section mystic-home-paths">
        <SectionHeading
          number="一"
          eyebrow="THREE PATHS · 入垣"
          title="入垣三径"
          description="从一张命盘出发，观己、观缘，也回到古籍的源头。"
        />
        <div className="mystic-path-grid">
          {PATHS.map(path => (
            <button key={path.href} type="button" className="mystic-path-card" onClick={() => router.push(path.href)}>
              <span className="mystic-path-number">{path.number}</span>
              <span className="mystic-path-glyph" aria-hidden="true">{path.glyph}</span>
              <span className="mystic-path-en">{path.en}</span>
              <strong>{path.title}</strong>
              <p>{path.description}</p>
              <span className="mystic-path-action">{path.action} <i aria-hidden="true">↗</i></span>
            </button>
          ))}
        </div>
      </section>

      <section className="mystic-home-section">
        <SectionHeading
          number="二"
          eyebrow="FOUR METHODS · 法度"
          title="紫微四法"
          description="命盘、星曜、批注与格局，四者相合，才是一张完整的命图。"
        />
        <div className="mystic-method-grid">
          {METHODS.map(method => (
            <article key={method.chapter} className="mystic-method-card">
              <div className="mystic-method-top">
                <span>{method.chapter}</span>
                <small>{method.tag}</small>
              </div>
              <h3>{method.title}</h3>
              <p>{method.description}</p>
              <ul>
                {method.points.map(point => <li key={point}>{point}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mystic-home-section mystic-volumes">
        <SectionHeading
          number="三"
          eyebrow="THE FOUR SCROLLS · 学脉"
          title="四卷渐启"
          description="从紫微入门，沿倪师方法论继续向天、地、人三纪展开。"
        />
        <div className="mystic-volume-grid">
          {VOLUMES.map((volume, index) => (
            <div key={volume.name} className={`mystic-volume-card${index === 0 ? ' is-open' : ''}`}>
              <span className="mystic-volume-index">0{index + 1}</span>
              <span className="mystic-volume-en">{volume.en}</span>
              <strong>{volume.name}</strong>
              <p>{volume.description}</p>
              <span className="mystic-volume-status">{volume.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mystic-home-section mystic-home-triad">
        <SectionHeading
          number="四"
          eyebrow="HEAVEN · EARTH · HUMAN"
          title="天 · 地 · 人"
          description="命运不是人生的全部。天时、地理与人心，共同写就一个人的去向。"
        />
        <div className="mystic-triad-grid">
          {TRIAD.map(item => (
            <article key={item.glyph} className="mystic-triad-card">
              <span className="mystic-triad-glyph" aria-hidden="true">{item.glyph}</span>
              <div>
                <span className="mystic-triad-en">{item.en}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
        <blockquote className="mystic-home-quote">
          命运不是人生的全部，加上地理位置和人念，才是。
          <cite>— 倪海厦</cite>
        </blockquote>
      </section>

      <section className="mystic-home-section mystic-master-section">
        <SectionHeading
          number="五"
          eyebrow="MASTER · 1954—2012"
          title="倪海厦与天纪"
          description="以命宫为本、三方四正为用、四化为纲，将紫微斗数整理为可复核的知识体系。"
        />
        <div className="mystic-master-panel">
          <div className="mystic-master-facts">
            <div><span>生于</span><strong>1954</strong><small>台湾</small></div>
            <div><span>传世</span><strong>天纪 · 人纪</strong><small>紫微斗数 · 经方中医</small></div>
            <div><span>立场</span><strong>南派三合</strong><small>命宫为本 · 四化为纲</small></div>
          </div>
          <div className="mystic-master-copy">
            <p>
              倪师将毕生所学整理为「人纪」与「天纪」两大教学体系。前者奠定中医学习的完整路径，后者以紫微斗数与《易经》为骨，留下可被逐层学习的术数框架。
            </p>
            <p>
              本平台以公开讲义、《紫微斗数全书》与传统三合派资料为依据，只作文化研究与个人成长参考，不作确定性人生预言。
            </p>
            <a href="/knowledge">进入紫微知识库 <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <div className="mystic-teaching-grid">
          {TEACHINGS.map((teaching, index) => (
            <article key={teaching.title}>
              <span>其{['一', '二', '三'][index]}</span>
              <h3>{teaching.title}</h3>
              <p>{teaching.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mystic-home-final">
        <span className="mystic-home-final-kicker">命有来处 · 行在己心</span>
        <h2>你的星图<br />已经等候多时</h2>
        <p>输入出生年月日时，生成一张完整的紫微命盘。<br />再由玄机批注，陪你读懂星曜背后的人生课题。</p>
        <div>
          <button type="button" className="mystic-primary-action" onClick={() => router.push('/mystic/chart')}>免费启盘</button>
          <a className="mystic-secondary-action" href="/library">翻阅古籍</a>
        </div>
      </section>

      <footer className="mystic-home-footer">
        <div className="mystic-home-footer-top">
          <a href="/mystic" className="mystic-brand-button" aria-label="紫微垣首页"><MysticBrand /></a>
          <nav aria-label="页脚导航">
            <a href="/mystic/chart">命盘</a>
            <a href="/mystic/heming">合盘</a>
            <a href="/knowledge">知识库</a>
            <a href="/library">典籍</a>
          </nav>
        </div>
        <div className="mystic-home-footer-bottom">
          <p>基于倪海厦《天纪》体系 · 仅供传统文化研究与个人成长参考</p>
          <div><a href="/terms">服务条款</a><span>·</span><a href="/privacy">隐私政策</a></div>
        </div>
      </footer>
    </main>
  );
}
