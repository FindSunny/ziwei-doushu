'use client';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import AiContent from '@/components/AiContent';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { generateChart as buildChart } from '@/lib/ziwei/algorithm';
import type { BirthInfo, ZiweiChart } from '@/lib/ziwei/types';

export default function HemingPage() {
  const router = useRouter();
  const [chartA, setChartA] = useState<ZiweiChart | null>(null);
  const [chartB, setChartB] = useState<ZiweiChart | null>(null);
  const [formA, setFormA] = useState<BirthFormState | null>(null);
  const [formB, setFormB] = useState<BirthFormState | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [question, setQuestion] = useState('');
  const [analysisError, setAnalysisError] = useState(false);
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
        body: JSON.stringify({ chartA: cA, chartB: cB, question: q ?? undefined }),
      });
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
  }, [chartA, chartB, formA, formB, generateChart]);

  return (
    <div className="heming-page">
      <header className="heming-header">
        <button type="button" className="page-back" onClick={() => router.push('/')}>← 返回</button>
        <span className="heming-header-title">合盘分析</span>
        <span className="heming-header-note">感情 · 合伙 · 亲子 · 朋友</span>
      </header>

      <main className="heming-main">
        <div className="heming-intro">
          <span className="eyebrow">Compatibility · 双方互参</span>
          <h1>紫微合盘</h1>
          <p>输入两个人的出生信息，AI 基于倪海厦体系分析双方命盘的缘分匹配度、感情走向与相处建议</p>
        </div>

        <div className="heming-grid">
          <section className="heming-person">
            <span className="heming-person-label">甲方 — A</span>
            <BirthForm hideSubmit onSubmit={() => {}} onFormSave={setFormA} />
          </section>
          <section className="heming-person">
            <span className="heming-person-label">乙方 — B</span>
            <BirthForm hideSubmit onSubmit={() => {}} onFormSave={setFormB} />
          </section>
        </div>

        <section ref={analysisRef} className={`heming-analysis ${!analysis && !analyzing ? 'empty' : ''}`}>
          <div className="heming-analysis-title">合盘分析 · HEMING</div>
          {!analysis && !analyzing && (
            <div className="heming-empty-content">
              <p>填好双方出生信息后，点击下方按钮<br />AI 将基于倪海厦体系深度分析两人缘分匹配度</p>
              <button type="button" className="btn-primary" onClick={() => runAnalysis()}>开始合盘分析</button>
              {formError && <div className="form-error">{formError}</div>}
            </div>
          )}
          {analyzing && !analysis && <div className="analysis-loading" role="status"><span className="ink-spinner" />正在对比双方命盘…</div>}
          {analysis && <AiContent text={analysis} streaming={analyzing} />}
          {analysisError && (
            <div className="analysis-error">
              {apiMissing
                ? '开源版不含合盘 AI 分析接口（/api/heming），需要你自己实现后才能用。两人的命盘可以分别到「排盘」页（/chart）查看。'
                : '分析暂时不可用，请重试。'}
            </div>
          )}
        </section>

        {analysis && (
          <div className="heming-followup">
            <div className="label-section">针对此次合盘继续追问</div>
            <div className="quick-questions">
              {['感情匹配度如何？', '适合合伙创业吗？', '两人结婚是否合适？', '哪方面最容易产生矛盾？', '财运是否互补？'].map(q => (
                <button type="button" className="quick-question" key={q} onClick={() => { setQuestion(q); runAnalysis(q); }} disabled={analyzing}>{q}</button>
              ))}
            </div>
            <div className="heming-question-row">
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !analyzing) runAnalysis(question || undefined); }}
                placeholder="继续追问，如：哪几年是两人感情关键期？"
                disabled={analyzing}
                className="input-base"
              />
              <button type="button" className="btn-primary" onClick={() => runAnalysis(question || undefined)} disabled={analyzing}>
                {analyzing ? '分析中…' : '继续追问'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
