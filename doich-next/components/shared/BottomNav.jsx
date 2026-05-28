'use client';

import { Home, MessageCircle, Pencil, Gamepad2, BookOpen, User } from 'lucide-react';

const ITEMS = [
  { id: 'home',    Icon: Home,          label: 'Нүүр'    },
  { id: 'chat',    Icon: MessageCircle, label: 'AI'      },
  { id: 'grammar', Icon: Pencil,        label: 'Засагч'  },
  { id: 'games',   Icon: Gamepad2,      label: 'Тоглоом' },
  { id: 'vocab',   Icon: BookOpen,      label: 'Үгс'     },
  { id: 'profile', Icon: User,          label: 'Профайл' },
];

export default function BottomNav({ t, tab, setTab }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: t.navBg, borderTop: `1px solid ${t.border}`,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '6px 2px', display: 'flex', justifyContent: 'space-around' }}>
        {ITEMS.map(({ id, Icon, label }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '7px 10px', borderRadius: 14,
                background: active ? t.pinkBg : 'none',
                border: 'none', cursor: 'pointer',
                color: active ? t.pink : t.textSoft,
                transition: 'all 0.15s',
              }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              {label && <span style={{ fontSize: 10, fontWeight: active ? 800 : 600 }}>{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
