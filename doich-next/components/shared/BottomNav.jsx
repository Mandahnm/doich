'use client';

import { Home, MessageCircle, BookOpen, Gamepad2, User, Library } from 'lucide-react';

const ITEMS = [
  { id: 'home',    Icon: Home,          label: 'Нүүр'    },
  { id: 'reading', Icon: Library,       label: 'Унших'   },
  { id: 'vocab',   Icon: BookOpen,      label: 'Үгс',    center: true },
  { id: 'games',   Icon: Gamepad2,      label: 'Тоглоом' },
  { id: 'profile', Icon: User,          label: 'Профайл' },
];

export default function BottomNav({ t, tab, setTab }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: t.navBg, borderTop: `1px solid ${t.border}`,
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '8px 4px 12px', display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {ITEMS.map(({ id, Icon, label, center }) => {
          const active = tab === id;

          // Center tab (Vocab) gets a raised gold circle
          if (center) {
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '0 8px', position: 'relative', top: -12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: active ? t.pinkBtn : t.bgCard,
                  border: `2px solid ${active ? t.pinkBtn : t.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? `0 4px 16px rgba(255,204,0,0.4)` : t.shadow,
                  transition: 'all 0.2s',
                }}>
                  <Icon size={24} color={active ? t.pinkBtnText : t.textSoft} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, color: active ? t.pink : t.textSoft }}>{label}</span>
              </button>
            );
          }

          return (
            <button key={id} onClick={() => setTab(id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 12, transition: 'all 0.15s' }}>
              <Icon size={22} color={active ? t.pink : t.textSoft} strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, color: active ? t.pink : t.textSoft }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
