'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import AiContent from '@/components/AiContent';
import AiQuotaNotice from '@/components/AiQuotaNotice';
import ChartAtmosphere from '@/components/ChartAtmosphere';
import { MysticBrand, MysticThemeButton } from '@/components/MysticBrand';
import StyleSwitch from '@/components/StyleSwitch';
import { parseAiQuotaExceeded, type AiQuotaExceededInfo } from '@/lib/ai-quota-error';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart as buildChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

const RELATIONSHIPS = ['感情', '合伙', '亲子', '朋友'] as const;
type Relationship = typeof RELATIONSHIPS[number];

const QUICK_QUESTIONS = [
  '感情匹配度如何？',
  '适合合伙创业吗？',
  '两人相处最需注意什么？',
  '哪方面最容易产生矛盾？',
  '财运是否互补？',
];

export default function HemingPage() {
  const router = useRouter();

  // ─── 双方命盘状态 ─────────────────────────────────────────
  const [chartA, setChartA] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [formA, setFormA] = useState<BirthFormState | null>(null);
  const [formB, setFormB] = useState<BirthFormState | null>(null);
  const [relationship, setRelationship] = useState<Relationship>('感情');

  // ─── AI 合盘分析状态 ─────────────────────────────────────
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [analysisError, setAnalysisError] = useState(false);
  const [quota, setQuota] = useState<AiQuotaExceededInfo | null>(null);
  const [apiMissing, setApiMissing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const generateChart = useCallback(async (info: BirthInfo): Promise<ZiweiChart | null> => {
    try {
      return buildChart(info);
    } catch {
      return null;
    }
  }, []);

  const isFormReady = (f: BirthFormState | null): boolean =>
    !!(f && f.year && f.month && f.day && f.gender && (f.unknownTime || (f.clockHour !== '' && f.clockMinute !== '')));

  const runAnalysis = useCallback(async (q?: string) => {
    setFormError(null);
    if (!isFormReady(formA) || !isFormReady(formB)) {
      setFormError('请先填写双方完整出生信息');
      return;
    }
    setAnalyzing(true);
    setAnalysis('');
    setAnalysisError(false);
    setQuota(null);

    try {
      let cA = chartA;
      let cB = chartB;
      const [newA, newB] = await Promise.all([
        cA ? Promise.resolve(cA) : generateChart(formToBirthInfo(formA!)),
        cB ? Promise.resolve(cB) : generateChart(formToBirthInfo(formB!)),
      ]);
      cA = newA;
      cB = newB;
      if (!cA || !cB) {
        setAnalysisError(true);
        setAnalyzing(false);
        return;
      }
      if (!chartA) setChartA(cA);
      if (!chartB) setChartB(cB);

      const res = await fetch('/api/heming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartA: cA, chartB: cB, relationship, question: q ?? undefined }),
      });
      if (res.status === 429) {
        const payload = await res.json().catch(() => null);
        const info = parseAiQuotaExceeded(payload);
        if (info) {
          setQuota(info);
          return;
        }
      }
      if (res.status === 404) { setApiMissing(true); throw new Error('api-missing'); }
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            text += delta;
            setAnalysis(text);
          } catch { /* skip */ }
        }
      }
      setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setAnalysisError(true);
    } finally {
      setAnalyzing(false);
    }
  }, [chartA, chartB, formA, formB, generateChart, relationship]);

  return (
    <main className="mystic-chart-page mystic-heming-page">
      <ChartAtmosphere />

      <header className="chart-topbar mystic-topbar mystic-heming-topbar">
        <button type="button" className="mystic-brand-button" onClick={() => router.push('/mystic')} aria-label="返回首页">
          <MysticBrand />
        </button>
        <span className="mystic-topbar-separator" aria-hidden="true" />
        <span className="mystic-topbar-note">双命合参 · 本地推演</span>
        <div className="mystic-topbar-spacer" />
        <StyleSwitch current="mystic" />
        <MysticThemeButton />
      </header>

      <div className="mystic-heming-shell">
        <header className="mystic-heming-hero">
          <div className="mystic-kicker"><span aria-hidden="true" />HEMING · 双命合参</div>
          <h1>双星照命</h1>
          <p>两盘并观，照见缘分、性情与相处之道。选择一段关系，展开两张命盘之间的星曜呼应。</p>
          <div className="mystic-heming-sigil" aria-hidden="true"><span>合</span></div>
        </header>

        <div className="heming-grid mystic-heming-forms">
          <article className="heming-person-card mystic-heming-person">
            <div className="mystic-person-heading">
              <span className="mystic-person-seal">甲</span>
              <div><strong>甲方 · 命一</strong><small>PERSON A</small></div>
            </div>
            <BirthForm hideSubmit onSubmit={() => {}} onFormSave={setFormA} />
          </article>

          <span className="mystic-heming-join" aria-hidden="true">合</span>

          <article className="heming-person-card mystic-heming-person">
            <div className="mystic-person-heading">
              <span className="mystic-person-seal is-second">乙</span>
              <div><strong>乙方 · 命二</strong><small>PERSON B</small></div>
            </div>
            <BirthForm hideSubmit onSubmit={() => {}} onFormSave={setFormB} />
          </article>
        </div>

        <fieldset className="mystic-relation-fieldset">
          <legend className="sr-only">选择双方关系</legend>
          <div className="mystic-relation-inner">
            <div className="mystic-relation-label" aria-hidden="true">
              <span>择一关系</span>
              <small>RELATIONSHIP</small>
            </div>
            <div className="mystic-relation-options">
              {RELATIONSHIPS.map(item => (
                <label key={item} className={`mystic-relation-option${relationship === item ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="heming-relationship"
                    value={item}
                    checked={relationship === item}
                    onChange={() => setRelationship(item)}
                  />
                  <i aria-hidden="true" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <div className="mystic-relation-current" aria-live="polite">
              当前关系 · <strong>{relationship}</strong>
            </div>
          </div>
        </fieldset>

        <section ref={analysisRef} className="heming-analysis-card mystic-heming-analysis">
          <div className="mystic-heming-analysis-head">
            <span className="mystic-heming-analysis-seal" aria-hidden="true">批</span>
            <div>
              <span>HEMING · ORACLE NOTES</span>
              <h2>双盘批注</h2>
            </div>
            <i aria-hidden="true" />
          </div>

          {quota && <div className="mystic-heming-quota"><AiQuotaNotice info={quota} /></div>}

          {!analysis && !analyzing && !quota && (
            <div className="mystic-heming-start">
              <p>双方生辰落定，确认关系后即可起盘。命盘仅在浏览器本地生成，解读由服务端 AI 完成。</p>
              <button type="button" className="mystic-primary-action" onClick={() => runAnalysis()}>
                以{relationship}关系开始合盘 <span aria-hidden="true">↗</span>
              </button>
              {formError && <div className="mystic-form-error" role="alert">{formError}</div>}
            </div>
          )}

          {analyzing && !analysis && (
            <div className="mystic-heming-loading" role="status" aria-live="polite">
              <span aria-hidden="true" />
              正在对比双方命盘…
            </div>
          )}

          {analysis && <AiContent text={analysis} streaming={analyzing} variant="mystic" />}

          {analysisError && (
            <div className="mystic-analysis-error">
              {apiMissing
                ? '开源版不含合盘 AI 分析接口（/api/heming），需要你自己实现后才能用。两人的命盘可以分别到「排盘」页（/chart）查看。'
                : '分析暂时不可用，请重试。'}
            </div>
          )}
        </section>

        {analysis && (
          <section className="mystic-heming-followup">
            <div className="mystic-heming-followup-title">
              <span aria-hidden="true" />
              继续问这段关系
            </div>
            <div className="mystic-heming-quick">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => { setQuestion(q); runAnalysis(q); }}
                  disabled={analyzing}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="heming-question-row mystic-heming-question">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !analyzing) runAnalysis(question || undefined); }}
                placeholder="继续追问，如：哪几年是两人感情关键期？"
                disabled={analyzing}
                className="input-base"
              />
              <button
                type="button"
                onClick={() => runAnalysis(question || undefined)}
                disabled={analyzing}
              >
                {analyzing ? '推演中…' : '继续追问'}
              </button>
            </div>
          </section>
        )}

        <footer className="mystic-page-foot">
          双方信息仅用于本次合盘 · AI 内容仅作传统文化参考
        </footer>
      </div>
    </main>
  );
}
