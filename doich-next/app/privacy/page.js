'use client';

import { useState } from 'react';

const MN = {
  back:    '← Дойч руу буцах',
  title:   'Нууцлалын бодлого',
  updated: 'Сүүлд шинэчилсэн: 2026 оны 6 сар',
  toggle:  'English',
  intro:   'Дойч ("бид", "бидний", "апп") нь монгол хэлтэй хэрэглэгчдэд зориулсан Герман хэл сурах апп юм. Энэхүү бодлого нь бид ямар мэдээлэл цуглуулдаг, яагаад, хэрхэн ашигладгийг тайлбарлана.',
  sections: [
    { h: '1. Бидний цуглуулдаг мэдээлэл', items: [
      '<strong>Имэйл хаяг</strong> — бүртгэл үүсгэх үед цуглуулагдах ба зөвхөн нэвтрэх болон бүртгэл сэргээхэд ашиглагдана.',
      '<strong>Нууц үг</strong> — Supabase-аар найдвартай хэшлэгдэж хадгалагдана. Бид таны нууц үгийн бодит утгыг хэзээ ч хардаггүй.',
      '<strong>Сурлагын ахиц</strong> — XP оноо, сурсан үгс, тасралтгүй сурсан өдрүүд (streak), амжилтууд болон тоглоомын статистик. Таны ахиц төхөөрөмж бүр дээр хадгалагдахын тулд бид үүнийг хадгалдаг.',
      '<strong>Чатын мессеж</strong> — таны AI багшид илгээсэн мессежийг хариулт үүсгэхийн тулд OpenAI-ийн API руу дамжуулна. Бид чатын түүхийг сервер дээрээ байнга хадгалдаггүй.',
      '<strong>Дуу хоолойн оролт</strong> — дуудлагын дасгал хийх үед таны микрофоны дуу хоолой хөтөч дээр бичигдэж, манай сервер рүү илгээгдэн, OpenAI-ийн Whisper API руу хөрвүүлэлт хийхээр дамжуулагдана. Дуу хоолойг зөвхөн таны дуудлагыг шалгахад ашиглах ба манай сервер дээр хадгалдаггүй. OpenAI энэхүү дуу хоолойг өөрсдийн нууцлалын бодлогын дагуу боловсруулж болно.',
    ]},
    { h: '2. Гуравдагч талын үйлчилгээ', items: [
      '<strong>Supabase</strong> — таны бүртгэл болон ахицын мэдээллийг хадгална. <a href="https://supabase.com/privacy" style="color:#0062a1">Supabase-ийн нууцлалын бодлого</a>',
      '<strong>OpenAI</strong> — AI чатын мессеж болон дуудлагын дуу хоолойг Whisper-ээр дамжуулан боловсруулна. <a href="https://openai.com/privacy" style="color:#0062a1">OpenAI-ийн нууцлалын бодлого</a>',
      '<strong>Resend</strong> — имэйл баталгаажуулалт болон нууц үг сэргээх имэйлийг хүргэхэд ашиглагдана. Үүний тулд таны имэйл хаягийг боловсруулна. <a href="https://resend.com/legal/privacy-policy" style="color:#0062a1">Resend-ийн нууцлалын бодлого</a>',
      '<strong>Vercel</strong> — аппыг хостинг хийх ба стандарт хүсэлтийн мета мэдээллийг (IP хаяг, хөтчийн төрөл) бүртгэж болно. <a href="https://vercel.com/legal/privacy-policy" style="color:#0062a1">Vercel-ийн нууцлалын бодлого</a>',
    ]},
    { h: '3. Бид таны мэдээллийг хэрхэн ашигладаг вэ', items: [
      'Таны сурлагын ахицыг сесс болон төхөөрөмж хооронд хадгалж, синк хийхэд.',
      'Таныг баталгаажуулж, бүртгэлийг тань аюулгүй байлгахад.',
      'Хүсэлт гаргасан үед бүртгэл сэргээх имэйл илгээхэд.',
      'Бид таны мэдээллийг гуравдагч талд <strong>зардаггүй</strong>.',
      'Бид таны мэдээллийг зар сурталчилгаанд <strong>ашигладдаггүй</strong>.',
    ]},
    { h: '4. Күүки (Cookies)', body: 'Бид таныг нэвтэрсэн хэвээр байлгахын тулд Supabase-ийн тохируулсан сесс күүки ашигладаг. Эдгээр нь апп ажиллахад зайлшгүй шаардлагатай бөгөөд таныг бусад вэбсайтуудаар дагаж мөрддөггүй.' },
    { h: '5. Таны эрх', items: [
      '<strong>Бүртгэлээ устгах</strong> — та бидэнд имэйл бичиж, бүртгэл болон холбогдох бүх мэдээллээ бүрэн устгуулах хүсэлт гаргах боломжтой.',
      '<strong>Мэдээлэлдээ хандах</strong> — та хадгалагдсан мэдээллийнхээ хуулбарыг авах хүсэлт гаргах боломжтой.',
      '<strong>Засварлах</strong> — та бүртгэлийн тохиргооноос имэйл хаягаа шинэчлэх боломжтой.',
    ]},
    { h: '6. Мэдээлэл хадгалах хугацаа', body: 'Таны мэдээлэл бүртгэл идэвхтэй байх хугацаанд хадгалагдана. Бүртгэлээ устгасан тохиолдолд холбогдох бүх мэдээлэл 30 хоногийн дотор манай системээс устгагдана.' },
    { h: '7. Хүүхдэд', body: 'Дойч нь 13-аас доош насны хүүхдэд зориулагдаагүй. Бид 13-аас доош насны хүүхдээс мэдээлэл санаатайгаар цуглуулдаггүй.' },
    { h: '8. Холбоо барих', body: 'Нууцлалтай холбоотой асуулт эсвэл мэдээллийн хүсэлт гаргах бол:', email: 'doichapp@gmail.com' },
  ],
};

const EN = {
  back:    '← Back to Дойч',
  title:   'Privacy Policy',
  updated: 'Last updated: June 2026',
  toggle:  'Монгол',
  intro:   'Дойч ("we", "our", "the app") is a German language learning app for Mongolian speakers. This policy explains what data we collect, why, and how it is used.',
  sections: [
    { h: '1. Data We Collect', items: [
      '<strong>Email address</strong> — collected when you create an account, used only for login and account recovery.',
      '<strong>Password</strong> — stored as a secure hash by Supabase. We never see your plain-text password.',
      '<strong>Learning progress</strong> — XP points, learned words, streaks, achievements, and game statistics. Stored so your progress is available across devices.',
      '<strong>Chat messages</strong> — messages you send to the AI tutor are forwarded to OpenAI\'s API to generate responses. We do not permanently store chat history on our servers.',
      '<strong>Voice input</strong> — when you use the pronunciation practice feature, your microphone audio is recorded in your browser, sent to our server, and forwarded to OpenAI\'s Whisper API for transcription. The audio is used only to check your pronunciation and is not stored on our servers. OpenAI may process this audio per their privacy policy.',
    ]},
    { h: '2. Third-Party Services', items: [
      '<strong>Supabase</strong> — stores your account and progress data. <a href="https://supabase.com/privacy" style="color:#0062a1">Supabase Privacy Policy</a>',
      '<strong>OpenAI</strong> — processes AI chat messages and pronunciation audio via Whisper. <a href="https://openai.com/privacy" style="color:#0062a1">OpenAI Privacy Policy</a>',
      '<strong>Resend</strong> — delivers confirmation and password reset emails. Your email address is shared with Resend for this purpose. <a href="https://resend.com/legal/privacy-policy" style="color:#0062a1">Resend Privacy Policy</a>',
      '<strong>Vercel</strong> — hosts the app and may log standard request metadata (IP address, browser type). <a href="https://vercel.com/legal/privacy-policy" style="color:#0062a1">Vercel Privacy Policy</a>',
    ]},
    { h: '3. How We Use Your Data', items: [
      'To provide and sync your learning progress across sessions and devices.',
      'To authenticate you and keep your account secure.',
      'To send account recovery emails when requested.',
      'We do <strong>not</strong> sell your data to third parties.',
      'We do <strong>not</strong> use your data for advertising.',
    ]},
    { h: '4. Cookies', body: 'We use session cookies set by Supabase to keep you logged in. These are strictly necessary for the app to function and do not track you across other websites.' },
    { h: '5. Your Rights', items: [
      '<strong>Delete your account</strong> — you can request full deletion of your account and all associated data by emailing us.',
      '<strong>Access your data</strong> — you can request a copy of your stored data.',
      '<strong>Correction</strong> — you can update your email via account settings.',
    ]},
    { h: '6. Data Retention', body: 'Your data is kept for as long as your account is active. Deleting your account removes all associated data from our systems within 30 days.' },
    { h: '7. Children', body: 'Дойч is not directed at children under 13. We do not knowingly collect data from children under 13.' },
    { h: '8. Contact', body: 'For any privacy questions or data requests:', email: 'doichapp@gmail.com' },
  ],
};

export default function PrivacyPage() {
  const [lang, setLang] = useState('mn');
  const c = lang === 'mn' ? MN : EN;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px', fontFamily: 'sans-serif', color: '#1b1c1c', lineHeight: 1.7 }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <a href="/" style={{ fontSize: 14, color: '#0062a1', textDecoration: 'none' }}>{c.back}</a>
        <button onClick={() => setLang(l => l === 'mn' ? 'en' : 'mn')}
          style={{ fontSize: 13, fontWeight: 700, color: '#0062a1', background: '#dceeff', border: 'none', borderRadius: 20, padding: '6px 16px', cursor: 'pointer' }}>
          {c.toggle}
        </button>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>{c.title}</h1>
      <p style={{ color: '#80765f', fontSize: 14, marginBottom: 40 }}>{c.updated}</p>
      <p>{c.intro}</p>

      {c.sections.map(s => (
        <div key={s.h}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12 }}>{s.h}</h2>
          {s.body && <p dangerouslySetInnerHTML={{ __html: s.body }} />}
          {s.items && (
            <ul style={{ paddingLeft: 20 }}>
              {s.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}
            </ul>
          )}
          {s.email && <p><a href={`mailto:${s.email}`} style={{ color: '#0062a1' }}>{s.email}</a></p>}
        </div>
      ))}
    </div>
  );
}
