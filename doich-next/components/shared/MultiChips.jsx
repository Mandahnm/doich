'use client';

export default function MultiChips({ label, t, opts, selected, onToggle, onClear, rLabel }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: t.textSoft, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <button onClick={onClear}
          style={{
            padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12,
            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
            background: selected.length === 0 ? t.pinkBtn : t.bgCard,
            color:      selected.length === 0 ? '#fff' : t.textMid,
            boxShadow: t.shadow,
          }}>
          Бүгд
        </button>
        {opts.map(o => (
          <button key={o} onClick={() => onToggle(o)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12,
              border: `2px solid ${selected.includes(o) ? t.pink : 'transparent'}`,
              cursor: 'pointer', whiteSpace: 'nowrap',
              background: selected.includes(o) ? t.pinkBtn : t.bgCard,
              color:      selected.includes(o) ? '#fff'    : t.textMid,
              boxShadow: t.shadow,
            }}>
            {rLabel(o)}
          </button>
        ))}
      </div>
    </div>
  );
}
