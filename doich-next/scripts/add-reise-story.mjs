// Run from doich-next/: node scripts/add-reise-story.mjs
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const STORY_ID = 'b1000000-3000-0000-0000-000000000005';

const env = readFileSync('.env.local', 'utf8');
const get = key => env.match(new RegExp(`${key}=(.+)`))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const story = {
  id: STORY_ID,
  title: 'Eine Reise mit Hindernissen',
  level: 'B1',
  sort_order: 5,
  is_ai_generated: false,
  body: [
    {
      text: 'Tsetseg wollte ihre Freundin Anna in Hamburg besuchen. Sie hatte sich schon lange auf das Wochenende gefreut. Am Freitagnachmittag fuhr sie mit dem Koffer zum Bahnhof, weil ihr Zug um 15 Uhr abfahren sollte.',
      translation: 'Цэцэг найз Анна-г Гамбург хотод очиж эргэхийг хүсэж байв. Тэр энэ амралтын өдрийг эрт дээр үеэс баярлан хүлээж байлаа. Баасан гарагийн үдээс хойш тэр чемоданаа аваад галт тэрэгний буудал руу явсан, учир нь галт тэрэг нь 15 цагт хөдлөх ёстой байв.',
    },
    {
      text: 'Doch als sie am Bahnhof ankam, sah sie auf der Anzeigetafel ein rotes Wort: „Ausfall". Ihr Zug fuhr heute nicht. „Das darf nicht wahr sein", dachte Tsetseg. Obwohl sie ein bisschen wütend war, blieb sie ruhig und ging zur Information.',
      translation: 'Гэвч буудалд ирэхэд мэдээллийн самбар дээр улаан үг харав: „Цуцлагдсан". Түүний галт тэрэг өнөөдөр явахгүй болжээ. „Ийм байж таарахгүй" гэж Цэцэг бодов. Тэр жаахан ууртай байсан ч тайван байж, мэдээллийн цэг рүү явав.',
    },
    {
      text: 'Ein freundlicher Mitarbeiter erklärte ihr, dass sie einen späteren Zug nehmen könne. „Sie müssen aber in Hannover umsteigen", sagte er. Tsetseg war nicht begeistert, denn die Reise dauerte jetzt zwei Stunden länger. Trotzdem kaufte sie ein neues Ticket und wartete geduldig.',
      translation: 'Найрсаг нэг ажилтан түүнд дараагийн галт тэрэгээр явж болно гэж тайлбарлав. „Гэхдээ та Ганновер хотод шилжин суух хэрэгтэй" гэв. Цэцэг тийм ч баяргүй байв, учир нь аялал одоо хоёр цагаар уртсав. Гэсэн ч тэр шинэ тасалбар авч, тэвчээртэйгээр хүлээв.',
    },
    {
      text: 'Im Zug lernte sie eine ältere Frau kennen. Sie unterhielten sich über das Reisen und über das Leben in Deutschland. Die Zeit verging schnell, und plötzlich fand Tsetseg die Verspätung gar nicht mehr so schlimm.',
      translation: 'Галт тэргэн дотор тэр нэг настай эмэгтэйтэй танилцав. Тэд аялал болон Германд амьдрах тухай ярилцав. Цаг хурдан өнгөрч, гэнэт Цэцэгт хоцрол тийм ч муу зүйл биш санагдав.',
    },
    {
      text: 'Als sie endlich in Hamburg ankam, war es schon dunkel. Anna wartete am Bahnsteig und umarmte sie. „Ich habe mir Sorgen gemacht!", sagte Anna. „Es war kompliziert", lachte Tsetseg, „aber ich habe unterwegs eine nette Frau getroffen."',
      translation: 'Эцэст нь Гамбургт ирэхэд аль хэдийн харанхуй болсон байв. Анна перрон дээр хүлээж байгаад түүнийг тэвэрлэв. „Би санаа зовсон шүү!" гэж Анна хэлэв. „Жаахан төвөгтэй байсан" гэж Цэцэг инээв, „гэхдээ би замдаа нэг сайхан эмэгтэйтэй танилцсан."',
    },
    {
      text: 'Später dachte Tsetseg: Manchmal läuft nicht alles nach Plan. Aber wenn man ruhig bleibt, wird am Ende doch alles gut. Das Wochenende mit Anna war wunderschön — und die lange Reise hatte sich gelohnt.',
      translation: 'Хожим Цэцэг бодов: Заримдаа бүх зүйл төлөвлөсний дагуу болдоггүй. Гэвч хүн тайван байвал эцэст нь бүх зүйл сайхан болдог. Анна-тай өнгөрүүлсэн амралтын өдөр гайхалтай байсан — урт аялал ч зүтгэлээ нөхсөн.',
    },
  ],
  new_words: [
    { de: 'das Hindernis', mn: 'саад бэрхшээл' },
    { de: 'sich freuen auf', mn: '(ирээдүйн зүйлийг) баярлан хүлээх' },
    { de: 'abfahren', mn: 'хөдлөх, явах' },
    { de: 'die Anzeigetafel', mn: 'мэдээллийн самбар' },
    { de: 'der Ausfall', mn: 'цуцлалт (галт тэрэг гэх мэт)' },
    { de: 'wütend', mn: 'уурласан' },
    { de: 'der Mitarbeiter', mn: 'ажилтан' },
    { de: 'umsteigen', mn: '(өөр унаанд) шилжин суух' },
    { de: 'begeistert', mn: 'сэтгэл догдолсон, баясан' },
    { de: 'geduldig', mn: 'тэвчээртэй' },
    { de: 'kennenlernen', mn: 'танилцах' },
    { de: 'die Verspätung', mn: 'хоцрол' },
    { de: 'der Bahnsteig', mn: 'галт тэрэгний тавцан' },
    { de: 'sich Sorgen machen', mn: 'санаа зовох' },
    { de: 'sich lohnen', mn: 'үнэ цэнэтэй байх, зүтгэлээ нөхөх' },
  ],
};

const questions = [
  {
    question: 'Warum ist Tsetseg zum Bahnhof gefahren?',
    question_mn: null,
    options: [
      'Um in Hamburg zu arbeiten',
      'Um ihre Freundin Anna in Hamburg zu besuchen',
      'Um einen neuen Koffer zu kaufen',
      'Um Anna vom Bahnhof abzuholen',
    ],
    correct_index: 1,
    language: 'de',
    sort_order: 0,
  },
  {
    question: 'Was war das Problem, als sie am Bahnhof ankam?',
    question_mn: null,
    options: [
      'Sie hatte ihr Ticket vergessen',
      'Der Bahnhof war geschlossen',
      'Ihr Zug fiel aus',
      'Sie hatte kein Geld mehr',
    ],
    correct_index: 2,
    language: 'de',
    sort_order: 1,
  },
  {
    question: 'Wie reagierte Tsetseg auf die schlechte Nachricht?',
    question_mn: null,
    options: [
      'Sie blieb ruhig und ging zur Information',
      'Sie fuhr sofort wieder nach Hause',
      'Sie wurde laut und ärgerte sich lange',
      'Sie rief die Polizei',
    ],
    correct_index: 0,
    language: 'de',
    sort_order: 2,
  },
  {
    question: 'Warum fand Tsetseg die Verspätung am Ende nicht mehr so schlimm?',
    question_mn: null,
    options: [
      'Weil der Zug doch pünktlich war',
      'Weil sie im Zug eine nette Frau kennenlernte',
      'Weil sie die ganze Fahrt schlief',
      'Weil die Reise am Ende kürzer wurde',
    ],
    correct_index: 1,
    language: 'de',
    sort_order: 3,
  },
  {
    question: 'Was ist die Lehre der Geschichte?',
    question_mn: null,
    options: [
      'Man sollte nie mit dem Zug fahren',
      'Reisen bringt immer nur Ärger',
      'Wenn man ruhig bleibt, wird am Ende oft alles gut',
      'Freunde sind nicht so wichtig',
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
