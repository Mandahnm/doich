'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Clock, CheckCircle, ChevronRight, BookOpen,
  ArrowLeft, Plus, Check, X, Play, Pause, Crown,
} from 'lucide-react';
import { WithSkeleton, ReadingSkeleton } from '@/components/shared/ScreenSkeleton';
import MultiChips from '@/components/shared/MultiChips';
import { CEFR_META, LEVELS, VOCAB } from '@/lib/vocab';
import { storyIsProLocked } from '@/lib/plans';
import { supabase } from '@/lib/supabase';
import { calcStageXP } from '@/lib/xp';

// ─────────────────────────────────────────────────────────────────────────────
//  Utilities
// ─────────────────────────────────────────────────────────────────────────────

// Splits "Hallo, wie geht's?" → [{word "Hallo"},{punct ","},{space},{word "wie"},…]
// Only word tokens (clean !== '') get the tappable treatment.
function tokenizeText(text) {
  const result = [];
  text.split(/(\s+)/).forEach(part => {
    if (/^\s+$/.test(part)) {
      result.push({ raw: part, clean: '' });
      return;
    }
    const m = part.match(/^([^a-zA-ZÄäÖöÜüß]*)([\wÄäÖöÜüß][\w\-ÄäÖöÜüß]*)([^a-zA-ZÄäÖöÜüß]*)$/);
    if (m) {
      if (m[1]) result.push({ raw: m[1], clean: '' });
      if (m[2]) result.push({ raw: m[2], clean: m[2] });
      if (m[3]) result.push({ raw: m[3], clean: '' });
    } else {
      result.push({ raw: part, clean: '' });
    }
  });
  return result;
}

// Splits a paragraph into sentences on ". " / "! " / "? "
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

// Builds a flat sentence map with fractional start/end positions (0–1)
// so the audio player can highlight the right sentence from currentTime.
function buildSentenceMap(body) {
  const rows = [];
  let totalChars = 0;
  (body || []).forEach((para, paraIdx) => {
    splitSentences(para.text).forEach((text, sentIdx) => {
      rows.push({ paraIdx, sentIdx, chars: text.length + 1 }); // +1 for space
      totalChars += text.length + 1;
    });
  });
  let cum = 0;
  rows.forEach(r => {
    r.start = cum / Math.max(totalChars, 1);
    cum += r.chars;
    r.end = cum / Math.max(totalChars, 1);
  });
  return rows;
}

// 1. Story new_words exact/article-stripped  2. Full VOCAB
const ART_RE = /^(der|die|das|sich)\s+/i;
function lookupTranslation(clean, newWords) {
  if (!clean || clean.length < 2) return null;
  const key = clean.toLowerCase();
  for (const w of newWords || []) {
    const de = w.de.toLowerCase();
    if (de === key || de.replace(ART_RE, '') === key)
      return { mn: w.mn, de: w.de };
  }
  const hit = VOCAB.find(w => {
    const de = w.de.toLowerCase();
    return de === key || de.replace(ART_RE, '') === key;
  });
  return hit ? { mn: hit.mn, de: hit.de, id: hit.id } : null;
}

const fmtTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ─────────────────────────────────────────────────────────────────────────────
export default function ReadingScreen({ t, state, user, addXP, checkStreak, toggleLearned, addCustomWord, plan, onUpgrade }) {
  return (
    <WithSkeleton ms={250} skeleton={<ReadingSkeleton t={t} />}>
      <ReadingScreenInner
        t={t} state={state} user={user}
        addXP={addXP} checkStreak={checkStreak}
        toggleLearned={toggleLearned} addCustomWord={addCustomWord}
        plan={plan} onUpgrade={onUpgrade}
      />
    </WithSkeleton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Inner — manages view state + Supabase data
// ─────────────────────────────────────────────────────────────────────────────
function ReadingScreenInner({ t, state, user, addXP, checkStreak, toggleLearned, addCustomWord, plan, onUpgrade }) {
  const [view,          setView]          = useState('list');
  const [stories,       setStories]       = useState([]);
  const [progress,      setProgress]      = useState({});
  const [fetching,      setFetching]      = useState(true);
  const [levelFilter,   setLevelFilter]   = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isDesktop,     setIsDesktop]     = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { fetchStories(); }, []);
  useEffect(() => { if (user) fetchProgress(); }, [user]);

  const fetchStories = async () => {
    const { data } = await supabase
      .from('stories').select('*')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true });
    setStories(data || []);
    setFetching(false);
  };

  const fetchProgress = async () => {
    const { data } = await supabase
      .from('user_story_progress').select('*')
      .eq('user_id', user.id);
    const map = {};
    (data || []).forEach(p => { map[p.story_id] = p; });
    setProgress(map);
  };

  const refreshProgress = () => { if (user) fetchProgress(); };
  const openStory       = story => { setSelectedStory(story); setView('preview'); };
  const backToList      = ()    => { setSelectedStory(null);  setView('list');    refreshProgress(); };

  if (view !== 'list' && selectedStory) {
    return (
      <StoryView
        view={view} setView={setView}
        story={selectedStory} storyProgress={progress[selectedStory.id]}
        t={t} state={state} user={user}
        addXP={addXP} checkStreak={checkStreak}
        toggleLearned={toggleLearned} addCustomWord={addCustomWord}
        onBack={backToList} onProgressUpdate={refreshProgress}
        isDesktop={isDesktop}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  const toggleFilter = v => setLevelFilter(f => f.includes(v) ? f.filter(x => x !== v) : [...f, v]);
  const filtered       = levelFilter.length === 0 ? stories : stories.filter(s => levelFilter.includes(s.level));
  const completedCount = Object.values(progress).filter(p => p?.completed).length;

  const grouped = LEVELS.reduce((acc, lv) => {
    const items = filtered.filter(s => s.level === lv);
    if (items.length) acc[lv] = items;
    return acc;
  }, {});

  const getReadingTime = story =>
    Math.max(1, Math.round(
      (story.body || []).reduce((n, p) => n + (p.text || '').split(/\s+/).length, 0) / 80
    ));

  const StoryCard = ({ story, idx, storyIndexInLevel }) => {
    const done         = progress[story.id]?.completed;
    const meta         = CEFR_META[story.level];
    const isProLocked  = storyIsProLocked(plan, storyIndexInLevel);
    return (
      <div className="au" onClick={() => isProLocked ? onUpgrade() : openStory(story)}
        style={{
          background: t.bgCard, borderRadius: 20,
          border: `1px solid ${isProLocked ? 'rgba(255,111,168,0.35)' : done ? t.correct + '55' : t.border}`,
          overflow: 'hidden', cursor: 'pointer', position: 'relative',
          boxShadow: t.shadow, animationDelay: `${Math.min(idx * 40, 240)}ms`,
          opacity: isProLocked ? 0.85 : 1,
        }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: isProLocked ? '#FF6FA8' : meta.pill }} />
        {/* Pro badge */}
        {isProLocked && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'linear-gradient(135deg, #FF6FA8, #A78BFA)',
            borderRadius: 8, padding: '3px 9px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Crown size={10} color="#fff" />
            <span style={{ fontSize: 10, color: '#fff', fontWeight: 800 }}>PRO</span>
          </div>
        )}
        <div style={{ padding: '14px 14px 14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ background: isProLocked ? 'rgba(255,111,168,0.15)' : meta.pill, color: isProLocked ? '#FF6FA8' : meta.pillTxt, fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, letterSpacing: '0.04em' }}>
              {story.level} · {meta.title}
            </span>
            {done && !isProLocked ? <CheckCircle size={18} color={t.correct} strokeWidth={2.5} /> : !isProLocked ? <ChevronRight size={16} color={t.textSoft} /> : null}
          </div>
          <div className="fd" style={{ fontSize: 15, fontWeight: 800, color: isProLocked ? t.textMid : t.text, lineHeight: 1.35, marginBottom: 10 }}>
            {story.title}
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.textMid }}>
              <Clock size={11} /> {getReadingTime(story)} мин
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: t.textMid }}>
              <BookOpen size={11} /> {(story.new_words || []).length} шинэ үг
            </span>
            {done && !isProLocked && (
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: t.correct, background: t.correctBg, padding: '2px 8px', borderRadius: 6 }}>
                ✓ Дууссан
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ListBody = () => (
    <>
      <MultiChips label="ТҮВШИН" t={t} opts={LEVELS} selected={levelFilter}
        onToggle={toggleFilter} onClear={() => setLevelFilter([])} rLabel={v => v} />
      {fetching ? (
        <div style={{ color: t.textSoft, fontSize: 13, padding: '24px 0' }}>Уншиж байна…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: t.textMid, padding: '48px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>Энэ түвшинд өгүүллэг олдсонгүй
        </div>
      ) : (
        Object.entries(grouped).map(([level, items]) => (
          <div key={level} style={{ marginBottom: 28 }}>
            {levelFilter.length !== 1 && (
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: t.textSoft, marginBottom: 10 }}>
                {level} · {CEFR_META[level].title.toUpperCase()} — {items.length} өгүүллэг
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 10 }}>
              {items.map((s, i) => <StoryCard key={s.id} story={s} idx={i} storyIndexInLevel={i} />)}
            </div>
          </div>
        ))
      )}
    </>
  );

  if (isDesktop) {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 4 }}>УНШЛАГА 📚</div>
          <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text }}>Өгүүллэгийн сан</div>
          <div style={{ color: t.textSoft, fontSize: 13, marginTop: 2 }}>{stories.length} өгүүллэг · {completedCount} дууссан</div>
        </div>
        <ListBody />
      </div>
    );
  }
  return (
    <div className="af">
      <div style={{ marginBottom: 16 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 2 }}>УНШЛАГА 📚</div>
        <div className="fd" style={{ fontSize: 26, fontWeight: 800, color: t.text }}>Өгүүллэгийн сан</div>
        <div style={{ color: t.textSoft, fontSize: 12, marginTop: 2 }}>{stories.length} өгүүллэг · {completedCount} дууссан</div>
      </div>
      <ListBody />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  StoryView — routes preview → reader → quiz
// ─────────────────────────────────────────────────────────────────────────────
function StoryView({ view, setView, story, storyProgress, t, state, user, addXP, checkStreak, toggleLearned, addCustomWord, onBack, onProgressUpdate, isDesktop }) {
  if (view === 'preview')   return <NewWordsPreview story={story} t={t} onStart={() => setView('reader')} onBack={onBack} isDesktop={isDesktop} />;
  if (view === 'reader')    return <StoryReader story={story} t={t} state={state} toggleLearned={toggleLearned} addCustomWord={addCustomWord} onBack={onBack} onFinish={() => setView('quiz')} isDesktop={isDesktop} />;
  if (view === 'flashcard') return <VocabFlashcard story={story} t={t} state={state} toggleLearned={toggleLearned} addCustomWord={addCustomWord} onDone={onBack} />;
  if (view === 'quiz') {
    return (
      <QuizView
        story={story} t={t} state={state} user={user}
        addXP={addXP} checkStreak={checkStreak}
        onBack={onBack} onProgressUpdate={onProgressUpdate}
        isDesktop={isDesktop}
        onReadAgain={() => setView('reader')}
        onFlashcard={() => setView('flashcard')}
      />
    );
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  NewWordsPreview
// ─────────────────────────────────────────────────────────────────────────────
function NewWordsPreview({ story, t, onStart, onBack, isDesktop }) {
  const meta  = CEFR_META[story.level];
  const words = story.new_words || [];
  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em' }}>ШИНЭ ҮГИЙН УРЬДЧИЛСАН ХАРАГДАЦ</div>
          <div className="fd" style={{ fontSize: 16, fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.title}</div>
        </div>
        <span style={{ background: meta.pill, color: meta.pillTxt, fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 6, flexShrink: 0 }}>{story.level}</span>
      </div>
      <div style={{ background: t.pinkBg, border: `1px solid ${t.pink}30`, borderRadius: 16, padding: '12px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.pink, marginBottom: 2 }}>📖 Уншихийн өмнө эдгээр үгийг тогтоогоорой</div>
        <div style={{ fontSize: 12, color: t.textMid }}>{words.length} шинэ үг энэ өгүүллэгт гарч ирнэ. Тэдгээрийг цээцжилсэн бол уншихад илүү хялбар болно.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3,1fr)' : 'repeat(2,1fr)', gap: 10, marginBottom: 28 }}>
        {words.map((w, i) => (
          <div key={i} className="au" style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 5, animationDelay: `${i * 45}ms` }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, lineHeight: 1.3 }}>{w.de}</div>
            <div style={{ fontSize: 12, color: t.textMid, lineHeight: 1.4 }}>{w.mn}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%' }}>
        Унших эхлэх →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ParagraphBlock — module scope so React never unmounts on StoryReader re-render
// ─────────────────────────────────────────────────────────────────────────────
function ParagraphBlock({ para, activeSentIdx, onWordTap, newWords, t, isAdded }) {
  const sentences = splitSentences(para.text);
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 16, lineHeight: 1.8, color: t.text, wordBreak: 'break-word' }}>
        {sentences.map((sentence, sentIdx) => {
          const isActive = activeSentIdx === sentIdx;
          const tokens   = tokenizeText(sentence);
          return (
            <span key={sentIdx}>
              <span style={{
                background:   isActive ? t.pinkBg : 'transparent',
                borderRadius: isActive ? 5 : 0,
                padding:      isActive ? '2px 3px' : '2px 0',
                transition:   'background 0.35s ease',
                display:      'inline',
              }}>
                {tokens.map((tok, i) => {
                  if (!tok.clean) return <span key={i}>{tok.raw}</span>;
                  const found = lookupTranslation(tok.clean, newWords);
                  const added = isAdded(tok.clean);
                  return (
                    <span key={i} onClick={e => onWordTap(e, tok.clean)}
                      style={{
                        cursor: 'pointer', borderRadius: 3, padding: '1px 0',
                        color: added ? t.correct : (isActive ? t.pink : t.text),
                        borderBottom: found
                          ? `2px solid ${added ? t.correct + '90' : t.pink + '70'}`
                          : '2px solid transparent',
                        transition: 'color 0.15s',
                      }}>
                      {tok.raw}
                    </span>
                  );
                })}
              </span>
              {sentIdx < sentences.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
      {para.translation && (
        <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: t.textSoft, fontStyle: 'italic', paddingLeft: 14, borderLeft: `3px solid ${t.border}` }}>
          {para.translation}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  StoryReader — tappable text + audio player + sentence highlighting
// ─────────────────────────────────────────────────────────────────────────────
function StoryReader({ story, t, state, toggleLearned, addCustomWord, onBack, onFinish, isDesktop }) {
  const [popup,          setPopup]          = useState(null);
  const [addedWords,     setAddedWords]     = useState(new Set());
  const [activeSentence, setActiveSentence] = useState(null); // { paraIdx, sentIdx }

  // Build sentence map once per story for audio sync
  const sentenceMap = useRef(buildSentenceMap(story.body)).current;

  const handleWordTap = (e, clean) => {
    e.stopPropagation();
    if (!clean || clean.length < 2) return;
    const rect    = e.currentTarget.getBoundingClientRect();
    const POPUP_W = 236;
    let x = rect.left;
    let y = rect.bottom + 8;
    if (x + POPUP_W > window.innerWidth - 10) x = window.innerWidth - POPUP_W - 10;
    if (x < 8) x = 8;
    if (y + 140 > window.innerHeight - 16) y = rect.top - 140 - 8;
    setPopup({ clean, x, y });
  };

  const handleAddWord = clean => {
    const found = lookupTranslation(clean, story.new_words);
    if (found?.id !== undefined) toggleLearned(found.id);
    else addCustomWord(clean, found?.mn || '');
    setAddedWords(prev => new Set([...prev, clean.toLowerCase()]));
    setPopup(null);
  };

  const isAdded = clean => {
    if (addedWords.has(clean.toLowerCase())) return true;
    const hit = VOCAB.find(w => w.de.toLowerCase() === clean.toLowerCase());
    return hit ? state.learnedWords.includes(hit.id) : false;
  };

  // Called by AudioPlayer on every timeupdate
  const handleTimeUpdate = (currentTime, duration) => {
    if (!duration) return;
    const frac = currentTime / duration;
    const hit  = sentenceMap.find(s => frac >= s.start && frac < s.end);
    setActiveSentence(hit ? { paraIdx: hit.paraIdx, sentIdx: hit.sentIdx } : null);
  };

  const popupTranslation = popup ? lookupTranslation(popup.clean, story.new_words) : null;

  return (
    <div className="af" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em' }}>{story.level} · {CEFR_META[story.level].title.toUpperCase()}</div>
          <div className="fd" style={{ fontSize: 16, fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.title}</div>
        </div>
      </div>

      {/* Audio player — only when story has audio */}
      {story.audio_url && (
        <AudioPlayer audioUrl={story.audio_url} t={t} onTimeUpdate={handleTimeUpdate} />
      )}

      {/* Tap hint */}
      <div style={{ background: t.bgTag, borderRadius: 12, padding: '8px 14px', marginBottom: 18, fontSize: 12, color: t.textMid, display: 'flex', alignItems: 'center', gap: 8 }}>
        💡 Тодорсон үгийг дарж орчуулга харна уу
      </div>

      {/* Story body */}
      <div style={{ background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, padding: isDesktop ? '28px 32px' : '20px 18px', boxShadow: t.shadow, marginBottom: 24 }}>
        {(story.body || []).map((para, i) => (
          <ParagraphBlock
            key={i} para={para} paraIdx={i}
            activeSentIdx={activeSentence?.paraIdx === i ? activeSentence.sentIdx : null}
            onWordTap={handleWordTap}
            newWords={story.new_words}
            t={t}
            isAdded={isAdded}
          />
        ))}
      </div>

      {/* Actions */}
      <button onClick={onFinish} style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%', marginBottom: 8 }}>
        Асуулт →
      </button>
      <button onClick={onBack} style={{ background: 'transparent', color: t.textSoft, fontWeight: 600, fontSize: 13, border: 'none', borderRadius: 12, padding: '8px 0', cursor: 'pointer', width: '100%' }}>
        ← Жагсаалт руу буцах
      </button>

      {/* Floating word popup */}
      {popup && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setPopup(null)} />
          <WordPopup
            clean={popup.clean} translation={popupTranslation}
            x={popup.x} y={popup.y} t={t}
            isAdded={isAdded(popup.clean)}
            onAdd={() => handleAddWord(popup.clean)}
            onClose={() => setPopup(null)}
          />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AudioPlayer — play/pause, speed toggle, seek bar, sentence sync
// ─────────────────────────────────────────────────────────────────────────────
function AudioPlayer({ audioUrl, t, onTimeUpdate }) {
  const audioRef  = useRef(null);
  const [playing,  setPlaying]  = useState(false);
  const [speed,    setSpeed]    = useState(1);
  const [current,  setCurrent]  = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    // Keep pitch stable at all speeds
    a.preservesPitch       = true;
    a.mozPreservesPitch    = true;
    a.webkitPreservesPitch = true;

    const onMeta  = () => setDuration(a.duration || 0);
    const onTime  = () => { setCurrent(a.currentTime); onTimeUpdate?.(a.currentTime, a.duration); };
    const onEnded = () => setPlaying(false);

    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('timeupdate',     onTime);
    a.addEventListener('ended',          onEnded);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('timeupdate',     onTime);
      a.removeEventListener('ended',          onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else         { await a.play(); setPlaying(true); }
  };

  const changeSpeed = s => {
    setSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };

  const seek = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audioRef.current && duration) audioRef.current.currentTime = frac * duration;
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div style={{
      background: t.bgCard, border: `1px solid ${t.border}`,
      borderRadius: 16, padding: '12px 14px', marginBottom: 16,
      boxShadow: t.shadow,
    }}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Play / Pause */}
        <button onClick={togglePlay}
          style={{
            width: 40, height: 40, borderRadius: 12, border: 'none',
            background: t.pinkBtn, color: t.pinkBtnText,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
          {playing ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} />}
        </button>

        {/* Progress bar + time */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          {/* Seek bar */}
          <div onClick={seek}
            style={{ height: 6, background: t.bgTag, borderRadius: 3, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${pct}%`, background: t.pinkBtn,
              borderRadius: 3, transition: 'width 0.25s linear',
            }} />
          </div>
          {/* Time labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textSoft, fontWeight: 600 }}>
            <span>{fmtTime(current)}</span>
            <span>{duration ? fmtTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Speed chips */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {[0.5, 1, 2].map(s => (
            <button key={s} onClick={() => changeSpeed(s)}
              style={{
                padding: '4px 7px', borderRadius: 8, border: 'none',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: speed === s ? t.pinkBtn : t.bgTag,
                color:      speed === s ? t.pinkBtnText : t.textMid,
                transition: 'all 0.15s',
              }}>
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  WordPopup
// ─────────────────────────────────────────────────────────────────────────────
function WordPopup({ clean, translation, x, y, t, isAdded, onAdd, onClose }) {
  return (
    <div data-popup onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', left: x, top: y, zIndex: 200, width: 236,
        background: t.bgCard, border: `1.5px solid ${t.border}`,
        borderRadius: 18, padding: '14px 16px 12px',
        boxShadow: t.shadowLg,
      }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}>
        <X size={14} color={t.textSoft} />
      </button>
      <div style={{ fontSize: 19, fontWeight: 800, color: t.text, paddingRight: 22, lineHeight: 1.2, marginBottom: 4 }}>
        {translation?.de || clean}
      </div>
      {translation
        ? <div style={{ fontSize: 13, color: t.textMid, lineHeight: 1.45, marginBottom: 12 }}>{translation.mn}</div>
        : <div style={{ fontSize: 12, color: t.textSoft, fontStyle: 'italic', marginBottom: 12 }}>Орчуулга олдсонгүй</div>
      }
      <button onClick={isAdded ? undefined : onAdd} disabled={isAdded}
        style={{
          width: '100%', border: 'none', borderRadius: 10,
          cursor: isAdded ? 'default' : 'pointer',
          padding: '9px 0', fontWeight: 700, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: isAdded ? t.correctBg : t.pinkBtn,
          color:      isAdded ? t.correct   : t.pinkBtnText,
          transition: 'all 0.2s',
        }}>
        {isAdded ? <><Check size={14} strokeWidth={2.5} /> Нэмсэн</> : <><Plus size={14} /> Үгсэнд нэмэх</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  QuizView — comprehension questions + XP award + progress save
// ─────────────────────────────────────────────────────────────────────────────
function QuizView({ story, t, state, user, addXP, checkStreak, onBack, onProgressUpdate, isDesktop, onReadAgain, onFlashcard }) {
  const [questions,       setQuestions]       = useState(null);
  const [idx,             setIdx]             = useState(0);
  const [selected,        setSelected]        = useState(null);
  const [confirmed,       setConfirmed]       = useState(false);
  const [answers,         setAnswers]         = useState([]);
  const [phase,           setPhase]           = useState('quiz');
  const [xpEarned,        setXpEarned]        = useState(0);
  const [saving,          setSaving]          = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Reset translation toggle when question changes
  useEffect(() => { setShowTranslation(false); }, [idx]);

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from('comprehension_questions')
      .select('*')
      .eq('story_id', story.id)
      .order('sort_order', { ascending: true });
    setQuestions(data || []);
  };

  // Confirm the selected answer
  const confirmAnswer = () => {
    if (selected === null) return;
    setConfirmed(true);
  };

  // Move to next question or finish
  const next = () => {
    const q       = questions[idx];
    const correct = selected === q.correct_index;
    const newAnswers = [...answers, { correct }];

    if (idx < questions.length - 1) {
      setAnswers(newAnswers);
      setIdx(idx + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers) => {
    const correctCount = finalAnswers.filter(a => a.correct).length;
    const total        = finalAnswers.length;
    const xp           = calcStageXP(story.level, correctCount, total);

    setSaving(true);
    // Award XP + update streak
    addXP(xp);
    checkStreak();

    // Save to Supabase
    if (user) {
      await supabase.from('user_story_progress').upsert({
        user_id:      user.id,
        story_id:     story.id,
        completed:    true,
        score:        correctCount,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id,story_id' });
      onProgressUpdate?.();
    }

    setXpEarned(xp);
    setAnswers(finalAnswers);
    setSaving(false);
    setPhase('result');
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (!questions) {
    return (
      <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, padding: '20px', height: 120 }} className="sk" />
        {[0,1,2,3].map(i => <div key={i} style={{ background: t.bgCard, borderRadius: 16, border: `1px solid ${t.border}`, height: 52 }} className="sk" />)}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="af" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
        <div style={{ fontSize: 36 }}>📭</div>
        <div style={{ color: t.textMid, fontSize: 14 }}>Асуулт олдсонгүй</div>
        <button onClick={onBack} style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 12, padding: '10px 24px', cursor: 'pointer' }}>
          ← Буцах
        </button>
      </div>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = answers.filter(a => a.correct).length;
    const total        = answers.length;
    const pct          = correctCount / total;
    const stars        = pct >= 0.87 ? 3 : pct >= 0.6 ? 2 : 1;
    const starRow      = ['⭐','⭐','⭐'].map((s, i) => (
      <span key={i} style={{ fontSize: 32, opacity: i < stars ? 1 : 0.25 }}>{s}</span>
    ));

    return (
      <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Header */}
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>
          ДҮНГИЙН ТАЙЛАН 🎉
        </div>

        {/* Result card */}
        <div style={{ background: t.bgCard, borderRadius: 24, border: `1px solid ${t.border}`, padding: '28px 24px', boxShadow: t.shadowLg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {/* Stars */}
          <div style={{ display: 'flex', gap: 6 }}>{starRow}</div>

          {/* Story title */}
          <div className="fd" style={{ fontSize: 17, fontWeight: 800, color: t.text, textAlign: 'center' }}>
            {story.title}
          </div>

          {/* Score */}
          <div style={{ fontSize: 36, fontWeight: 900, color: pct >= 0.6 ? t.correct : t.wrong }}>
            {correctCount}/{total}
          </div>
          <div style={{ fontSize: 13, color: t.textMid }}>зөв хариулт</div>

          {/* XP badge */}
          <div style={{
            background: t.pinkBg, border: `1px solid ${t.pink}40`,
            borderRadius: 14, padding: '8px 20px',
            fontSize: 15, fontWeight: 800, color: t.pink,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            +{xpEarned} XP
          </div>
        </div>

        {/* Per-question recap */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {answers.map((a, i) => (
            <div key={i} style={{
              background: a.correct ? t.correctBg : t.wrongBg,
              border: `1px solid ${a.correct ? t.correct : t.wrong}40`,
              borderRadius: 12, padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 15 }}>{a.correct ? '✓' : '✗'}</span>
              <span style={{ fontSize: 13, color: a.correct ? t.correct : t.wrong, fontWeight: 600, flex: 1 }}>
                {questions[i]?.question}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        {story.new_words?.length > 0 && (
          <button onClick={onFlashcard}
            style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%' }}>
            Үгийн тест →
          </button>
        )}
        <button onClick={onReadAgain}
          style={{ background: t.bgCard, color: t.text, fontWeight: 700, fontSize: 14, border: `1.5px solid ${t.border}`, borderRadius: 16, padding: '13px 0', cursor: 'pointer', width: '100%' }}>
          Дахин унших
        </button>
        <button onClick={onBack}
          style={{ background: 'transparent', color: t.textSoft, fontWeight: 600, fontSize: 13, border: 'none', borderRadius: 12, padding: '8px 0', cursor: 'pointer', width: '100%' }}>
          Жагсаалт руу буцах
        </button>
      </div>
    );
  }

  // ── Quiz question ───────────────────────────────────────────────────────
  const q = questions[idx];

  const optionStyle = (optIdx) => {
    const base = {
      width: '100%', border: '1.5px solid', borderRadius: 14,
      padding: '13px 16px', fontSize: 14, fontWeight: 600,
      textAlign: 'left', cursor: confirmed ? 'default' : 'pointer',
      transition: 'all 0.2s', lineHeight: 1.4,
    };
    if (!confirmed) {
      return {
        ...base,
        background:   selected === optIdx ? t.pinkBg   : t.bgCard,
        borderColor:  selected === optIdx ? t.pink      : t.border,
        color:        selected === optIdx ? t.pink      : t.text,
      };
    }
    // Confirmed: show correct green, wrong red, unchosen neutral
    if (optIdx === q.correct_index) {
      return { ...base, background: t.correctBg, borderColor: t.correct, color: t.correct };
    }
    if (optIdx === selected && selected !== q.correct_index) {
      return { ...base, background: t.wrongBg, borderColor: t.wrong, color: t.wrong };
    }
    return { ...base, background: t.bgCard, borderColor: t.border, color: t.textSoft };
  };

  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack}
          style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ArrowLeft size={18} color={t.textMid} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.16em' }}>ОЙЛГОЛТЫН АСУУЛТ</div>
          <div className="fd" style={{ fontSize: 15, fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.title}</div>
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
            background: i < idx ? t.correct : i === idx ? t.pinkBtn : t.border,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Question card */}
      <div style={{ background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, padding: '20px', boxShadow: t.shadow }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.12em', marginBottom: 10 }}>
          {idx + 1} / {questions.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text, lineHeight: 1.5 }}>
          {q.question}
        </div>
        {/* Translation toggle — shown for German-language questions */}
        {q.language === 'de' && q.question_mn && (
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setShowTranslation(v => !v)}
              style={{
                background:  showTranslation ? t.pinkBg  : t.bgTag,
                color:       showTranslation ? t.pink     : t.textSoft,
                border:      `1px solid ${showTranslation ? t.pink + '50' : t.border}`,
                borderRadius: 8, padding: '3px 12px',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              Орчуулах
            </button>
            {showTranslation && (
              <div style={{ marginTop: 8, fontSize: 13, color: t.textSoft, fontStyle: 'italic', lineHeight: 1.5 }}>
                {q.question_mn}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(q.options || []).map((opt, optIdx) => (
          <button key={optIdx}
            onClick={() => !confirmed && setSelected(optIdx)}
            style={optionStyle(optIdx)}>
            <span style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 11, border: '1.5px solid currentColor',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1,
              }}>
                {String.fromCharCode(65 + optIdx)}
              </span>
              {opt}
            </span>
          </button>
        ))}
      </div>

      {/* Confirm / Next button */}
      {!confirmed ? (
        <button onClick={confirmAnswer} disabled={selected === null}
          style={{
            background: selected === null ? t.bgTag : t.pinkBtn,
            color:      selected === null ? t.textSoft : t.pinkBtnText,
            fontWeight: 800, fontSize: 15, border: 'none',
            borderRadius: 16, padding: '14px 0', cursor: selected === null ? 'default' : 'pointer',
            width: '100%', transition: 'all 0.2s',
          }}>
          Хариулах
        </button>
      ) : (
        <button onClick={next} disabled={saving}
          style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%' }}>
          {saving ? 'Хадгалж байна…' : idx < questions.length - 1 ? 'Дараах →' : 'Дүн харах →'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  VocabFlashcard — flashcard drill on story's new_words
// ─────────────────────────────────────────────────────────────────────────────
function VocabFlashcard({ story, t, state, toggleLearned, addCustomWord, onDone }) {
  const words = story.new_words || [];

  const [cardIdx,  setCardIdx]  = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [results,  setResults]  = useState([]);   // 'known' | 'again' per card
  const [phase,    setPhase]    = useState('cards'); // 'cards' | 'done'

  if (words.length === 0) { onDone(); return null; }

  const word      = words[cardIdx];
  const vocabHit  = VOCAB.find(w => w.de.toLowerCase() === word.de.toLowerCase().replace(ART_RE, ''));
  const alreadyIn = vocabHit
    ? state.learnedWords.includes(vocabHit.id)
    : !!(state.stats?.customWords?.[word.de.toLowerCase()]);

  const answer = (known) => {
    const newResults = [...results, known ? 'known' : 'again'];
    if (cardIdx < words.length - 1) {
      setResults(newResults);
      setCardIdx(i => i + 1);
      setFlipped(false);
    } else {
      setResults(newResults);
      setPhase('done');
    }
  };

  const addToSRS = (w) => {
    const hit = VOCAB.find(v => v.de.toLowerCase() === w.de.toLowerCase().replace(ART_RE, ''));
    if (hit) { if (!state.learnedWords.includes(hit.id)) toggleLearned(hit.id); }
    else addCustomWord(w.de, w.mn);
  };

  // ── Done screen ───────────────────────────────────────────────────────────
  if (phase === 'done') {
    const knownCount = results.filter(r => r === 'known').length;
    const againWords = words.filter((_, i) => results[i] === 'again');

    return (
      <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ҮГИЙН ТЕСТ 🗂</div>

        {/* Score card */}
        <div style={{ background: t.bgCard, borderRadius: 24, border: `1px solid ${t.border}`, padding: '28px 24px', boxShadow: t.shadowLg, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: knownCount === words.length ? t.correct : t.text }}>
            {knownCount}/{words.length}
          </div>
          <div style={{ fontSize: 14, color: t.textMid }}>цээжилсэн үг</div>
          {knownCount === words.length && (
            <div style={{ background: t.correctBg, color: t.correct, fontWeight: 700, fontSize: 13, padding: '6px 16px', borderRadius: 10 }}>
              Бүх үгийг мэдэж байна! 🎉
            </div>
          )}
        </div>

        {/* "Again" words — offer to add to SRS */}
        {againWords.length > 0 && (
          <div style={{ background: t.bgCard, borderRadius: 20, border: `1px solid ${t.border}`, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.14em', marginBottom: 12 }}>
              ДАХИН ДАВТАХ ҮГҮҮД — SRS-Д НЭМЭХ
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {againWords.map((w, i) => {
                const inDeck = VOCAB.find(v => v.de.toLowerCase() === w.de.toLowerCase().replace(ART_RE, ''))
                  ? state.learnedWords.includes(VOCAB.find(v => v.de.toLowerCase() === w.de.toLowerCase().replace(ART_RE, ''))?.id)
                  : !!(state.stats?.customWords?.[w.de.toLowerCase()]);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{w.de}</div>
                      <div style={{ fontSize: 12, color: t.textMid }}>{w.mn}</div>
                    </div>
                    <button onClick={() => addToSRS(w)} disabled={inDeck}
                      style={{
                        background: inDeck ? t.correctBg : t.pinkBtn,
                        color:      inDeck ? t.correct   : t.pinkBtnText,
                        border: 'none', borderRadius: 10, padding: '6px 12px',
                        fontSize: 12, fontWeight: 700, cursor: inDeck ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                      }}>
                      {inDeck ? <><Check size={12} /> Нэмсэн</> : <><Plus size={12} /> Нэмэх</>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button onClick={onDone}
          style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%' }}>
          Жагсаалт руу →
        </button>
      </div>
    );
  }

  // ── Card screen ───────────────────────────────────────────────────────────
  const progress = ((cardIdx) / words.length) * 100;

  return (
    <div className="af" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em' }}>ҮГИЙН ТЕСТ 🗂</div>
        <div style={{ fontSize: 12, color: t.textSoft, fontWeight: 700 }}>{cardIdx + 1} / {words.length}</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: t.bgTag, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: t.pinkBtn, borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      {/* Flashcard */}
      <div onClick={() => !flipped && setFlipped(true)}
        style={{
          background: t.bgCard, borderRadius: 24,
          border: `1.5px solid ${flipped ? t.border : t.pink + '60'}`,
          boxShadow: flipped ? t.shadow : t.shadowLg,
          padding: '40px 24px', cursor: flipped ? 'default' : 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 12, minHeight: 200, justifyContent: 'center',
          transition: 'all 0.2s',
        }}>

        {!flipped ? (
          /* Front: German word */
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.18em' }}>ГЕРМАН</div>
            <div className="fd" style={{ fontSize: 28, fontWeight: 900, color: t.text, textAlign: 'center', lineHeight: 1.2 }}>
              {word.de}
            </div>
            <div style={{ fontSize: 12, color: t.textSoft, marginTop: 8 }}>дарж орчуулга харах</div>
          </>
        ) : (
          /* Back: Mongolian translation */
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: t.textSoft, letterSpacing: '0.18em' }}>МОНГОЛ</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.textSoft, textAlign: 'center' }}>{word.de}</div>
            <div className="fd" style={{ fontSize: 24, fontWeight: 900, color: t.text, textAlign: 'center', lineHeight: 1.3 }}>
              {word.mn}
            </div>
            {alreadyIn && (
              <div style={{ fontSize: 11, color: t.correct, fontWeight: 700, background: t.correctBg, padding: '3px 10px', borderRadius: 8 }}>
                ✓ Үгсийн санд байна
              </div>
            )}
          </>
        )}
      </div>

      {/* Action buttons — only shown after flip */}
      {flipped ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => answer(false)}
            style={{ background: t.wrongBg, color: t.wrong, border: `1.5px solid ${t.wrong}40`, borderRadius: 16, padding: '14px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Дахин 🔄
          </button>
          <button onClick={() => answer(true)}
            style={{ background: t.correctBg, color: t.correct, border: `1.5px solid ${t.correct}40`, borderRadius: 16, padding: '14px 0', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Мэдэж байна ✓
          </button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)}
          style={{ background: t.pinkBtn, color: t.pinkBtnText, fontWeight: 800, fontSize: 15, border: 'none', borderRadius: 16, padding: '14px 0', cursor: 'pointer', width: '100%' }}>
          Харах
        </button>
      )}
    </div>
  );
}
