// Run from doich-next/: node scripts/seed-heimat-story.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wclkwxijtpqjnfxusogi.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGt3eGlqdHBxam5meHVzb2dpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ4NjQwNywiZXhwIjoyMDk1MDYyNDA3fQ.1t-Tv4B_EF0JukCYRgqqzIAhtKSwPRU0ZM_ACWofLlA';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Story body ──────────────────────────────────────────────────────────────
const body = [
  {
    text: 'Als das Flugzeug nach elf Stunden endlich in Ulaanbaatar landete, hatte Nara das Gefühl, in eine Stadt zurückzukehren, die es so, wie sie sie in Erinnerung behalten hatte, längst nicht mehr gab. Sieben Jahre waren vergangen, seit sie nach Deutschland gegangen war — sieben Jahre, in denen sie sich, ohne es zu merken, verändert hatte.',
    translation: 'Онгоц арван нэгэн цагийн дараа эцэст нь Улаанбаатарт газардахад Нара санаандаа хадгалж байсан хэлбэрээрээ аль хэдийн байхгүй болсон хот руу буцаж ирсэн мэт санагдав. Түүнийг Германд явснаас хойш долоон жил өнгөрчээ — энэ долоон жилийн дотор тэр өөрийгөө ч мэдэлгүй өөрчлөгдсөн байлаа.',
  },
  {
    text: 'Ihre Mutter, die am Flughafen wartete, umarmte sie lange. Später, beim Tee, sagte sie, Nara spreche inzwischen anders, irgendwie vorsichtiger, als wäge sie jedes Wort ab.',
    translation: 'Нисэх онгоцны буудал дээр хүлээж байсан ээж нь түүнийг удтал тэвэрлээ. Дараа нь цай ууж байхдаа ээж нь, Нара одоо өөрөөр, ямар нэгэн байдлаар илүү болгоомжтой, үг бүрээ жинлэн хэлдэг болсон гэж хэлэв.',
  },
  {
    text: 'Nara lachte, doch insgeheim wusste sie, dass ihre Mutter recht hatte. In Deutschland hatte sie gelernt, Sätze erst im Kopf zu ordnen, bevor sie sie aussprach — eine in der fremden Sprache erworbene Gewohnheit, die sich nun, im eigenen Land, seltsam anfühlte.',
    translation: 'Нара инээсэн ч дотроо ээжийнхээ зөв болохыг мэдэж байлаа. Германд тэр өгүүлбэрээ хэлэхээсээ өмнө толгойдоо эмхлэн цэгцлэхийг сурсан байв — гадаад хэлэн дээр олж авсан энэ дадал нь одоо төрөлх нутагтаа нэг л эвгүй санагдаж байлаа.',
  },
  {
    text: 'Die Stadt, durch die sie am nächsten Tag ging, war lauter, schneller, voller geworden. Neue, in Glas und Stahl errichtete Hochhäuser standen dort, wo früher der kleine Markt gewesen war, auf dem ihr Großvater Pferdemilch verkauft hatte. Hätte ihr jemand vor sieben Jahren gesagt, dass sie sich in ihrer eigenen Heimatstadt einmal verlaufen würde, sie hätte es nicht geglaubt.',
    translation: 'Маргааш нь түүний алхаж явсан хот улам чанга, хурдан, дүүрэн болжээ. Шил, ган гангаар босгосон шинэ өндөр барилгууд урьд нь өвөө нь гүүний сүү зардаг байсан жижиг зах байрлаж байсан газар зогсож байв. Долоон жилийн өмнө хэн нэгэн түүнд "Чи нэг л өдөр төрсөн хотдоо замаа алдана" гэж хэлсэн бол тэр итгэхгүй байх байсан.',
  },
  {
    text: 'Am meisten irritierte sie eine Frage, die ihr eine alte Schulfreundin stellte: ob sie denn nun Deutsche sei oder Mongolin. Nara wusste keine Antwort. In Deutschland galt sie als die Ausländerin; hier, so schien es, als die, die fortgegangen und fremd zurückgekommen war.',
    translation: 'Хамгийн их түүнийг тээнэгэлзүүлсэн зүйл бол хуучин ангийн найз охиных нь асуусан асуулт байв: чи одоо герман хүн үү, эсвэл монгол хүн үү гэж. Нара хариулт олж чадсангүй. Германд түүнийг гадаад хүн гэж үздэг; харин энд, явсан бөгөөд харь болж буцаж ирсэн хүн гэж үздэг бололтой.',
  },
  {
    text: 'Erst auf dem Rückflug, hoch über der endlosen Steppe, begriff sie etwas, das sich nur schwer in Worte fassen ließ: Heimat war für sie kein Ort mehr, den man verlassen oder zu dem man zurückkehren konnte, sondern eine Möglichkeitsform — etwas, das immer im Konjunktiv stand. Sie gehörte nicht mehr ganz dorthin, woher sie kam, und noch nicht ganz dorthin, wohin sie ging. Und vielleicht, dachte sie, während die Lichter Ulaanbaatars unter den Wolken verschwanden, war gerade dieses Dazwischen ihr eigentliches Zuhause geworden.',
    translation: 'Зөвхөн буцах нислэгийн үеэр, төгсгөлгүй тал хээрийн дээгүүр өндөрт нисэж явахдаа л тэр үгээр илэрхийлэхэд бэрх нэгэн зүйлийг ойлгов: эх нутаг гэдэг түүний хувьд орхиж болох, эсвэл буцаж ирж болох газар биш, харин боломжит хэлбэр — үргэлж "болзолт" (Konjunktiv) хэлбэрт оршдог зүйл болсон байв. Тэр ирсэн газартаа бүрэн харьяалагдахаа больсон, очих газартаа ч хараахан бүрэн харьяалагдаагүй байв. Улаанбаатарын гэрэл үүлэн доор алга болж байх зуур тэр бодов: магадгүй яг энэ "хоёрын хооронд" байх байдал нь түүний жинхэнэ гэр орон болсон байж мэднэ.',
  },
];

// ── New words ───────────────────────────────────────────────────────────────
const new_words = [
  { de: 'in Erinnerung behalten', mn: 'санаандаа хадгалах' },
  { de: '(etw.) abwägen', mn: '(үг, шийдвэрийг) жинлэх, тунгаах' },
  { de: 'insgeheim', mn: 'дотроо, нууцаар' },
  { de: 'erwerben (erworben)', mn: 'олж авах, эзэмших' },
  { de: 'die Gewohnheit', mn: 'дадал, зуршил' },
  { de: 'errichten', mn: 'барих, босгох' },
  { de: 'sich verlaufen', mn: 'замаа алдах' },
  { de: 'irritieren', mn: 'тээнэгэлзүүлэх, эргэлзүүлэх' },
  { de: 'gelten als', mn: '… гэж тооцогдох, үзэгдэх' },
  { de: 'begreifen', mn: 'ухаарах, гүн ойлгох' },
  { de: 'sich in Worte fassen lassen', mn: 'үгээр илэрхийлэгдэх' },
  { de: 'die Möglichkeitsform', mn: 'боломжит хэлбэр (дүрмийн нэр томьёо)' },
  { de: 'das Dazwischen', mn: 'хоёрын хооронд байх байдал' },
  { de: 'die Steppe', mn: 'тал хээр' },
];

// ── Comprehension questions ─────────────────────────────────────────────────
const questions = [
  {
    question: 'Warum hat Naras Mutter den Eindruck, dass sich ihre Tochter verändert hat?',
    options: [
      'Weil Nara kein Mongolisch mehr spricht',
      'Weil Nara nun überlegter und vorsichtiger spricht',
      'Weil Nara nicht mehr mit ihr reden möchte',
      'Weil Nara ihre Familie vergessen hat',
    ],
    correct_index: 1,
    sort_order: 0,
  },
  {
    question: 'Was bedeutet im Text, dass Nara sich in ihrer eigenen Heimatstadt verlaufen hat?',
    options: [
      'Sie hat ihren Stadtplan verloren',
      'Die Stadt hat sich so stark verändert, dass sie ihr fremd geworden ist',
      'Sie kann nicht mehr Auto fahren',
      'Sie war noch nie zuvor in Ulaanbaatar',
    ],
    correct_index: 1,
    sort_order: 1,
  },
  {
    question: 'Wie reagiert Nara auf die Frage, ob sie Deutsche oder Mongolin sei?',
    options: [
      'Sie sagt, sie sei eindeutig Mongolin',
      'Sie weiß keine eindeutige Antwort',
      'Sie ärgert sich und geht weg',
      'Sie sagt, sie sei inzwischen Deutsche geworden',
    ],
    correct_index: 1,
    sort_order: 2,
  },
  {
    question: 'Was meint Nara am Ende mit „Heimat im Konjunktiv"?',
    options: [
      'Dass sie die deutsche Grammatik besonders liebt',
      'Dass Heimat für sie kein fester Ort mehr ist, sondern ein Zustand des Dazwischen',
      'Dass sie nie wieder in die Mongolei zurückkehren will',
      'Dass sie in Deutschland endgültig eine neue Heimat gefunden hat',
    ],
    correct_index: 1,
    sort_order: 3,
  },
  {
    question: 'Welche Aussage über Naras Gefühle trifft am ehesten zu?',
    options: [
      'Sie bereut ihre Entscheidung, nach Deutschland gegangen zu sein',
      'Sie fühlt sich weder in Deutschland noch in der Mongolei vollständig zugehörig',
      'Sie ist froh, dass sich in Ulaanbaatar nichts verändert hat',
      'Sie möchte ihre Mutter zu sich nach Deutschland holen',
    ],
    correct_index: 1,
    sort_order: 4,
  },
];

async function main() {
  // Check existing C1 stories to pick sort_order
  const { data: existing, error: fetchErr } = await supabase
    .from('stories')
    .select('id, title, sort_order')
    .eq('level', 'C1')
    .order('sort_order', { ascending: false })
    .limit(5);

  if (fetchErr) {
    console.error('Failed to fetch existing stories:', fetchErr);
    process.exit(1);
  }

  console.log('Existing C1 stories:', existing);
  const nextSortOrder = existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 1;
  console.log(`Using sort_order: ${nextSortOrder}`);

  // Insert story
  const { data: story, error: storyErr } = await supabase
    .from('stories')
    .insert({
      title: 'Heimat im Konjunktiv',
      level: 'C1',
      sort_order: nextSortOrder,
      body,
      new_words,
    })
    .select()
    .single();

  if (storyErr) {
    console.error('Failed to insert story:', storyErr);
    process.exit(1);
  }

  console.log(`Story inserted: ${story.id} — "${story.title}"`);

  // Insert comprehension questions
  const questionsWithStoryId = questions.map(q => ({
    ...q,
    story_id: story.id,
    language: 'de',
  }));

  const { error: qErr } = await supabase
    .from('comprehension_questions')
    .insert(questionsWithStoryId);

  if (qErr) {
    console.error('Failed to insert questions:', qErr);
    process.exit(1);
  }

  console.log(`${questions.length} comprehension questions inserted.`);
  console.log('Done!');
}

main().catch(console.error);
