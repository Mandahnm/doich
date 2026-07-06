'use client';

import { Crown, Clock } from 'lucide-react';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// payFlow: 'checking' | 'success' | 'pending' | null
export default function PaymentResultModal({ payFlow, proInfo, t, onClose }) {
  if (!payFlow) return null;

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, paddingTop: 'calc(20px + env(safe-area-inset-top))',
  };
  const card = {
    background: t.bgCard, borderRadius: 26, padding: '32px 26px',
    maxWidth: 360, width: '100%', textAlign: 'center',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)', border: `1px solid ${t.border}`,
  };

  if (payFlow === 'checking') {
    return (
      <div style={overlay}>
        <div style={card}>
          <div className="pay-spin" style={{ width: 54, height: 54, margin: '0 auto 20px', borderRadius: '50%', border: `4px solid ${t.bgTag}`, borderTopColor: '#A78BFA' }} />
          <div style={{ fontWeight: 800, fontSize: 18, color: t.text, marginBottom: 6 }}>Төлбөрийг шалгаж байна…</div>
          <div style={{ color: t.textSoft, fontSize: 13 }}>Хэдхэн секунд хүлээнэ үү</div>
          <style>{`@keyframes pay-rot{to{transform:rotate(360deg)}}.pay-spin{animation:pay-rot .8s linear infinite}`}</style>
        </div>
      </div>
    );
  }

  if (payFlow === 'pending') {
    return (
      <div style={overlay}>
        <div style={card}>
          <div style={{ width: 64, height: 64, margin: '0 auto 18px', borderRadius: '50%', background: t.bgTag, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={32} color={t.textMid} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 19, color: t.text, marginBottom: 8 }}>Төлбөр баталгаажаагүй байна</div>
          <div style={{ color: t.textSoft, fontSize: 14, lineHeight: 1.5, marginBottom: 22 }}>
            Хэрэв та төлбөрөө төлсөн бол хэдэн минутын дараа автоматаар нээгдэнэ. Асуудал гарвал бидэнтэй холбогдоно уу.
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: t.bgTag, color: t.text, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>Хаах</button>
        </div>
      </div>
    );
  }

  // success
  return (
    <div style={overlay}>
      <div style={card}>
        <div style={{ width: 88, height: 88, margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 34px rgba(167,139,250,0.5)' }}>
          <Crown size={44} color="#fff" strokeWidth={2} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.14em', color: '#A78BFA', marginBottom: 6 }}>ТӨЛБӨР АМЖИЛТТАЙ 🎉</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: t.text, marginBottom: 8 }}>Doich Pro нээгдлээ!</div>
        <div style={{ color: t.textSoft, fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
          Одоо бүх шат, өгүүллэг, хязгааргүй AI багш нээгдлээ 👑
        </div>
        {proInfo?.expiresAt && (
          <div style={{ background: t.bgTag, borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: t.textMid, fontSize: 13, fontWeight: 600 }}>Дуусах хугацаа</span>
            <span style={{ color: t.text, fontSize: 14, fontWeight: 800 }}>{fmtDate(proInfo.expiresAt)}</span>
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#FF6FA8,#A78BFA)', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,111,168,0.4)' }}>
          Эхлэх
        </button>
      </div>
    </div>
  );
}
