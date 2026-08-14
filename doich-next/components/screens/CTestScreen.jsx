'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft, Clock, Flag, Star, RefreshCw, ChevronRight, ChevronLeft,
  CheckCircle2, AlertTriangle, Lightbulb, FileText, Crown,
} from 'lucide-react';
import {
  CTEST_TESTS, EXAM_SECONDS, GAPS_PER_TEXT, TEXTS_PER_TEST,
  CAT_TIPS, CTEST_LEVEL_HINT, buildTest, fmtClock, normAnswer,
} from '@/lib/ctest';
import { ctestIsProLocked, FREE_CTESTS } from '@/lib/plans';

const TOTAL_GAPS = GAPS_PER_TEXT * TEXTS_PER_TEST;

// ─────────────────────────────────────────────────────────────────────────────
export default function CTestScreen({ t, state, plan, onUpgrade, onBack, recordStat, completeStage, addXP, checkStreak }) {
  const [view,     setView]     = useState('menu');   // menu | exam | results
  const [testIdx,  setTestIdx]  = useState(0);
  const [textIdx,  setTextIdx]  = useState(0);
  const [answers,  setAnswers]  = useState({});       // { "textIdx-gapIndex": "…" }
  const [marked,   setMarked]   = useState({});       // { textIdx: true }
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [confirm,  setConfirm]  = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef    = useRef(null);
  const recordedRef = useRef(false);

  const texts = useMemo(() => buildTest(CTEST_TESTS[testIdx]), [testIdx]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setTimedOut(true);
          setView('results');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view]);

  // ── Scoring ────────────────────────────────────────────────────────────────
  const scores = useMemo(() => texts.map((txt, ti) => {
    let correct = 0;
    txt.parts.forEach(p => {
      if (p.type === 'gap' && normAnswer(answers[`${ti}-${p.gapIndex}`]) === normAnswer(p.missing)) correct++;
    });
    return { correct, total: txt.gapCount };
  }), [texts, answers]);

  const totalScore = scores.reduce((s, x) => s + x.correct, 0);
  const totalMax   = scores.reduce((s, x) => s + x.total, 0) || TOTAL_GAPS;

  // ── Error analysis by grammatical category ────────────────────────────────
  const analysis = useMemo(() => {
    const cats = {};
    const mistakes = [];
    let endOk = 0, endTot = 0, wordOk = 0, wordTot = 0;
    texts.forEach((txt, ti) => {
      txt.parts.forEach(p => {
        if (p.type !== 'gap') return;
        const user = answers[`${ti}-${p.gapIndex}`] || '';
        const ok   = normAnswer(user) === normAnswer(p.missing);
        const c    = p.cat || 'Sonstige';
        if (!cats[c]) cats[c] = { ok: 0, total: 0 };
        cats[c].total++;
        if (ok) cats[c].ok++;
        if (p.missing.length <= 3) { endTot++; if (ok) endOk++; }
        else                       { wordTot++; if (ok) wordOk++; }
        if (!ok) mistakes.push({ cat: c, word: p.stem + p.missing, stem: p.stem, user, textIdx: ti });
      });
    });
    return { cats, mistakes, endung: { ok: endOk, total: endTot }, wortschatz: { ok: wordOk, total: wordTot } };
  }, [texts, answers]);

  // ── Save result once per attempt ───────────────────────────────────────────
  const pct     = totalMax ? totalScore / totalMax : 0;
  const stars   = pct >= 0.87 ? 3 : pct >= 0.6 ? 2 : 1;
  const xpEarned = Math.round(totalScore * 2) + [0, 20, 60, 150][stars];

  useEffect(() => {
    if (view !== 'results' || recordedRef.current) return;
    recordedRef.current = true;
    for (let i = 0; i < totalMax; i++) recordStat?.('ctest', i < totalScore);
    completeStage?.(CTEST_TESTS[testIdx].id);
    addXP?.(xpEarned);
    checkStreak?.();
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ────────────────────────────────────────────────────────────────
  const startTest = idx => {
    if (ctestIsProLocked(plan, idx)) { onUpgrade?.(); return; }
    setTestIdx(idx);
    setTextIdx(0);
    setAnswers({});
    setMarked({});
    setTimeLeft(EXAM_SECONDS);
    setConfirm(false);
    setTimedOut(false);
    recordedRef.current = false;
    setView('exam');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const setAnswer = (ti, gi, v) => setAnswers(a => ({ ...a, [`${ti}-${gi}`]: v }));
  const filledCount = ti => texts[ti].parts.filter(
    p => p.type === 'gap' && normAnswer(answers[`${ti}-${p.gapIndex}`]) !== ''
  ).length;
  const totalFilled = texts.reduce((n, _, ti) => n + filledCount(ti), 0);

  const submit = () => {
    clearInterval(timerRef.current);
    setConfirm(false);
    setView('results');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const hasNext     = testIdx + 1 < CTEST_TESTS.length;
  const nextLocked  = hasNext && ctestIsProLocked(plan, testIdx + 1);

  if (view === 'menu')    return <CTestMenu    t={t} state={state} plan={plan} onUpgrade={onUpgrade}
                                    onBack={onBack} onStart={startTest} />;
  if (view === 'results') return <CTestResults t={t} test={CTEST_TESTS[testIdx]} texts={texts} answers={answers}
                                    scores={scores} totalScore={totalScore} totalMax={totalMax}
                                    stars={stars} xpEarned={xpEarned} analysis={analysis} timedOut={timedOut}
                                    onRetry={() => startTest(testIdx)}
                                    onNext={hasNext && !nextLocked ? () => startTest(testIdx + 1) : null}
                                    onUpgrade={nextLocked ? onUpgrade : null}
                                    onBack={() => setView('menu')} />;

  // ── Exam ───────────────────────────────────────────────────────────────────
  const txt   = texts[textIdx];
  const lowTime = timeLeft <= 300;

  return (
    <div className="af" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
      {/* Sticky exam bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, background: t.bgMain,
        paddingTop: 4, paddingBottom: 10, marginBottom: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <button onClick={() => setConfirm('quit')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: t.textMid, fontWeight: 700, fontSize: 13, padding: 0 }}>
            <ArrowLeft size={16} /> Гарах
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: t.textSoft }}>
            {totalFilled}/{totalMax} бөглөсөн
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: lowTime ? t.wrongBg : t.bgTag,
            color: lowTime ? t.wrong : t.text,
            padding: '5px 12px', borderRadius: 20, fontWeight: 800, fontSize: 14,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <Clock size={14} /> {fmtClock(timeLeft)}
          </div>
        </div>

        {/* Text tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {texts.map((x, i) => {
            const active = i === textIdx;
            const done   = filledCount(i) === x.gapCount;
            return (
              <button key={i} onClick={() => { setTextIdx(i); window.scrollTo(0, 0); }}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${active ? t.pinkBtn : t.border}`,
                  background: active ? t.pinkBtn : t.bgCard,
                  color: active ? t.pinkBtnText : t.textMid,
                  fontWeight: 800, fontSize: 12, position: 'relative',
                }}>
                {i + 1}-р текст
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
                  {filledCount(i)}/{x.gapCount}
                </div>
                {marked[i] && (
                  <Flag size={11} color={active ? t.pinkBtnText : '#bc0000'}
                    fill={active ? t.pinkBtnText : '#bc0000'} strokeWidth={0}
                    style={{ position: 'absolute', top: 4, right: 5 }} />
                )}
                {done && !marked[i] && (
                  <CheckCircle2 size={11} color={active ? t.pinkBtnText : t.correct}
                    style={{ position: 'absolute', top: 4, right: 5 }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text panel */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '20px 18px', boxShadow: t.shadow }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>
              TEXT {textIdx + 1} · {txt.gapCount} LÜCKEN
            </div>
            <div className="fd" style={{ fontSize: 18, fontWeight: 800, color: t.text, marginTop: 2 }}>
              {txt.title}
            </div>
          </div>
          <button onClick={() => setMarked(m => ({ ...m, [textIdx]: !m[textIdx] }))}
            title="Дараа шалгах гэж тэмдэглэх"
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              background: marked[textIdx] ? t.roseBg : t.bgTag,
              color: marked[textIdx] ? t.rose : t.textSoft,
              border: 'none', borderRadius: 12, padding: '7px 10px',
              cursor: 'pointer', fontWeight: 700, fontSize: 12,
            }}>
            <Flag size={13} /> {marked[textIdx] ? 'Тэмдэглэсэн' : 'Тэмдэглэх'}
          </button>
        </div>

        <GapText t={t} txt={txt} textIdx={textIdx} answers={answers} setAnswer={setAnswer}
          onLastGap={() => { if (textIdx + 1 < texts.length) { setTextIdx(textIdx + 1); window.scrollTo(0, 0); } }} />
      </div>

      {/* Bottom navigation */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14, marginBottom: 30 }}>
        <button disabled={textIdx === 0} onClick={() => { setTextIdx(i => i - 1); window.scrollTo(0, 0); }}
          style={{
            flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14,
            border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid,
            cursor: textIdx === 0 ? 'not-allowed' : 'pointer', opacity: textIdx === 0 ? 0.45 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          <ChevronLeft size={16} /> Өмнөх
        </button>
        {textIdx + 1 < texts.length ? (
          <button onClick={() => { setTextIdx(i => i + 1); window.scrollTo(0, 0); }}
            style={{
              flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14,
              border: 'none', background: t.pinkBtn, color: t.pinkBtnText, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: t.shadow,
            }}>
            Дараах <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => setConfirm('submit')}
            style={{
              flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14,
              border: 'none', background: t.pinkBtn, color: t.pinkBtnText, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: t.shadow,
            }}>
            Хариуг шалгах
          </button>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div onClick={() => setConfirm(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="au"
            style={{ background: t.bgCard, borderRadius: 22, padding: '24px 20px', maxWidth: 360, width: '100%', boxShadow: t.shadowLg }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: t.text, marginBottom: 8 }}>
              {confirm === 'quit' ? 'Шалгалтаас гарах уу?' : 'Хариуг илгээх үү?'}
            </div>
            <div style={{ color: t.textMid, fontSize: 14, lineHeight: 1.55, marginBottom: 18 }}>
              {confirm === 'quit'
                ? 'Одоогийн хариултууд хадгалагдахгүй.'
                : `${totalFilled}/${totalMax} лүк бөглөсөн байна. ${totalFilled < totalMax ? 'Үлдсэн лүкүүд буруу гэж тооцогдоно.' : ''}`}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirm(false)}
                style={{ flex: 1, padding: '13px', borderRadius: 14, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer' }}>
                Болих
              </button>
              <button onClick={() => { if (confirm === 'quit') { clearInterval(timerRef.current); setView('menu'); } else submit(); }}
                style={{ flex: 1, padding: '13px', borderRadius: 14, fontWeight: 800, fontSize: 14, border: 'none', background: confirm === 'quit' ? t.wrongBg : t.pinkBtn, color: confirm === 'quit' ? t.wrong : t.pinkBtnText, cursor: 'pointer' }}>
                {confirm === 'quit' ? 'Гарах' : 'Илгээх'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Gapped text with inline inputs ──────────────────────────────────────────
function GapText({ t, txt, textIdx, answers, setAnswer, onLastGap }) {
  const refs = useRef({});

  const focusGap = gi => {
    const el = refs.current[gi];
    if (el) { el.focus(); el.select?.(); }
    else onLastGap?.();
  };

  return (
    <div style={{ fontSize: 16, lineHeight: 2.5, color: t.text }}>
      {/* Sentence 1 — fully intact */}
      <span>{txt.first} </span>

      {txt.parts.map((p, i) => {
        if (p.type === 'plain') return <span key={i}>{p.text} </span>;
        const val = answers[`${textIdx}-${p.gapIndex}`] ?? '';
        const w   = Math.max(2.5, p.missing.length * 1.05);
        return (
          <span key={i} style={{ whiteSpace: 'nowrap' }}>
            {p.pre}
            <span style={{ fontWeight: 700 }}>{p.stem}</span>
            <input
              ref={el => { refs.current[p.gapIndex] = el; }}
              value={val}
              onChange={e => setAnswer(textIdx, p.gapIndex, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); focusGap(p.gapIndex + 1); }
              }}
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              aria-label={`Lücke ${p.gapIndex + 1}`}
              style={{
                width: `${w}ch`, minWidth: 34,
                padding: '2px 4px', margin: '0 1px',
                fontSize: 15.5, fontFamily: 'inherit', color: t.text,
                background: val ? t.pinkBg : t.bgInput,
                border: 'none', borderBottom: `2px solid ${val ? t.pink : t.border}`,
                borderRadius: '4px 4px 0 0', outline: 'none',
                textAlign: 'center',
              }}
            />
            {p.post}
          </span>
        );
      })}

      {/* Last sentence — fully intact */}
      <span> {txt.last}</span>
    </div>
  );
}

// ─── Menu: rules + test list ─────────────────────────────────────────────────
function CTestMenu({ t, state, plan, onUpgrade, onBack, onStart }) {
  const anyLocked = CTEST_TESTS.some((_, i) => ctestIsProLocked(plan, i));
  return (
    <div className="af" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 14, background: t.bgCard, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: t.shadow, flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em' }}>
            C-TEST · STUDIENKOLLEG
          </div>
          <div className="fd" style={{ fontSize: 20, fontWeight: 800, color: t.text }}>
            Текст нөхөх шалгалт
          </div>
        </div>
      </div>

      {/* Level hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
        background: t.skyBg, borderRadius: 14, padding: '10px 14px',
      }}>
        <AlertTriangle size={16} color={t.sky} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: t.sky, fontWeight: 700, lineHeight: 1.5 }}>
          {CTEST_LEVEL_HINT} түвшнээс дээш сурагчдад зөвлөж байна.
        </div>
      </div>

      {/* Rules card */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '18px 18px 16px', boxShadow: t.shadow, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={17} color={t.pink} />
          <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>C-Test-ийн дүрэм</div>
        </div>

        <ul style={{ margin: 0, paddingLeft: 18, color: t.textMid, fontSize: 13.5, lineHeight: 1.75 }}>
          <li><strong style={{ color: t.text }}>Эхний ба сүүлийн өгүүлбэр бүтэн</strong> үлдэнэ — сэдвээ ойлгоход тусална.</li>
          <li>2 дахь өгүүлбэрээс эхлэн <strong style={{ color: t.text }}>үг бүрийн хоёр дахь</strong> үгний <strong style={{ color: t.text }}>хоёр дахь хагас нь</strong> устсан байна.</li>
          <li>Үсгийн тоо сондгой бол <strong style={{ color: t.text }}>том хагас нь</strong> устана (ж: <em>Gehirn</em> → <em>Geh___</em>).</li>
          <li>1 үсэгтэй үг болон тоо тоологдохгүй, хэвээрээ үлдэнэ.</li>
          <li>Нэг текстэд <strong style={{ color: t.text }}>{GAPS_PER_TEXT} лүк</strong>, нийт <strong style={{ color: t.text }}>{TEXTS_PER_TEST} текст = {TOTAL_GAPS} оноо</strong>.</li>
          <li>Хугацаа: <strong style={{ color: t.text }}>30 минут</strong> (нийт 4 текстэд). Текст тус бүрд ~7 минут төлөвлө.</li>
          <li>Зөв бичлэг чухал: үсэг дутуу/илүү бол буруу гэж тооцогдоно.</li>
        </ul>

        {/* Worked example */}
        <div style={{ background: t.bgInput, borderRadius: 14, padding: '12px 14px', marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.1em', marginBottom: 6 }}>
            ЖИШЭЭ
          </div>
          <div style={{ fontSize: 14, color: t.text, lineHeight: 1.9 }}>
            Das <strong>Geh___</strong> verarbeitet <strong>i_</strong> Schlaf <strong>d__</strong> vielen Informationen.
          </div>
          <div style={{ fontSize: 13, color: t.textMid, marginTop: 8, lineHeight: 1.7 }}>
            → <em>Gehirn</em> (6 үсэг, 3 нь устсан) · <em>im</em> (2 үсэг, 1 устсан) · <em>die</em> (3 үсэг — сондгой тул <strong>2</strong> устсан).
            <br />Тиймээс хариулт нь: <strong style={{ color: t.pink }}>irn</strong> · <strong style={{ color: t.pink }}>m</strong> · <strong style={{ color: t.pink }}>ie</strong> — өөрөөр хэлбэл <u>зөвхөн дутуу хэсгийг</u> бичнэ.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12 }}>
          <Lightbulb size={15} color={t.pink} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12.5, color: t.textMid, lineHeight: 1.65 }}>
            Зөвлөгөө: эхлээд бүтэн текстээ уншиж, дараа нь амархан лүкүүдийг бөглө. Артикль, угтвар үг, холбоос үгс хамгийн олон оноо өгдөг.
          </div>
        </div>
      </div>

      {/* Test list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>
          Шалгалтууд ({CTEST_TESTS.length})
        </div>
        {anyLocked && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: t.textSoft }}>
            Эхний {FREE_CTESTS} нь үнэгүй
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
        {CTEST_TESTS.map((test, i) => {
          const done     = !!state?.completedStages?.[test.id];
          const isLocked = ctestIsProLocked(plan, i);
          return (
            <button key={test.id} onClick={() => isLocked ? onUpgrade?.() : onStart(i)} className="au"
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                background: t.bgCard,
                border: `1px solid ${isLocked ? 'rgba(255,111,168,0.35)' : done ? t.correct + '55' : t.border}`,
                borderLeft: `4px solid ${isLocked ? '#FF6FA8' : done ? t.correct : t.pinkBtn}`,
                borderRadius: 16, padding: '14px 14px', cursor: 'pointer', textAlign: 'left',
                boxShadow: t.shadow, animationDelay: `${Math.min(i * 35, 240)}ms`,
                opacity: isLocked ? 0.85 : 1,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: isLocked ? 'linear-gradient(135deg, rgba(255,111,168,0.18), rgba(167,139,250,0.18))'
                          : done     ? t.correctBg : t.pinkBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: done ? t.correct : t.pink,
              }}>
                {isLocked ? <Crown size={18} color="#FF6FA8" strokeWidth={2} />
                 : done   ? <Star size={18} color={t.correct} fill={t.correct} strokeWidth={0} />
                          : i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: t.text }}>{test.name}</div>
                  {isLocked && (
                    <span style={{
                      background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)', color: '#fff',
                      borderRadius: 7, padding: '2px 7px', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.04em',
                    }}>
                      PRO
                    </span>
                  )}
                </div>
                <div style={{
                  color: t.textSoft, fontSize: 11.5, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {test.texts.map(x => x.title.split(' –')[0]).join(' · ')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: t.textSoft, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                <Clock size={12} /> 30′
              </div>
              <ChevronRight size={18} color={isLocked ? '#FF6FA8' : t.textSoft} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────
function CTestResults({ t, test, texts, answers, scores, totalScore, totalMax, stars, xpEarned, analysis, timedOut, onRetry, onNext, onUpgrade, onBack }) {
  const [openText, setOpenText] = useState(null);
  const pct = totalMax ? Math.round((totalScore / totalMax) * 100) : 0;

  const verdict = pct >= 80 ? 'Маш сайн — тэнцэх магадлал өндөр! 🎉'
                : pct >= 60 ? 'Сайн — жаахан өнгөлбөл гарцаагүй тэнцэнэ 💪'
                : 'Дасгал хэрэгтэй — артикль, төгсгөл, тогтмол хэллэгээ давт 📖';

  const catRows = Object.entries(analysis.cats)
    .map(([name, v]) => ({ name, ...v, pct: v.total ? v.ok / v.total : 0 }))
    .sort((a, b) => a.pct - b.pct);
  const weakest = catRows.filter(c => c.total >= 3 && c.pct < 0.8).slice(0, 3);

  const Bar = ({ value, color }) => (
    <div style={{ height: 8, background: t.bgTag, borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.round(value * 100)}%`, background: color, borderRadius: 4 }} />
    </div>
  );

  return (
    <div className="af" style={{ maxWidth: 720, margin: '0 auto', width: '100%', paddingBottom: 30 }}>
      {/* Score header */}
      <div style={{ textAlign: 'center', paddingTop: 12 }}>
        <div style={{ fontSize: 60 }} className="ap">{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '✨'}</div>
        <div className="fd" style={{ fontSize: 24, fontWeight: 800, color: t.text, marginTop: 4 }}>
          {test.name} дууслаа
        </div>
        {timedOut && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: t.wrongBg, color: t.wrong, borderRadius: 20, padding: '5px 14px', fontSize: 12.5, fontWeight: 800 }}>
            <Clock size={13} /> Хугацаа дууссан
          </div>
        )}
      </div>

      <div style={{ background: t.bgCard, borderRadius: 24, padding: 24, boxShadow: t.shadowLg, margin: '18px 0 16px', textAlign: 'center' }}>
        <div className="fd" style={{ fontSize: 48, fontWeight: 800, color: t.text }}>
          {totalScore}<span style={{ fontSize: 22, color: t.textMid }}>/{totalMax}</span>
        </div>
        <div style={{ color: t.textMid, fontSize: 14, marginTop: 2 }}>{pct}% зөв</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '14px 0' }}>
          {[1, 2, 3].map(s => (
            <Star key={s} size={30} color={s <= stars ? '#FFAA00' : t.border} fill={s <= stars ? '#FFAA00' : t.border} strokeWidth={0} />
          ))}
        </div>
        <div style={{ color: t.textMid, fontSize: 13.5, lineHeight: 1.55 }}>{verdict}</div>
        {xpEarned > 0 && (
          <div className="ap" style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(90deg,#FF6FA8,#A78BFA)', borderRadius: 20, padding: '8px 20px' }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>+{xpEarned} XP</span>
          </div>
        )}
      </div>

      {/* Per-text scores */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '16px 16px 8px', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 12 }}>Текст тус бүрээр</div>
        {texts.map((x, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
              <div style={{ fontSize: 13, color: t.textMid, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {i + 1}. {x.title}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: t.text, flexShrink: 0 }}>
                {scores[i].correct}/{scores[i].total}
              </div>
            </div>
            <Bar value={scores[i].correct / scores[i].total} color={t.pinkBtn} />
          </div>
        ))}
      </div>

      {/* Endung vs Wortschatz */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {[
          { l: 'Төгсгөл / богино үг', d: '≤ 3 үсэг', v: analysis.endung,     c: '#0062a1', bg: t.skyBg },
          { l: 'Үгийн сан',            d: '> 3 үсэг', v: analysis.wortschatz, c: '#006d3a', bg: t.mintBg },
        ].map(row => (
          <div key={row.l} style={{ flex: 1, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 18, padding: '14px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: t.text }}>{row.l}</div>
            <div style={{ fontSize: 10.5, color: t.textSoft, marginBottom: 8 }}>{row.d}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: row.c }}>
              {row.v.total ? Math.round((row.v.ok / row.v.total) * 100) : 0}%
            </div>
            <div style={{ fontSize: 11, color: t.textSoft, marginBottom: 6 }}>{row.v.ok}/{row.v.total}</div>
            <Bar value={row.v.total ? row.v.ok / row.v.total : 0} color={row.c} />
          </div>
        ))}
      </div>

      {/* Category analysis */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '16px 16px 10px', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 12 }}>Дүрмийн ангиллаар</div>
        {catRows.map(c => (
          <div key={c.name} style={{ marginBottom: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 13, color: t.textMid, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: c.pct >= 0.8 ? t.correct : c.pct >= 0.5 ? t.pink : t.wrong }}>
                {c.ok}/{c.total}
              </div>
            </div>
            <Bar value={c.pct} color={c.pct >= 0.8 ? t.correct : c.pct >= 0.5 ? t.pinkBtn : t.wrong} />
          </div>
        ))}
      </div>

      {/* Tips for weakest categories */}
      {weakest.length > 0 && (
        <div style={{ background: t.pinkBg, borderRadius: 20, padding: '16px 16px 8px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Lightbulb size={16} color={t.pink} />
            <div style={{ fontWeight: 800, fontSize: 14, color: t.pink }}>Юуг давтах вэ</div>
          </div>
          {weakest.map(c => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: t.text, marginBottom: 3 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: t.textMid, lineHeight: 1.6 }}>{CAT_TIPS[c.name] || '—'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Mistake review per text */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, padding: '16px', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: t.text, marginBottom: 4 }}>
          Алдаа шалгах ({analysis.mistakes.length})
        </div>
        <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 12 }}>
          Текст дээр дарж бүх хариултаа харна уу.
        </div>
        {texts.map((x, i) => {
          const open = openText === i;
          const wrong = analysis.mistakes.filter(m => m.textIdx === i);
          return (
            <div key={i} style={{ borderTop: `1px solid ${t.border}`, paddingTop: 10, marginTop: 10 }}>
              <button onClick={() => setOpenText(open ? null : i)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: t.text }}>{i + 1}. {x.title}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: wrong.length ? t.wrong : t.correct }}>
                  {wrong.length ? `${wrong.length} алдаа` : 'Бүгд зөв'}
                </div>
                <ChevronRight size={16} color={t.textSoft} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {open && (
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 2.3, color: t.text }}>
                  <span style={{ color: t.textMid }}>{x.first} </span>
                  {x.parts.map((p, k) => {
                    if (p.type === 'plain') return <span key={k} style={{ color: t.textMid }}>{p.text} </span>;
                    const user = answers[`${i}-${p.gapIndex}`] || '';
                    const ok   = normAnswer(user) === normAnswer(p.missing);
                    return (
                      <span key={k} style={{ whiteSpace: 'nowrap' }}>
                        {p.pre}
                        <span style={{
                          background: ok ? t.correctBg : t.wrongBg,
                          color: ok ? t.correct : t.wrong,
                          borderRadius: 6, padding: '2px 5px', fontWeight: 700,
                        }}>
                          {p.stem}<u>{p.missing}</u>
                        </span>
                        {!ok && user && (
                          <span style={{ fontSize: 11.5, color: t.wrong, textDecoration: 'line-through', marginLeft: 3 }}>
                            {p.stem}{user}
                          </span>
                        )}
                        {p.post}
                      </span>
                    );
                  })}
                  <span style={{ color: t.textMid }}> {x.last}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {onNext && (
          <button onClick={onNext}
            style={{ width: '100%', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 15, border: 'none', background: t.pinkBtn, color: t.pinkBtnText, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: t.shadowLg }}>
            Дараагийн C-Test <ChevronRight size={18} />
          </button>
        )}
        {!onNext && onUpgrade && (
          <button onClick={onUpgrade}
            style={{ width: '100%', padding: '16px', borderRadius: 16, fontWeight: 800, fontSize: 15, border: 'none', background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(255,111,168,0.35)' }}>
            <Crown size={18} /> Pro авах — бүх C-Test нээх
          </button>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack}
            style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer' }}>
            ← Жагсаалт
          </button>
          <button onClick={onRetry}
            style={{ flex: 1, padding: '14px', borderRadius: 16, fontWeight: 800, fontSize: 14, border: `2px solid ${t.border}`, background: 'transparent', color: t.textMid, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RefreshCw size={15} /> Дахин
          </button>
        </div>
      </div>
    </div>
  );
}
