'use client';

import { Home, Gamepad2, BookOpen, MessageCircle, User, Library } from 'lucide-react';

const NAV = [
  { id: 'home',    Icon: Home,          label: 'Нүүр'       },
  { id: 'reading', Icon: Library,       label: 'Унших'      },
  { id: 'games',   Icon: Gamepad2,      label: 'Тоглоомууд' },
  { id: 'vocab',   Icon: BookOpen,      label: 'Үгсийн сан' },
  { id: 'chat',    Icon: MessageCircle, label: 'AI багш'    },
  { id: 'profile', Icon: User,          label: 'Профайл'    },
];

export default function DesktopSidebar({ tab, setTab, t, state }) {
  const initial = state.userName ? state.userName[0].toUpperCase() : '?';

  return (
    <div style={{
      width: 240,
      minHeight: '100vh',
      background: t.bgCard,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '28px 16px 24px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, paddingLeft: 4 }}>
        {/* Logo card */}
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: '#ffffff',
          border: '2px solid #e6b800',
          boxShadow: '0 0 0 4px rgba(255,204,0,0.14), 0 4px 14px rgba(201,160,0,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img src="/logo.png" alt="Дойч logo" width={30} height={30}
            style={{ objectFit: 'contain', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        {/* Brand name + tagline */}
        <div>
          <div style={{ fontSize: 21, fontWeight: 900, color: '#4a3800', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            Дойч
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#745b00', letterSpacing: '0.05em', marginTop: 2 }}>
            Герман хэл
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV.map(({ id, Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12, border: 'none',
                cursor: 'pointer', width: '100%', textAlign: 'left',
                background: active ? t.pinkBtn : 'transparent',
                color: active ? t.pinkBtnText : t.textMid,
                fontWeight: active ? 700 : 500,
                fontSize: 15,
                transition: 'all 0.15s',
              }}>
              <Icon size={20} color={active ? t.pinkBtnText : t.textSoft} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderRadius: 12, background: t.bgTag }}>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: '#ffcc00',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: '#241a00', flexShrink: 0,
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {state.userName || ''}
          </div>
          <div style={{ fontSize: 11, color: t.textSoft }}>{state.userLevel} түвшин</div>
        </div>
      </div>
    </div>
  );
}
