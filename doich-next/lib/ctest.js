// C-Test — Studienkolleg-style cloze test engine + text bank
//
// Classic C-principle:
//   • first and last sentence stay fully intact
//   • from the second sentence on, every 2nd word loses its second half
//   • odd letter count → the larger half is deleted (keep floor(n/2))
//   • 1-letter words and numbers are skipped (they don't count)
//   • 30 gaps per text, 4 texts per test, 30 minutes total
// Recommended from B1 upwards.

export const GAPS_PER_TEXT = 30;
export const TEXTS_PER_TEST = 4;
export const EXAM_SECONDS = 30 * 60;
export const CTEST_LEVEL_HINT = 'B1+';

export const CTEST_TESTS = [
  {
    id: 'ctest-1',
    name: 'C-Test 1',
    texts: [
      {
        title: 'Warum Schlaf so wichtig ist',
        first: 'Guter Schlaf ist für die Gesundheit des Menschen von großer Bedeutung.',
        middle:
          'Während der Nacht erholt sich der Körper von den Anstrengungen des Tages. Das Gehirn verarbeitet im Schlaf die vielen Informationen, die es am Tag aufgenommen hat. Wer dauerhaft zu wenig schläft, kann sich schlecht konzentrieren und wird schneller krank. Erwachsene Menschen brauchen im Durchschnitt sieben bis acht Stunden Schlaf pro Nacht. Auch die Qualität des Schlafes spielt eine große Rolle für das Wohlbefinden. Ein dunkles und ruhiges Zimmer hilft dabei, schnell einzuschlafen und tief durchzuschlafen.',
        last: 'Wer auf seinen Schlaf achtet, lebt gesünder und fühlt sich im Alltag besser.',
      },
      {
        title: 'Mit dem Fahrrad durch die Stadt',
        first: 'Immer mehr Menschen in deutschen Städten fahren mit dem Fahrrad zur Arbeit.',
        middle:
          'Das Fahrrad hat gegenüber dem Auto viele Vorteile, besonders im dichten Stadtverkehr. Wer regelmäßig mit dem Rad fährt, tut etwas für seine Gesundheit und spart gleichzeitig Geld. Außerdem verursacht das Fahrrad keine Abgase und schont damit die Umwelt. Viele Städte bauen deshalb neue Radwege und sichere Abstellplätze für Fahrräder. In manchen Gegenden kommt man mit dem Rad sogar schneller ans Ziel als mit dem Auto, weil man nicht im Stau stehen muss.',
        last: 'Experten erwarten, dass die Bedeutung des Fahrrads in Zukunft weiter zunehmen wird.',
      },
      {
        title: 'Honig – ein natürliches Lebensmittel',
        first: 'Honig gehört zu den ältesten Lebensmitteln der Menschheit.',
        middle:
          'Schon vor tausenden von Jahren sammelten die Menschen den süßen Saft der Bienen. Honig enthält neben Zucker auch viele wertvolle Stoffe, zum Beispiel Vitamine und Enzyme. Deshalb gilt er als gesünder als normaler Zucker, sollte aber trotzdem nur in kleinen Mengen gegessen werden. Viele Menschen trinken bei einer Erkältung gern heißen Tee mit Honig, weil er den Hals beruhigt. Auch in der Küche wird Honig vielseitig verwendet, etwa zum Backen oder für süße Soßen.',
        last: 'Ohne die fleißigen Bienen gäbe es dieses besondere Naturprodukt allerdings nicht.',
      },
      {
        title: 'Lesen macht klug',
        first: 'Regelmäßiges Lesen hat viele positive Wirkungen auf das Gehirn.',
        middle:
          'Wer oft liest, erweitert seinen Wortschatz und verbessert sein Gedächtnis. Beim Lesen entstehen im Kopf eigene Bilder, was die Fantasie und die Kreativität fördert. Studien zeigen außerdem, dass Lesen Stress abbauen kann und beim Einschlafen hilft. Kinder, denen die Eltern regelmäßig vorlesen, lernen später leichter und haben in der Schule oft bessere Noten. Dabei spielt es keine große Rolle, ob man gedruckte Bücher oder elektronische Texte liest.',
        last: 'Ein gutes Buch ist deshalb mehr als nur eine angenehme Freizeitbeschäftigung.',
      },
    ],
  },
  {
    id: 'ctest-2',
    name: 'C-Test 2',
    texts: [
      {
        title: 'Kaffee – das Lieblingsgetränk der Deutschen',
        first: 'Kaffee ist das beliebteste Getränk in Deutschland.',
        middle:
          'Im Durchschnitt trinkt jeder Erwachsene mehr als hundert Liter Kaffee pro Jahr. Das im Kaffee enthaltene Koffein macht müde Menschen wach und steigert kurzfristig die Konzentration. In kleinen Mengen ist Kaffee für gesunde Erwachsene nicht schädlich, wie viele Studien zeigen. Wer jedoch zu viel davon trinkt, kann nervös werden und schlecht schlafen. Besonders am Abend sollte man deshalb besser auf das Getränk verzichten und stattdessen Tee oder Wasser wählen.',
        last: 'Trotz aller Warnungen bleibt der Kaffee für viele Menschen ein fester Teil des Alltags.',
      },
      {
        title: 'Müll trennen und Rohstoffe sparen',
        first: 'In Deutschland wird der Müll seit vielen Jahren getrennt gesammelt.',
        middle:
          'Papier, Glas und Plastik kommen in verschiedene Tonnen und Container. Aus dem alten Material können die Fabriken danach neue Produkte herstellen. Auf diese Weise werden wertvolle Rohstoffe gespart und die Umwelt wird geschont. Trotzdem landet noch immer viel Abfall im falschen Behälter, weil viele Menschen unsicher sind. Wer richtig trennen will, sollte sich deshalb über die Regeln in seiner Stadt informieren. Auch der Verzicht auf unnötige Verpackungen hilft, die Menge des Mülls zu verringern.',
        last: 'Jeder Einzelne kann also einen Beitrag zum Schutz der Umwelt leisten.',
      },
      {
        title: 'Sport stärkt auch das Gehirn',
        first: 'Regelmäßige Bewegung ist nicht nur gut für den Körper.',
        middle:
          'Auch das Gehirn profitiert davon, wenn wir regelmäßig Sport treiben. Durch die Bewegung wird das Gehirn besser mit Sauerstoff versorgt und kann schneller arbeiten. Menschen, die regelmäßig trainieren, können sich besser konzentrieren und neue Dinge leichter lernen. Außerdem schüttet der Körper beim Sport Hormone aus, die gute Laune machen und Stress abbauen. Schon ein täglicher Spaziergang von dreißig Minuten reicht aus, um diese positiven Wirkungen zu erreichen.',
        last: 'Wer also fit bleiben will, sollte Bewegung fest in seinen Alltag einbauen.',
      },
      {
        title: 'Warum Wasser trinken so wichtig ist',
        first: 'Der menschliche Körper besteht zu einem großen Teil aus Wasser.',
        middle:
          'Jeden Tag verliert der Mensch Flüssigkeit, zum Beispiel durch Schwitzen und Atmen. Deshalb müssen wir regelmäßig trinken, am besten Wasser oder ungesüßten Tee. Wer zu wenig trinkt, bekommt schnell Kopfschmerzen und kann sich schlecht konzentrieren. Experten empfehlen für Erwachsene etwa eineinhalb bis zwei Liter Flüssigkeit am Tag. Bei großer Hitze oder beim Sport braucht der Körper sogar noch deutlich mehr. Süße Getränke wie Limonade sind dagegen keine gute Wahl, weil sie viel Zucker enthalten.',
        last: 'Ein Glas Wasser am Morgen ist deshalb ein guter Start in den Tag.',
      },
    ],
  },
  {
    id: 'ctest-3',
    name: 'C-Test 3',
    texts: [
      {
        title: 'Das Smartphone – ständiger Begleiter',
        first: 'Das Smartphone ist aus dem modernen Leben kaum noch wegzudenken.',
        middle:
          'Die meisten Menschen nutzen ihr Gerät viele Stunden am Tag. Mit dem Smartphone kann man telefonieren, Nachrichten schreiben, Fotos machen und im Internet surfen. Diese vielen Möglichkeiten haben jedoch auch eine andere Seite. Wer ständig auf den Bildschirm schaut, schläft oft schlechter und kann sich weniger gut konzentrieren. Experten raten deshalb zu festen Pausen, in denen das Gerät ausgeschaltet bleibt. Besonders beim Essen und vor dem Schlafen sollte das Telefon zur Seite gelegt werden.',
        last: 'Ein bewusster Umgang mit der Technik macht das Leben entspannter.',
      },
      {
        title: 'Der Wald – mehr als nur Bäume',
        first: 'Wälder bedecken etwa ein Drittel der Fläche Deutschlands.',
        middle:
          'Sie produzieren Sauerstoff, reinigen die Luft und speichern große Mengen Wasser. Außerdem bieten sie vielen Tieren und Pflanzen einen wichtigen Lebensraum. Für die Menschen ist der Wald ein beliebter Ort zur Erholung. Ein Spaziergang zwischen den Bäumen senkt den Stress und stärkt das Immunsystem. Durch den Klimawandel sind die Wälder jedoch in Gefahr, denn lange Trockenheit schadet den Bäumen. Deshalb pflanzen viele Förster heute neue Arten, die mit Hitze besser zurechtkommen.',
        last: 'Der Schutz der Wälder gehört zu den wichtigsten Aufgaben unserer Zeit.',
      },
      {
        title: 'Musik und Gefühle',
        first: 'Musik begleitet die Menschen seit Beginn ihrer Geschichte.',
        middle:
          'Schon kleine Kinder bewegen sich, wenn sie einen Rhythmus hören. Beim Hören von Musik werden im Gehirn Glückshormone ausgeschüttet, die gute Laune machen. Traurige Lieder können dagegen helfen, schwierige Gefühle besser zu verarbeiten. Viele Menschen lernen auch ein Instrument, weil das Spielen das Gedächtnis trainiert und Geduld fördert. Welche Musik einem Menschen gefällt, hängt oft von seinen Erfahrungen ab. In der Medizin wird Musik sogar als Therapie eingesetzt, zum Beispiel bei Patienten mit Schmerzen oder Angst.',
        last: 'Musik ist damit weit mehr als nur eine schöne Unterhaltung.',
      },
      {
        title: 'Ein gutes Frühstück',
        first: 'Das Frühstück gilt als die wichtigste Mahlzeit des Tages.',
        middle:
          'Nach der langen Nacht braucht der Körper am Morgen neue Energie. Ein gesundes Frühstück besteht zum Beispiel aus Brot, Obst und einem Milchprodukt. Wer morgens gut isst, kann sich in der Schule oder bei der Arbeit besser konzentrieren. Viele Menschen verlassen das Haus jedoch ohne Frühstück, weil sie keine Zeit haben. Das ist keine gute Idee, denn der Hunger kommt später umso stärker. Dann greifen viele zu süßen Snacks, die dem Körper nicht guttun.',
        last: 'Wer sich morgens ein paar Minuten Zeit nimmt, startet besser in den Tag.',
      },
    ],
  },
  {
    id: 'ctest-4',
    name: 'C-Test 4',
    texts: [
      {
        title: 'Bienen in Gefahr',
        first: 'Bienen spielen eine zentrale Rolle in der Natur.',
        middle:
          'Sie fliegen von Blüte zu Blüte und bestäuben dabei die Pflanzen. Ohne diese Arbeit gäbe es viel weniger Obst und Gemüse auf unseren Tellern. Seit einigen Jahren sterben jedoch immer mehr Bienen, und die Wissenschaftler suchen nach den Gründen. Eine wichtige Ursache ist der Einsatz von giftigen Mitteln in der Landwirtschaft. Auch fehlen den Tieren in vielen Regionen die Blumen, die sie als Nahrung brauchen. Jeder kann den Bienen helfen, zum Beispiel mit blühenden Pflanzen auf dem Balkon.',
        last: 'Der Schutz dieser kleinen Tiere ist deshalb eine große Aufgabe für uns alle.',
      },
      {
        title: 'Studieren von zu Hause',
        first: 'Immer mehr Studenten besuchen Vorlesungen über das Internet.',
        middle:
          'Beim digitalen Lernen kann man sich die Zeit frei einteilen und von jedem Ort aus arbeiten. Das ist besonders praktisch für Menschen, die neben dem Studium arbeiten müssen. Allerdings hat diese Form des Lernens auch Nachteile, denn der persönliche Kontakt fehlt. Viele Studenten vermissen die Gespräche mit anderen und fühlen sich vor dem Bildschirm allein. Außerdem braucht man viel Disziplin, um zu Hause konzentriert zu bleiben. Die meisten Universitäten bieten deshalb heute eine Mischung aus digitalen und normalen Veranstaltungen an.',
        last: 'So können die Studenten die Vorteile beider Welten nutzen.',
      },
      {
        title: 'Lachen ist gesund',
        first: 'Lachen ist eine der natürlichsten Reaktionen des Menschen.',
        middle:
          'Wenn wir lachen, arbeiten viele Muskeln in unserem Gesicht und im ganzen Körper. Dabei wird die Atmung tiefer, und das Blut nimmt mehr Sauerstoff auf. Gleichzeitig schüttet das Gehirn Hormone aus, die Schmerzen lindern und Stress abbauen können. Menschen, die viel lachen, sind deshalb oft gesünder und fühlen sich wohler. Auch in schwierigen Situationen kann Humor helfen, denn er schafft Abstand zu den Problemen. Manche Krankenhäuser arbeiten sogar mit besonderen Clowns, die kranke Kinder zum Lachen bringen.',
        last: 'Ein herzliches Lachen ist also die beste Medizin, die nichts kostet.',
      },
      {
        title: 'Reisen mit der Bahn',
        first: 'Die Eisenbahn gehört zu den umweltfreundlichsten Verkehrsmitteln.',
        middle:
          'Ein Zug transportiert viele Menschen gleichzeitig und verbraucht dabei vergleichsweise wenig Energie. Wer mit der Bahn fährt, kann die Zeit zum Lesen oder Arbeiten nutzen. Außerdem muss man keinen Parkplatz suchen und steht nie im Stau. Viele Reisende ärgern sich allerdings über Verspätungen und volle Züge. Die Bahn investiert deshalb viel Geld in neue Strecken und moderne Technik. In den kommenden Jahren sollen die Verbindungen zwischen den großen Städten deutlich besser werden.',
        last: 'Dann könnte der Zug für noch mehr Menschen eine echte Alternative zum Auto sein.',
      },
    ],
  },
  {
    id: 'ctest-5',
    name: 'C-Test 5',
    texts: [
      {
        title: 'Obst und Gemüse – bunte Gesundheit',
        first: 'Obst und Gemüse gehören zu einer gesunden Ernährung.',
        middle:
          'Ärzte empfehlen, jeden Tag mindestens fünf Portionen davon zu essen. In den bunten Früchten stecken viele Vitamine, die das Immunsystem stärken. Wer sich gesund ernährt, wird seltener krank und hat mehr Energie im Alltag. Besonders wertvoll sind frische Produkte aus der Region, weil sie keine langen Transportwege haben. Beim Kochen sollte das Gemüse nur kurz erhitzt werden, damit die gesunden Stoffe erhalten bleiben. Auch als kleiner Snack zwischendurch ist ein Apfel besser als Schokolade.',
        last: 'Eine ausgewogene Ernährung ist der einfachste Weg zu einem gesunden Leben.',
      },
      {
        title: 'Künstliche Intelligenz im Alltag',
        first: 'Künstliche Intelligenz verändert unser Leben in vielen Bereichen.',
        middle:
          'Computerprogramme können heute Sprachen übersetzen, Bilder erkennen und sogar Texte schreiben. In der Medizin helfen sie den Ärzten dabei, Krankheiten früher zu entdecken. Auch beim Einkaufen im Internet schlagen kluge Programme den Kunden passende Produkte vor. Viele Menschen machen sich jedoch Sorgen um ihre Arbeitsplätze und ihre persönlichen Daten. Deshalb diskutieren die Politiker über neue Regeln für den Einsatz dieser Technik. Wichtig ist, dass am Ende immer der Mensch die Entscheidungen kontrolliert.',
        last: 'Die kommenden Jahre werden zeigen, wie wir mit dieser Technik leben wollen.',
      },
      {
        title: 'Spazierengehen – einfach und gesund',
        first: 'Spazierengehen ist die einfachste Form der Bewegung.',
        middle:
          'Man braucht dafür keine teure Ausrüstung und kein besonderes Training. Schon ein kurzer Spaziergang bringt den Kreislauf in Schwung und macht den Kopf frei. Wer regelmäßig zu Fuß geht, stärkt sein Herz und verbrennt ganz nebenbei Kalorien. Besonders gesund ist die Bewegung an der frischen Luft, zum Beispiel in einem Park. Viele Menschen haben beim Gehen außerdem die besten Ideen, weil das Gehirn dabei zur Ruhe kommt. Auch ein kurzer Weg in der Mittagspause kann schon viel bewirken.',
        last: 'Wer das Auto öfter stehen lässt, tut seinem Körper jeden Tag etwas Gutes.',
      },
      {
        title: 'Tee – ein Getränk mit Geschichte',
        first: 'Tee wird seit tausenden von Jahren getrunken.',
        middle:
          'Das Getränk stammt aus fernen Ländern und kam erst viel später zu uns. Heute trinken die Menschen auf der ganzen Welt täglich viele Millionen Tassen. Grüner und schwarzer Tee enthalten Koffein und machen deshalb ähnlich wach wie Kaffee. Daneben stecken im Tee auch Stoffe, die Entzündungen hemmen und das Herz schützen können. Kräutertee aus Kamille oder Pfefferminze wird dagegen gern bei Erkältungen getrunken. Die Zubereitung ist einfach, doch die richtige Temperatur des Wassers spielt eine wichtige Rolle.',
        last: 'Eine Tasse Tee ist für viele Menschen ein Moment der Ruhe im Alltag.',
      },
    ],
  },
  {
    id: 'ctest-6',
    name: 'C-Test 6',
    texts: [
      {
        title: 'Haustiere tun uns gut',
        first: 'Millionen Menschen in Deutschland leben mit einem Haustier zusammen.',
        middle:
          'Hunde und Katzen sind dabei die beliebtesten Begleiter im Alltag. Wer ein Tier besitzt, bewegt sich oft mehr und kommt leichter mit anderen Menschen ins Gespräch. Studien zeigen, dass das Streicheln einer Katze den Blutdruck senken kann. Auch einsame Menschen profitieren von der Gesellschaft eines Tieres, weil es ihnen Nähe und Struktur gibt. Allerdings bedeutet ein Haustier auch viel Verantwortung, denn es braucht jeden Tag Futter, Pflege und Aufmerksamkeit. Vor dem Kauf sollte man deshalb gut überlegen, ob genug Zeit vorhanden ist.',
        last: 'Wer sich gut vorbereitet, gewinnt mit einem Tier einen treuen Freund.',
      },
      {
        title: 'Der richtige Umgang mit Geld',
        first: 'Viele junge Menschen lernen erst spät, mit Geld umzugehen.',
        middle:
          'Dabei ist dieses Wissen für das spätere Leben sehr wichtig. Wer seine Ausgaben kennt, kann besser planen und gerät seltener in Schulden. Experten empfehlen, jeden Monat einen kleinen Betrag zu sparen, auch wenn es nur wenig ist. Ein einfaches Haushaltsbuch hilft dabei, den Überblick über die eigenen Finanzen zu behalten. Besonders gefährlich sind Käufe im Internet, weil das Bezahlen dort sehr schnell und einfach geht. Vor größeren Anschaffungen sollte man deshalb immer eine Nacht darüber schlafen.',
        last: 'Ein bewusster Umgang mit Geld gibt Sicherheit und Freiheit zugleich.',
      },
      {
        title: 'Das Wetter und seine Launen',
        first: 'Das Wetter ist in Deutschland ein beliebtes Gesprächsthema.',
        middle:
          'Kein Wunder, denn es ändert sich oft mehrmals am Tag. Auf einen sonnigen Morgen kann schon am Mittag kräftiger Regen folgen. Schuld daran ist die Lage des Landes zwischen dem Meer im Norden und den Bergen im Süden. Die Wettervorhersage ist heute durch moderne Computer viel genauer als früher. Trotzdem können sich die Meteorologen für die nächsten Tage nie ganz sicher sein. Viele Menschen schauen deshalb jeden Morgen auf ihr Handy, bevor sie sich anziehen.',
        last: 'Ein Regenschirm in der Tasche ist in diesem Land also nie eine schlechte Idee.',
      },
      {
        title: 'Fremdsprachen öffnen Türen',
        first: 'Wer eine Fremdsprache spricht, hat im Leben viele Vorteile.',
        middle:
          'Im Beruf werden gute Sprachkenntnisse heute fast überall erwartet. Auch auf Reisen ist es schön, sich mit den Menschen vor Ort unterhalten zu können. Beim Lernen einer neuen Sprache trainiert das Gehirn außerdem sein Gedächtnis. Wissenschaftler haben sogar festgestellt, dass mehrsprachige Menschen im Alter geistig länger fit bleiben. Der Weg zu einer neuen Sprache ist allerdings lang und verlangt viel Geduld. Wichtig sind regelmäßiges Üben und der Mut, Fehler zu machen.',
        last: 'Mit jeder neuen Sprache lernt man auch eine neue Welt kennen.',
      },
    ],
  },
  {
    id: 'ctest-7',
    name: 'C-Test 7',
    texts: [
      {
        title: 'Schokolade in Maßen genießen',
        first: 'Schokolade gehört zu den beliebtesten Süßigkeiten der Welt.',
        middle:
          'Der Kakao in der Schokolade enthält Stoffe, die die Stimmung verbessern können. Beim Essen schüttet das Gehirn Glückshormone aus, und wir fühlen uns wohl. Besonders dunkle Schokolade mit viel Kakao gilt als die gesündere Wahl. Sie kann sogar den Blutdruck leicht senken, wie einige Studien zeigen. Trotzdem sollte man nicht zu viel davon essen, denn Schokolade enthält auch viel Zucker und Fett. Ein kleines Stück am Tag ist deshalb besser als eine ganze Tafel am Abend.',
        last: 'In kleinen Mengen ist die süße Versuchung also durchaus erlaubt.',
      },
      {
        title: 'Plastik im Meer',
        first: 'Jedes Jahr gelangen Millionen Tonnen Plastik in die Meere.',
        middle:
          'Der Müll stammt vor allem von den Küsten und aus den Flüssen. Im Wasser zerfällt das Plastik in winzige Teile, die man kaum noch sehen kann. Viele Fische und Vögel halten diese Teile für Nahrung und fressen sie. So gelangt das Plastik am Ende auch auf unsere Teller. Wissenschaftler suchen deshalb nach Wegen, die Meere wieder sauber zu machen. Jeder Einzelne kann helfen, indem er weniger Plastik kauft und seinen Müll richtig entsorgt.',
        last: 'Der Schutz der Meere beginnt also schon beim Einkaufen im Supermarkt.',
      },
      {
        title: 'Freiwillig für andere da sein',
        first: 'Viele Menschen in Deutschland arbeiten freiwillig und ohne Bezahlung.',
        middle:
          'Sie helfen zum Beispiel bei der Feuerwehr, im Sportverein oder im Altenheim. Diese freiwillige Arbeit ist für die Gesellschaft sehr wertvoll, denn ohne sie würden viele Angebote fehlen. Auch die Helfer selbst profitieren von ihrem Einsatz. Sie lernen neue Menschen kennen und sammeln wichtige Erfahrungen für das Leben. Junge Leute können durch ein freiwilliges Jahr sogar herausfinden, welcher Beruf zu ihnen passt. Wer anderen hilft, fühlt sich außerdem oft zufriedener und weniger allein.',
        last: 'Ein paar Stunden im Monat können also für alle Seiten ein Gewinn sein.',
      },
      {
        title: 'Einkaufen auf dem Wochenmarkt',
        first: 'In vielen Städten findet mehrmals pro Woche ein Markt statt.',
        middle:
          'Dort verkaufen die Händler frisches Obst, Gemüse, Käse und Brot aus der Region. Die Waren sind oft nur wenige Stunden vor dem Verkauf geerntet worden. Deshalb schmecken sie meist besser als die Produkte aus dem Supermarkt. Auf dem Markt kann man die Verkäufer außerdem direkt nach der Herkunft der Lebensmittel fragen. Viele Kunden schätzen auch das besondere Erlebnis zwischen den bunten Ständen. Wer am Ende des Tages kommt, bekommt die Reste oft sogar günstiger.',
        last: 'Ein Besuch auf dem Wochenmarkt lohnt sich also aus vielen Gründen.',
      },
    ],
  },
  {
    id: 'ctest-8',
    name: 'C-Test 8',
    texts: [
      {
        title: 'Gesund durch den Winter',
        first: 'Im Winter werden viele Menschen häufiger krank als im Sommer.',
        middle:
          'In der kalten Jahreszeit verbreiten sich Viren besonders schnell. Die Menschen halten sich öfter in geschlossenen Räumen auf und stecken sich dort gegenseitig an. Wer gesund bleiben will, sollte sich regelmäßig die Hände waschen. Auch frische Luft und Bewegung stärken die Abwehrkräfte des Körpers. Wichtig ist außerdem eine Ernährung mit vielen Vitaminen, zum Beispiel aus frischem Obst und Gemüse. Bei trockener Luft in geheizten Zimmern hilft regelmäßiges Lüften.',
        last: 'Mit diesen einfachen Regeln kommt man gut durch die kalte Jahreszeit.',
      },
      {
        title: 'Berufe der Zukunft',
        first: 'Die Arbeitswelt verändert sich heute schneller als je zuvor.',
        middle:
          'Viele Berufe, die es früher gab, sind inzwischen fast verschwunden. Gleichzeitig entstehen durch die Technik ständig neue Tätigkeiten mit anderen Anforderungen. Experten raten jungen Menschen deshalb, sich auf lebenslanges Lernen einzustellen. Wer flexibel bleibt und sich regelmäßig weiterbildet, hat auf dem Arbeitsmarkt die besten Chancen. Neben dem Fachwissen werden auch soziale Fähigkeiten immer wichtiger, denn Maschinen können keine Gespräche mit Kunden führen. Kreativität und Teamarbeit lassen sich nur schwer ersetzen.',
        last: 'Die Zukunft gehört den Menschen, die offen für Veränderungen sind.',
      },
      {
        title: 'Vokabeln richtig lernen',
        first: 'Beim Lernen einer Sprache spielen Vokabeln eine zentrale Rolle.',
        middle:
          'Viele Lernende schreiben die neuen Wörter in lange Listen und wiederholen sie immer wieder. Diese Methode ist jedoch nicht besonders wirksam, wie Forscher herausgefunden haben. Besser ist es, die Wörter in ganzen Sätzen und mit Beispielen zu lernen. Auch kleine Karten mit Bildern helfen dem Gedächtnis bei der Arbeit. Wer die neuen Begriffe in Gesprächen benutzt, vergisst sie nicht so schnell. Wichtig sind außerdem regelmäßige Pausen zwischen den Lernphasen.',
        last: 'Mit der richtigen Methode bleibt der neue Wortschatz lange im Kopf.',
      },
      {
        title: 'Stadt oder Land?',
        first: 'Viele Familien stellen sich die Frage, wo sie leben möchten.',
        middle:
          'Das Leben in der Stadt bietet kurze Wege, viele Geschäfte und ein großes Angebot an Kultur. Dafür sind die Wohnungen dort teuer, und auf den Straßen ist es laut. Auf dem Land finden die Menschen dagegen Ruhe, Natur und günstigere Häuser. Allerdings brauchen sie oft ein Auto, weil Busse und Bahnen nur selten fahren. Auch die Wege zur Arbeit und zu den Schulen sind länger. Am Ende hängt die Entscheidung von den eigenen Wünschen ab.',
        last: 'Beide Lebensformen haben also ihre Vorteile und ihre Nachteile.',
      },
    ],
  },
  {
    id: 'ctest-9',
    name: 'C-Test 9',
    texts: [
      {
        title: 'Die Bibliothek – mehr als Bücher',
        first: 'Öffentliche Bibliotheken gehören zu den wichtigsten Einrichtungen einer Stadt.',
        middle:
          'Dort kann man nicht nur Bücher, sondern auch Filme und Spiele ausleihen. Viele Bibliotheken bieten ihren Besuchern außerdem ruhige Plätze zum Lernen und Arbeiten. Studenten nutzen diese Räume gern für die Vorbereitung auf ihre Prüfungen. Der Eintritt ist meistens frei, und die Ausleihe kostet nur wenig Geld. Auch für Kinder gibt es besondere Angebote, zum Beispiel Lesungen mit spannenden Geschichten. In modernen Bibliotheken stehen den Nutzern sogar Computer und schnelles Internet zur Verfügung.',
        last: 'Ein Besuch in der Bibliothek lohnt sich also für die ganze Familie.',
      },
      {
        title: 'Gemeinsam kochen',
        first: 'Kochen ist für viele Menschen mehr als eine tägliche Pflicht.',
        middle:
          'Wer zusammen mit anderen kocht, verbindet das Essen mit einem schönen Erlebnis. In der Küche kann jeder eine Aufgabe übernehmen, vom Schneiden des Gemüses bis zum Decken des Tisches. Kinder lernen dabei spielerisch den Umgang mit frischen Lebensmitteln. Gemeinsame Mahlzeiten stärken außerdem den Zusammenhalt in der Familie. Studien zeigen, dass selbst gekochtes Essen meistens gesünder ist als fertige Produkte aus dem Supermarkt. Außerdem spart das Kochen zu Hause eine Menge Geld.',
        last: 'Ein gemeinsamer Abend in der Küche macht also satt und glücklich zugleich.',
      },
      {
        title: 'Pünktlichkeit',
        first: 'Pünktlichkeit gilt in Deutschland als eine besonders wichtige Eigenschaft.',
        middle:
          'Wer zu einem Termin zu spät kommt, macht schnell einen schlechten Eindruck. In der Arbeitswelt kann Unpünktlichkeit sogar ernste Folgen haben. Deshalb planen viele Menschen für ihre Wege immer etwas mehr Zeit ein. Auch bei privaten Treffen wird erwartet, dass man zur vereinbarten Zeit erscheint. Wer sich verspätet, sollte rechtzeitig anrufen und kurz Bescheid geben. In anderen Ländern gehen die Menschen mit der Zeit oft viel lockerer um.',
        last: 'Wer diese kulturellen Unterschiede kennt, vermeidet unangenehme Situationen.',
      },
      {
        title: 'Computerspiele',
        first: 'Computerspiele gehören heute zu den beliebtesten Freizeitbeschäftigungen junger Menschen.',
        middle:
          'Viele Eltern machen sich deshalb Sorgen um ihre Kinder. Dabei haben Studien gezeigt, dass Spiele auch positive Wirkungen haben können. Bei manchen Spielen trainieren die Spieler ihre Reaktion und ihr räumliches Denken. In anderen müssen sie knifflige Aufgaben lösen oder mit anderen Spielern zusammenarbeiten. Problematisch wird es erst, wenn die Zeit vor dem Bildschirm zu lang wird. Experten empfehlen deshalb feste Regeln für das Spielen am Computer.',
        last: 'Wie bei vielen Dingen kommt es also auf das richtige Maß an.',
      },
    ],
  },
  {
    id: 'ctest-10',
    name: 'C-Test 10',
    texts: [
      {
        title: 'Das Praktikum',
        first: 'Ein Praktikum ist für viele junge Menschen der erste Schritt ins Berufsleben.',
        middle:
          'Während dieser Zeit lernen sie den Alltag in einem Unternehmen kennen. Sie sehen, welche Aufgaben zu einem Beruf gehören und ob die Arbeit ihnen gefällt. Viele Praktikanten merken erst dabei, was sie später wirklich machen wollen. Auch für die Firmen sind die jungen Helfer wertvoll, denn sie bringen frische Ideen mit. Wer im Praktikum einen guten Eindruck macht, bekommt manchmal sogar ein Angebot für eine feste Stelle. Wichtig ist, viele Fragen zu stellen und Interesse zu zeigen.',
        last: 'Ein Praktikum kann also die Tür zu einer erfolgreichen Karriere öffnen.',
      },
      {
        title: 'Gute Nachbarn',
        first: 'Gute Nachbarn können das Leben deutlich angenehmer machen.',
        middle:
          'Sie gießen die Blumen, wenn man im Urlaub ist, oder nehmen Pakete an. Bei Problemen im Haus hilft man sich gegenseitig mit Werkzeug und gutem Rat. In vielen Städten kennen sich die Bewohner eines Hauses jedoch kaum noch. Dabei beginnt eine gute Nachbarschaft schon mit einem freundlichen Gruß im Treppenhaus. Wer neu einzieht, kann sich bei den anderen Mietern kurz vorstellen. Gemeinsame Feste im Hof bringen die Menschen ebenfalls näher zusammen.',
        last: 'Ein gutes Verhältnis zu den Nachbarn ist also viel wert.',
      },
      {
        title: 'Zucker – die süße Gefahr',
        first: 'Zucker steckt heute in sehr vielen Lebensmitteln.',
        middle:
          'Nicht nur Süßigkeiten, sondern auch fertige Soßen und Getränke enthalten große Mengen davon. Wer dauerhaft zu viel Zucker isst, riskiert Übergewicht und Probleme mit den Zähnen. Ärzte warnen außerdem vor weiteren Krankheiten, die durch den hohen Konsum entstehen können. Viele Menschen wissen gar nicht, wie viel Zucker sie täglich zu sich nehmen. Ein Blick auf die Verpackung hilft dabei, versteckte Mengen zu entdecken. Wer langsam reduziert, gewöhnt seinen Geschmack an weniger Süße.',
        last: 'Schon kleine Veränderungen im Alltag können der Gesundheit sehr helfen.',
      },
      {
        title: 'Urlaub zu Hause',
        first: 'Nicht jeder Urlaub muss eine teure Reise in ferne Länder sein.',
        middle:
          'Auch in der eigenen Stadt und ihrer Umgebung gibt es viel zu entdecken. Viele Menschen kennen die Museen und Parks vor ihrer Haustür gar nicht. Ein Ausflug mit dem Fahrrad oder eine Wanderung kosten fast nichts. Wer zu Hause bleibt, spart sich außerdem den Stress am Flughafen und die lange Anreise. Mit ein wenig Fantasie fühlen sich auch gewöhnliche Tage wie Ferien an. Wichtig ist nur, die Arbeit wirklich ruhen zu lassen.',
        last: 'Erholung hängt also nicht von der Entfernung ab, sondern von der Einstellung.',
      },
    ],
  },
  {
    id: 'ctest-11',
    name: 'C-Test 11',
    texts: [
      {
        title: 'Vögel im Winter',
        first: 'Viele Vögel bleiben auch im kalten Winter in Deutschland.',
        middle:
          'In der frostigen Jahreszeit finden die Tiere nur schwer genug Nahrung. Deshalb hängen viele Menschen kleine Häuschen mit Futter in ihre Gärten. Besonders beliebt sind Körner, Nüsse und kleine Stücke von Äpfeln. Beim Füttern kann man die verschiedenen Arten gut beobachten und ihre Namen lernen. Wichtig ist, die Futterstellen regelmäßig zu reinigen, damit sich keine Krankheiten verbreiten. Auch frisches Wasser hilft den Tieren an kalten Tagen.',
        last: 'Wer den Vögeln hilft, wird mit lebendigem Besuch im Garten belohnt.',
      },
      {
        title: 'Gebrauchte Kleidung',
        first: 'Immer mehr Menschen kaufen ihre Kleidung gebraucht.',
        middle:
          'In besonderen Läden und im Internet finden sie Hosen, Jacken und Kleider aus zweiter Hand. Diese Sachen sind viel günstiger als neue Ware aus dem Geschäft. Gleichzeitig schont der Kauf die Umwelt, denn die Herstellung von Kleidung verbraucht viel Wasser und Energie. Manche Stücke sind sogar etwas Besonderes, weil es sie heute nicht mehr zu kaufen gibt. Wer seine alten Sachen verkauft oder verschenkt, schafft außerdem Platz im eigenen Schrank.',
        last: 'Gebrauchte Kleidung ist also gut für den Geldbeutel und für die Natur.',
      },
      {
        title: 'Höflichkeit im Alltag',
        first: 'Kleine höfliche Gesten machen das Zusammenleben viel angenehmer.',
        middle:
          'Ein freundliches Lächeln oder ein einfaches Danke kosten nichts und wirken sofort. Wer anderen die Tür aufhält, zeigt Respekt und Aufmerksamkeit. Auch im Bus sollte man älteren Menschen einen Platz anbieten. In Gesprächen gehört es zur Höflichkeit, andere ausreden zu lassen. Besonders im Internet vergessen viele Menschen leider die guten Manieren. Dabei steht hinter jedem Bildschirm ein Mensch mit echten Gefühlen. Wer höflich bleibt, bekommt meistens auch eine freundliche Antwort.',
        last: 'Höflichkeit ist also eine einfache Sprache, die jeder versteht.',
      },
      {
        title: 'Energie sparen zu Hause',
        first: 'Strom und Heizung kosten heute viel Geld.',
        middle:
          'Mit einfachen Tricks kann jeder Haushalt seine Kosten deutlich senken. Wer das Licht beim Verlassen eines Zimmers ausschaltet, spart schon eine Menge. Auch alte Geräte verbrauchen oft mehr Strom als moderne Modelle. Beim Heizen reicht es meistens, die Temperatur um wenige Grad zu senken. Ein warmer Pullover ist günstiger als eine heiße Wohnung. Wichtig ist außerdem richtiges Lüften, am besten mehrmals täglich mit weit geöffneten Fenstern.',
        last: 'Wer Energie spart, schont also den Geldbeutel und gleichzeitig die Umwelt.',
      },
    ],
  },
  {
    id: 'ctest-12',
    name: 'C-Test 12',
    texts: [
      {
        title: 'Der Führerschein',
        first: 'Für viele junge Menschen ist der Führerschein ein großer Traum.',
        middle:
          'Mit der eigenen Fahrerlaubnis beginnt ein neues Gefühl von Freiheit. Der Weg dorthin ist allerdings lang und kostet viel Geld. Die Schüler müssen zuerst eine Prüfung über die Regeln im Verkehr bestehen. Danach folgen viele Stunden mit dem Fahrlehrer auf der Straße. Besonders das Fahren bei Nacht und auf der Autobahn gehört zur Ausbildung. Wer bei der Prüfung zu nervös ist, fällt manchmal beim ersten Versuch durch.',
        last: 'Mit Geduld und Übung schafft aber fast jeder den Weg zum eigenen Auto.',
      },
      {
        title: 'Ein eigener Garten',
        first: 'Ein eigener Garten ist für viele Menschen ein kleines Paradies.',
        middle:
          'Dort können sie Gemüse anbauen, Blumen pflanzen und an der frischen Luft arbeiten. Die Arbeit mit den Pflanzen senkt nachweislich den Stress. Wer eigene Tomaten erntet, weiß genau, wie sie gewachsen sind. Kinder lernen im Garten, woher das Essen auf dem Teller kommt. In den Städten teilen sich heute viele Menschen gemeinsame Gärten. Dort treffen sich die Nachbarn, tauschen Tipps aus und feiern zusammen die Ernte.',
        last: 'Ein Garten verbindet also die Menschen mit der Natur und miteinander.',
      },
      {
        title: 'Briefe in digitalen Zeiten',
        first: 'Früher schrieben die Menschen lange Briefe mit der Hand.',
        middle:
          'Heute verschicken wir stattdessen kurze Nachrichten über das Internet. Diese moderne Form ist schnell und praktisch, aber auch unpersönlich. Ein echter Brief zeigt dem Empfänger, dass sich jemand Zeit genommen hat. Viele Menschen bewahren schöne Briefe jahrelang in einer Kiste auf. Eine Nachricht auf dem Bildschirm wird dagegen schnell gelöscht und vergessen. Wer einem Freund eine besondere Freude machen will, greift deshalb manchmal wieder zum Stift.',
        last: 'Die alte Kunst des Briefeschreibens ist also noch lange nicht tot.',
      },
      {
        title: 'Schwimmen lernen',
        first: 'Schwimmen gehört zu den wichtigsten Fähigkeiten, die ein Kind lernen kann.',
        middle:
          'Im Wasser trainiert der Körper fast alle Muskeln gleichzeitig. Gleichzeitig schont die Bewegung die Gelenke, weil das Wasser den Körper trägt. Leider können heute immer weniger Kinder sicher schwimmen. Viele Bäder wurden in den letzten Jahren geschlossen, und der Unterricht fällt oft aus. Dabei kann diese Fähigkeit im Notfall Leben retten. Eltern sollten deshalb früh mit ihren Kindern ins Schwimmbad gehen und gemeinsam üben.',
        last: 'Wer sicher schwimmt, kann den Sommer am See ohne Angst genießen.',
      },
    ],
  },
];

// ─── Gap generation (the C-principle) ────────────────────────────────────────
const WORD_RE = /^([^A-Za-zÄÖÜäöüß0-9]*)([A-Za-zÄÖÜäöüß0-9]+)([^A-Za-zÄÖÜäöüß0-9]*)$/;

// ─── Grammatical classification, used for the error analysis ─────────────────
const LISTS = {
  artikel: new Set(['der','die','das','den','dem','des','ein','eine','einen','einem','einer','eines','kein','keine','keinen','keinem','keiner','mein','meine','meinen','dein','deine','sein','seine','seinen','seinem','seiner','ihr','ihre','ihren','ihrem','ihrer','unser','unsere','unseren','unserem','unserer','euer','eure','dieser','diese','dieses','diesen','diesem','jeder','jede','jedes','jeden','jedem','mancher','manche','manchen','welche','welcher','alle','allen','aller','beide','beiden','beider','viele','vielen','vieler','wenige','wenigen','einige','einigen','einiger','ich','du','er','sie','es','wir','ihnen','ihm','ihn','uns','euch','sich','man','wer','was','etwas','nichts','jemand','niemand']),
  praep: new Set(['in','im','ins','an','am','ans','auf','aus','bei','beim','mit','nach','von','vom','zu','zum','zur','für','ohne','um','durch','gegen','über','unter','vor','hinter','neben','zwischen','seit','ab','trotz','während','wegen','pro','gegenüber']),
  konnekt: new Set(['und','oder','aber','denn','weil','dass','wenn','ob','als','damit','obwohl','sondern','doch','deshalb','deswegen','außerdem','trotzdem','jedoch','dagegen','also','dann','danach','daneben','dabei','dafür','davon','dazu','zudem','wie','sowie']),
  adverb: new Set(['auch','noch','nur','schon','sehr','etwa','sogar','gern','gerne','oft','immer','nie','heute','morgen','später','früher','hier','dort','jetzt','bald','fast','kaum','mehr','weniger','besonders','vielleicht','wieder','zusammen','allein','gleichzeitig','regelmäßig','täglich','ständig','meistens','mindestens','ungefähr','nebenbei','zwischendurch','kurzfristig','dauerhaft','vergleichsweise','ursprünglich','gleich','erst','umso']),
  verbForms: new Set(['ist','sind','war','waren','wird','werden','wurde','wurden','kann','können','könnte','konnten','muss','müssen','musste','soll','sollen','sollte','sollten','will','wollen','wollte','darf','dürfen','mag','möchte','hat','haben','hatte','hatten','gibt','gab','gäbe','tut','tun','lässt','braucht','brauchen','geht','gehen','kommt','kam','kamen','isst','essen','liest','lesen','fährt','fahren','steht','stehen']),
};

export function classify(word, prevEndsSentence) {
  const lw = word.toLowerCase();
  if (LISTS.artikel.has(lw))   return 'Artikel & Pronomen';
  if (LISTS.praep.has(lw))     return 'Präpositionen';
  if (LISTS.konnekt.has(lw))   return 'Konnektoren';
  if (LISTS.adverb.has(lw))    return 'Adverbien';
  if (LISTS.verbForms.has(lw)) return 'Verben';
  // Capitalized inside a sentence = noun (German spelling rule)
  if (/^[A-ZÄÖÜ]/.test(word) && !prevEndsSentence) return 'Nomen';
  if (/(ig|lich|isch|bar|sam|los|voll|haft|reich|iv|ell)(e|en|er|es|em)?$/.test(lw)) return 'Adjektive';
  if (/(en|st|te|ten|iert|ieren|t)$/.test(lw)) return 'Verben';
  if (/^[A-ZÄÖÜ]/.test(word)) return 'Nomen';
  return 'Adjektive';
}

// Mongolian study advice per grammatical category
export const CAT_TIPS = {
  'Artikel & Pronomen':
    'Артикль хувиралт давт: der-/ein- үгс 4 тийн ялгалаар. Лүк бүрт асуу — ард нь ямар хүйсийн нэр үг байна, аль тийн ялгал вэ (үйл үг эсвэл угтвар үг шийднэ).',
  'Präpositionen':
    'Хос угтвар үг (Wechselpräpositionen) дасгалж, Wo? → Dativ, Wohin? → Akkusativ гэдгийг санаарай. Мөн тогтмол хослолуудыг цээжил: warten auf, teilnehmen an, sich freuen über, sorgen für …',
  'Konnektoren':
    'Өгүүлбэр холбогчид: weil/dass/wenn/obwohl → үйл үг төгсгөлд; deshalb/trotzdem/außerdem → үйл үг шууд араас нь (инверси).',
  'Verben':
    'Хувиралтын төгсгөл (-e, -st, -t, -en), Partizip II, салдаг угтвартай үйл үгсээ давт. Эхлээд субьектээ ол — тэр л төгсгөлийг шийднэ.',
  'Nomen':
    'Үгийн санг зорилготой нэмэгдүүлж, олон тоог үргэлж хамт цээжил (die Frau, -en). Нийлмэл үгэнд сүүлийн үг нь хүйс, хэлбэрийг тодорхойлно.',
  'Adjektive':
    'Тэмдэг нэрийн хувиралт: төгсгөл нь өмнөх артиклиас хамаарна (der gute Wein / ein guter Wein / guter Wein).',
  'Adverbien':
    'Түгээмэл дайвар үгсийг бүтэн үгээр нь цээжил: außerdem, trotzdem, regelmäßig, besonders, gleichzeitig …',
};

// Splits a text's middle part into plain tokens and gap tokens.
// Returns { parts, gapCount } where a gap part is
// { type:'gap', pre, stem, missing, post, gapIndex, cat }.
export function buildGappedText(text) {
  const tokens = text.middle.split(/\s+/).filter(Boolean);
  const parts = [];
  let eligibleCount = 0;
  let gaps = 0;
  let prevEnds = true; // the middle part starts a new sentence

  for (const tok of tokens) {
    const m = tok.match(WORD_RE);
    const core = m ? m[2] : null;
    const eligible = core && core.length >= 2 && !/[0-9]/.test(core) && gaps < GAPS_PER_TEXT;

    if (!eligible) {
      parts.push({ type: 'plain', text: tok });
      prevEnds = /[.!?]$/.test(tok);
      continue;
    }

    eligibleCount += 1;
    // every 2nd eligible word is damaged (2nd, 4th, 6th, …)
    if (eligibleCount % 2 === 0) {
      const keep = Math.floor(core.length / 2); // odd length → the larger half is deleted
      parts.push({
        type: 'gap',
        pre: m[1],
        stem: core.slice(0, keep),
        missing: core.slice(keep),
        post: m[3],
        gapIndex: gaps,
        cat: classify(core, prevEnds),
      });
      gaps += 1;
    } else {
      parts.push({ type: 'plain', text: tok });
    }
    prevEnds = /[.!?]$/.test(tok);
  }
  return { parts, gapCount: gaps };
}

export function buildTest(test) {
  return test.texts.map(txt => ({ ...txt, ...buildGappedText(txt) }));
}

export const fmtClock = s => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const normAnswer = s => (s || '').trim().toLowerCase();
