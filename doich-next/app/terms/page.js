'use client';

import { useState } from 'react';

const MN = {
  back:    '← Дойч руу буцах',
  title:   'Үйлчилгээний нөхцөл',
  updated: 'Хамгийн сүүлд шинэчлэгдсэн: 2026 оны 6-р сар',
  toggle:  'English',
  intro:   'Дойч апп-д бүртгэл үүсгэх эсвэл ашигласнаар та эдгээр нөхцөлийг хүлээн зөвшөөрч байна. Үүнийг анхааралтай уншина уу.',
  sections: [
    { h: '1. Үйлчилгээ', body: 'Дойч бол монгол хэлтэй хүмүүст зориулсан герман хэл сурах аппликейшн юм. Энэ нь үгсийн сангийн дадлага, дүрмийн дасгал, хиймэл оюун ухаан (AI) бүхий багш болон дуудлагын сургалтыг санал болгодог. Дойч нь үндсэн боломжуудыг агуулсан үнэгүй хувилбар болон нэмэлт боломжууд бүхий сонгон ашиглах Pro гишүүнчлэлийг санал болгодог.' },
    { h: '2. Таны бүртгэл', items: ['Бүртгүүлэхийн тулд хүчинтэй имэйл хаяг оруулах шаардлагатай.','Та өөрийн нууц үгийн аюулгүй байдлыг хангах үүрэгтэй.','Нэг бүртгэлийг нэг л хүн ашиглах ба бүртгэлийн мэдээллээ бусадтай хуваалцаж болохгүй.','Бүртгэл үүсгэхийн тулд та дор хаяж 13 настай байх шаардлагатай.'] },
    { h: '3. Зөвшөөрөгдөх хэрэглээ', intro: 'Та дараах зүйлсийг хийхгүй байхыг зөвшөөрч байна:', items: ['Апп-ыг аливаа хууль бус зорилгоор ашиглах.','Бусад хэрэглэгчдийн бүртгэл эсвэл мэдээлэл рүү нэвтрэхийг оролдох.','AI чатын үйлдлийг автомат хүсэлтээр хэт ачааллах эсвэл зүй бусаар ашиглах.','Зөвшөөрөлгүйгээр апп-ын контент болон эх кодыг хуулах, мэдээллийг нь татаж авах, эсвэл буцаан инженерчлэл хийх.'] },
    { h: '4. AI-ийн үүсгэсэн контент', body: 'AI багшийн хариултуудыг OpenAI үүсгэдэг бөгөөд зарим тохиолдолд алдаатай байх магадлалтай. Хэл сурах чухал шийдвэр гаргахдаа зөвхөн AI-ийн хариултад найдаж болохгүй. AI-ийн үүсгэсэн контент дахь алдаанд бид хариуцлага хүлээхгүй.' },
    { h: '5. Гишүүнчлэл ба Төлбөр', items: ['Үнэгүй хувилбар нь хэл сурах үндсэн боломжуудыг ямар нэгэн төлбөргүйгээр ашиглах эрхийг олгоно.','Pro төлөвлөгөө нь нэмэлт боломжуудыг нээх бөгөөд дараах хугацааны сонголттой байна: 1 сар — 14,900₮ · 3 сар — 35,900₮ · 12 сар — 99,900₮','Pro эрхийг гараар худалдаж авна. Автоматаар сунгагдахгүй тул төлбөр төлсөн хугацаа дуусахад таны Pro төлөвлөгөө зүгээр л дуусгавар болно.','Та хэдийд ч шинээр хугацаа худалдан авч, Pro эрхээ сунгах боломжтой.','Хуулиар шаардсанаас бусад тохиолдолд төлбөрийг буцаан олгохгүй.'] },
    { h: '6. Оюуны өмч', body: 'Апп-ын бүх контент, загвар болон код нь Дойч-ийн өмч юм. Бичгээр олгосон зөвшөөрөлгүйгээр апп-ын аль нэг хэсгийг хувилах, олшруулах, тараахыг хориглоно. Таны суралцах явцын мэдээлэл зөвхөн танд л харьяалагдана.' },
    { h: '7. Хүртээмж', body: 'Бид апп-ыг байнга ажиллагаатай байлгахыг зорьдог боловч тасралтгүй хандалттай байна гэсэн баталгаа өгөхгүй. Бид урьдчилан мэдэгдэхгүйгээр апп-ын зарим үйлдлийг шинэчлэх, өөрчлөх эсвэл зогсоох эрхтэй.' },
    { h: '8. Баталгааны хязгаарлалт', body: 'Энэхүү апп-ыг "байгаагаар нь" буюу ямар нэгэн баталгаагүйгээр хүргэж байна. Апп нь огт алдаагүй ажиллана, эсвэл таны суралцах тусгай зорилгыг бүрэн биелүүлнэ гэсэн баталгаа бид өгөхгүй.' },
    { h: '9. Хариуцлагын хязгаарлалт', body: 'Хуулиар зөвшөөрөгдсөн дээд хэмжээгээр, та Дойч апп-ыг ашигласнаас үүдэн гарах шууд бус, санамсаргүй эсвэл үр дагавартай холбоотой аливаа хохиролд манайх хариуцлага хүлээхгүй.' },
    { h: '10. Цуцлах', body: 'Эдгээр нөхцөлийг зөрчсөн бүртгэлийг түр хугацаагаар зогсоох эсвэл бүрмөсөн устгах эрхийг бид өөртөө үлдээж байна. Та бидэнтэй холбогдон хэдийд ч бүртгэлээ устгуулах боломжтой.' },
    { h: '11. Нөхцөлд оруулах өөрчлөлт', body: 'Бид эдгээр нөхцөлийг үе үе шинэчилж болно. Өөрчлөлт орсноос хойш апп-ыг үргэлжлүүлэн ашигласнаар та шинэчлэгдсэн нөхцөлийг хүлээн зөвшөөрсөнд тооцно.' },
    { h: '12. Холбоо барих', body: 'Эдгээр нөхцөлтэй холбоотой асуулт байвал доорх хаягаар холбогдоно уу:', email: 'doichapp@gmail.com' },
  ],
};

const EN = {
  back:    '← Back to Дойч',
  title:   'Terms of Service',
  updated: 'Last updated: June 2026',
  toggle:  'Монгол',
  intro:   'By creating an account or using Дойч, you agree to these terms. Please read them carefully.',
  sections: [
    { h: '1. The Service', body: 'Дойч is a German language learning application for Mongolian speakers. It provides vocabulary practice, grammar exercises, an AI-powered tutor, and pronunciation training. Дойч offers a free tier with core features and an optional Pro subscription with additional capabilities.' },
    { h: '2. Your Account', items: ['You must provide a valid email address to register.','You are responsible for keeping your password secure.','One person per account — do not share your account credentials.','You must be at least 13 years old to create an account.'] },
    { h: '3. Acceptable Use', intro: 'You agree not to:', items: ['Use the app for any unlawful purpose.','Attempt to access other users\' accounts or data.','Abuse or overload the AI chat feature with automated requests.','Reverse-engineer, scrape, or copy the app\'s content or source without permission.'] },
    { h: '4. AI-Generated Content', body: 'The AI tutor responses are generated by OpenAI and may occasionally be inaccurate. Do not rely solely on AI responses for critical language learning decisions. We are not responsible for errors in AI-generated content.' },
    { h: '5. Subscriptions & Payments', items: ['The free tier gives access to core learning features at no cost.','The Pro plan unlocks additional features and is available in the following periods: 1 month — 14,900₮ · 3 months — 35,900₮ · 12 months — 99,900₮','Pro access is purchased manually. There is no automatic renewal — your plan simply expires at the end of the paid period.','You can extend your Pro access at any time by purchasing a new period.','Payments are non-refundable except where required by law.'] },
    { h: '6. Intellectual Property', body: 'All app content, design, and code are owned by Дойч. You may not reproduce or distribute any part of the app without written permission. Your own learning progress data belongs to you.' },
    { h: '7. Availability', body: 'We aim to keep the app available but do not guarantee uninterrupted access. We may update, modify, or discontinue features at any time without notice.' },
    { h: '8. Disclaimer of Warranties', body: 'The app is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or that it will meet your specific learning goals.' },
    { h: '9. Limitation of Liability', body: 'To the fullest extent permitted by law, Дойч is not liable for any indirect, incidental, or consequential damages arising from your use of the app.' },
    { h: '10. Termination', body: 'We reserve the right to suspend or delete accounts that violate these terms. You may delete your account at any time by contacting us.' },
    { h: '11. Changes to These Terms', body: 'We may update these terms from time to time. Continued use of the app after changes means you accept the updated terms.' },
    { h: '12. Contact', body: 'Questions about these terms:', email: 'doichapp@gmail.com' },
  ],
};

export default function TermsPage() {
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
          {s.intro && <p>{s.intro}</p>}
          {s.body  && <p>{s.body}</p>}
          {s.items && <ul style={{ paddingLeft: 20 }}>{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>}
          {s.email && <p><a href={`mailto:${s.email}`} style={{ color: '#0062a1' }}>{s.email}</a></p>}
        </div>
      ))}
    </div>
  );
}
