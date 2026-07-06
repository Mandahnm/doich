'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PRICING } from '@/lib/plans';

const fmt = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const STATUS_COLOR = { paid: '#16a34a', pending: '#d97706', failed: '#dc2626', expired: '#6b7280' };

export default function AdminPage() {
  const [ready,   setReady]   = useState(false);
  const [session, setSession] = useState(null);
  const [email,   setEmail]   = useState('');
  const [planId,  setPlanId]  = useState('monthly');
  const [result,  setResult]  = useState(null);
  const [msg,     setMsg]     = useState('');
  const [busy,    setBusy]    = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
  }, []);

  const authFetch = async (url, body) => {
    const { data: { session: s } } = await supabase.auth.getSession();
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${s?.access_token}` },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, d };
  };

  const lookup = async () => {
    if (!email.trim()) return;
    setBusy(true); setMsg(''); setResult(null);
    const { ok, status, d } = await authFetch('/api/admin/lookup', { email: email.trim() });
    setBusy(false);
    if (!ok) { setMsg(status === 403 ? 'Танд админ эрх алга.' : (d.error || 'Алдаа гарлаа')); return; }
    if (!d.found) { setMsg('Энэ имэйлтэй хэрэглэгч олдсонгүй.'); return; }
    setResult(d);
  };

  const grant = async () => {
    if (!email.trim()) return;
    const plan = PRICING.find(p => p.id === planId);
    if (!confirm(`${email} хэрэглэгчид "${plan.labelMn}" (${plan.months} сар) Pro эрх өгөх үү?`)) return;
    setBusy(true); setMsg('');
    const { ok, d } = await authFetch('/api/admin/grant-pro', { email: email.trim(), planId });
    setBusy(false);
    if (!ok || !d.found) { setMsg(d.error || 'Идэвхжүүлэлт амжилтгүй'); return; }
    setMsg(`✅ Pro идэвхжлээ. Дуусах: ${fmt(d.pro_expires_at)}`);
    lookup(); // refresh
  };

  const S = {
    page:  { minHeight: '100vh', background: '#0f1117', color: '#e5e7eb', fontFamily: 'system-ui, sans-serif', padding: '32px 16px' },
    wrap:  { maxWidth: 640, margin: '0 auto' },
    card:  { background: '#181b23', border: '1px solid #262a35', borderRadius: 16, padding: 20, marginBottom: 16 },
    input: { width: '100%', boxSizing: 'border-box', background: '#0f1117', border: '1px solid #2b3040', borderRadius: 10, padding: '11px 14px', color: '#e5e7eb', fontSize: 15, outline: 'none' },
    btn:   { border: 'none', borderRadius: 10, padding: '11px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
    label: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#8b93a7', marginBottom: 6, textTransform: 'uppercase' },
  };

  if (!ready) return <div style={S.page}><div style={S.wrap}>Ачааллаж байна…</div></div>;

  if (!session) {
    return (
      <div style={S.page}><div style={S.wrap}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Doich Admin</h1>
        <div style={S.card}>
          Эхлээд <a href="/" style={{ color: '#a78bfa' }}>үндсэн апп</a>-д админ имэйлээрээ нэвтэрч ороод энэ хуудсыг дахин нээнэ үү.
        </div>
      </div></div>
    );
  }

  const plan = result?.plan;

  return (
    <div style={S.page}><div style={S.wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Doich Admin</h1>
        <span style={{ fontSize: 12, color: '#8b93a7' }}>{session.user.email}</span>
      </div>

      {/* Lookup */}
      <div style={S.card}>
        <div style={S.label}>Хэрэглэгчийн имэйл</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={S.input} value={email} placeholder="user@example.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()} />
          <button style={{ ...S.btn, background: '#3b82f6', color: '#fff', opacity: busy ? 0.6 : 1 }}
            disabled={busy} onClick={lookup}>Хайх</button>
        </div>
        {msg && <div style={{ marginTop: 12, fontSize: 14, color: msg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{msg}</div>}
      </div>

      {result && (
        <>
          {/* Current plan */}
          <div style={S.card}>
            <div style={S.label}>Одоогийн төлөв</div>
            {plan?.plan === 'pro'
              ? <div style={{ fontSize: 15 }}>👑 <b>Pro</b> · дуусах: <b>{fmt(plan.pro_expires_at)}</b></div>
              : <div style={{ fontSize: 15, color: '#8b93a7' }}>Free (Pro эрхгүй)</div>}
          </div>

          {/* Grant */}
          <div style={S.card}>
            <div style={S.label}>Pro эрх өгөх / сунгах</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select style={{ ...S.input, flex: 1, minWidth: 180 }} value={planId} onChange={e => setPlanId(e.target.value)}>
                {PRICING.map(p => <option key={p.id} value={p.id}>{p.labelMn} — {p.months} сар ({p.price.toLocaleString()}₮)</option>)}
              </select>
              <button style={{ ...S.btn, background: '#a78bfa', color: '#fff', opacity: busy ? 0.6 : 1 }}
                disabled={busy} onClick={grant}>Pro өгөх</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#8b93a7' }}>Үлдсэн хугацаан дээр нэмж сунгана.</div>
          </div>

          {/* Payments */}
          <div style={S.card}>
            <div style={S.label}>Төлбөрийн түүх (сүүлийн 20)</div>
            {(!result.payments || result.payments.length === 0)
              ? <div style={{ color: '#8b93a7', fontSize: 14 }}>Төлбөр байхгүй.</div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.payments.map(p => (
                    <div key={p.transaction_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f1117', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}>
                      <div>
                        <span style={{ color: STATUS_COLOR[p.status] || '#e5e7eb', fontWeight: 700 }}>{p.status}</span>
                        <span style={{ color: '#8b93a7' }}> · {p.plan_id} · {Number(p.amount).toLocaleString()}₮</span>
                      </div>
                      <div style={{ color: '#8b93a7' }}>{fmt(p.paid_at || p.created_at)}</div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}
    </div></div>
  );
}
