// Run from doich-next/: node scripts/add-wenn-alles-gut-geht-story.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const STORY_ID = 'b2000000-4000-0000-0000-000000000005';

const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const story = {
  id: STORY_ID,
  title: 'Wenn alles gut geht',
  level: 'B2',
  sort_order: 5,
  is_ai_generated: false,
  body: [
    {
      text: 'Erdene sitzt am Küchentisch und starrt auf seinen Laptop. In zwei Wochen läuft die Bewerbungsfrist für das Studienkolleg ab, und er ist sich immer noch nicht sicher, ob er sich bewerben soll. „Und wenn ich die Aufnahmeprüfung nicht bestehe?", fragt er seinen Freund Jonas, der ihm gegenübersitzt.',
      translation: 'Эрдэнэ гал тогооны ширээний ард сууж, зөөврийн компьютер руугаа ширтэнэ. Хоёр долоо хоногийн дараа Studienkolleg-д өргөдөл өгөх хугацаа дуусах гэж байгаа ч тэр өргөдөл гаргах эсэхдээ одоо болтол эргэлзсээр байна. „Хэрэв би элсэлтийн шалгалтад тэнцэхгүй бол яах вэ?" гэж тэр эсрэг талд нь сууж буй найз Йонасаас асууна.',
    },
    {
      text: 'Jonas lächelt. „An deiner Stelle würde ich mir darüber jetzt keine Sorgen machen. Du lernst seit zwei Jahren Deutsch, dein Niveau ist gut. Wenn du dich vorbereitest, hast du reelle Chancen."',
      translation: 'Йонас инээмсэглэнэ. „Би чиний оронд байсан бол одоо энэ талаар санаа зовохгүй байх байсан. Чи хоёр жил герман хэл сурч байна, түвшин чинь сайн. Хэрэв чи бэлдвэл жинхэнэ боломж байгаа."',
    },
    {
      text: '„Aber die Prüfung ist schwer", sagt Erdene. „Sollte ich durchfallen, verliere ich ein ganzes Jahr."',
      translation: '„Гэхдээ шалгалт хэцүү шүү" гэж Эрдэнэ хэлнэ. „Хэрэв би унавал би бүтэн жил алдана."',
    },
    {
      text: '„Das stimmt", gibt Jonas zu. „Trotzdem solltest du es versuchen. Stell dir vor, du bewirbst dich nicht — dann weißt du für immer nicht, ob du es geschafft hättest. Diese Frage wird dich dein Leben lang begleiten."',
      translation: '„Үнэн" гэж Йонас хүлээн зөвшөөрнө. „Гэсэн ч чи оролдох ёстой. Төсөөлөөд үз дээ, чи өргөдөл өгөхгүй бол — тэгвэл чи чадах байсан эсэхээ хэзээ ч мэдэхгүй. Энэ асуулт чамайг насан туршид дагалдана."',
    },
    {
      text: 'Erdene denkt nach. Jonas hat recht. Wenn alles gut geht, wird er im Herbst am Studienkolleg anfangen. Danach wird er sich an der Universität bewerben, Informatik studieren und vielleicht eines Tages seine eigene Firma gründen. Das ist sein Traum.',
      translation: 'Эрдэнэ бодолд автана. Йонас зөв байна. Хэрэв бүх зүйл сайхан болбол намар тэр Studienkolleg-д орно. Дараа нь тэр их сургуульд өргөдөл гаргаж, компьютерийн ухаанаар суралцаж, магадгүй нэгэн өдөр өөрийн компанитай болно. Энэ бол түүний мөрөөдөл.',
    },
    {
      text: '„Weißt du", sagt Jonas, „das Leben belohnt selten die Vorsichtigen. Wer nichts riskiert, gewinnt auch nichts. Also: Schick die Bewerbung ab, bereite dich gut vor, und dann sehen wir weiter."',
      translation: '„Чи мэдэж байгаа биз" гэж Йонас хэлнэ, „амьдрал болгоомжтой хүмүүсийг ховор шагнадаг. Юу ч эрсдэлд оруулдаггүй хүн юу ч олж авдаггүй. Тиймээс: өргөдлөө илгээ, сайн бэлд, дараа нь цааш нь харцгаая."',
    },
    {
      text: 'Erdene atmet tief durch. „Du hast recht. Ich mache es. Wenn ich es nicht wenigstens versuche, werde ich es später bereuen."',
      translation: 'Эрдэнэ гүн амьсгаа авна. „Чи зөв. Би хийнэ. Хэрэв би ядаж оролдохгүй бол дараа нь харамсана."',
    },
    {
      text: 'Er öffnet das Formular auf seinem Bildschirm. Seine Hände zittern ein bisschen, doch zum ersten Mal seit Wochen fühlt er sich entschlossen. Was auch immer passiert — er wird es zumindest versucht haben.',
      translation: 'Тэр дэлгэцэн дээрх маягтаа нээнэ. Гар нь жаахан чичирнэ, гэвч хэдэн долоо хоногийн дараа анх удаа тэр шийдэмгий болсноо мэдэрнэ. Юу ч тохиолдсон — тэр ядаж л оролдсон байх болно.',
    },
  ],
  new_words: [
    { de: 'die Bewerbungsfrist', mn: 'өргөдөл өгөх хугацаа' },
    { de: 'ablaufen', mn: '(хугацаа) дуусах' },
    { de: 'sich bewerben', mn: 'өргөдөл гаргах, элсэх хүсэлт гаргах' },
    { de: 'die Aufnahmeprüfung', mn: 'элсэлтийн шалгалт' },
    { de: 'bestehen', mn: '(шалгалтад) тэнцэх' },
    { de: 'das Niveau', mn: 'түвшин' },
    { de: 'sich vorbereiten', mn: 'бэлдэх' },
    { de: 'durchfallen', mn: '(шалгалтад) унах' },
    { de: 'zugeben', mn: 'хүлээн зөвшөөрөх' },
    { de: 'begleiten', mn: 'дагалдах' },
    { de: 'riskieren', mn: 'эрсдэл хүлээх' },
    { de: 'abschicken', mn: 'илгээх' },
    { de: 'entschlossen', mn: 'шийдэмгий' },
    { de: 'bereuen', mn: 'харамсах, гэмших' },
    { de: 'zittern', mn: 'чичрэх' },
  ],
};

const questions = [
  {
    question: 'Warum zögert Erdene, sich für das Studienkolleg zu bewerben?',
    question_mn: null,
    options: [
      'Weil er Angst hat, die Aufnahmeprüfung nicht zu bestehen',
      'Weil er kein Deutsch kann',
      'Weil er kein Geld für die Bewerbung hat',
      'Weil Jonas strikt dagegen ist',
    ],
    correct_index: 0,
    language: 'de',
    sort_order: 0,
  },
  {
    question: 'Welchen Rat gibt Jonas seinem Freund?',
    question_mn: null,
    options: [
      'Er soll lieber noch ein Jahr warten',
      'Er soll es versuchen und sich gut vorbereiten',
      'Er soll sich besser nicht bewerben',
      'Er soll ein ganz anderes Fach wählen',
    ],
    correct_index: 1,
    language: 'de',
    sort_order: 1,
  },
  {
    question: 'Was befürchtet Erdene, falls er durchfällt?',
    question_mn: null,
    options: [
      'Dass er viel Geld verliert',
      'Dass Jonas ihn auslacht',
      'Dass er ein ganzes Jahr verliert',
      'Dass er das Land verlassen muss',
    ],
    correct_index: 2,
    language: 'de',
    sort_order: 2,
  },
  {
    question: 'Was sind Erdenes Zukunftspläne, wenn alles gut geht?',
    question_mn: null,
    options: [
      'Er will Studienkolleg machen, Informatik studieren und später eine eigene Firma gründen',
      'Er will sofort arbeiten und nur Geld verdienen',
      'Er will bald in die Mongolei zurückkehren',
      'Er will Deutschlehrer werden',
    ],
    correct_index: 0,
    language: 'de',
    sort_order: 3,
  },
  {
    question: 'Was meint Jonas mit „Wer nichts riskiert, gewinnt auch nichts"?',
    question_mn: null,
    options: [
      'Dass man immer möglichst vorsichtig sein soll',
      'Dass Glücksspiel gefährlich ist',
      'Dass man ohne Mut und Risiko nichts erreichen kann',
      'Dass Erdene bestimmt reich werden wird',
    ],
    correct_index: 2,
    language: 'de',
    sort_order: 4,
  },
].map(q => ({ ...q, story_id: STORY_ID }));

const { error: storyErr } = await sb.from('stories').insert(story);
if (storyErr) { console.error('Insert story failed:', storyErr.message); process.exit(1); }
console.log(`Story inserted: "${story.title}" (${STORY_ID})`);

const { error: qErr } = await sb.from('comprehension_questions').insert(questions);
if (qErr) { console.error('Insert questions failed:', qErr.message); process.exit(1); }
console.log(`${questions.length} comprehension questions inserted`);

console.log('\nDone!');
