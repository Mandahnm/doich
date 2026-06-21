import { VOCAB } from './vocab';

// Pattern shape: { pre, article, post, ending, label }
// "article" is the full article form — the component shows article[0] as hint,
// and the learner types article.slice(1).
// NULL_PATTERNS have article: '' — no article blank shown.

const CAT_PATTERNS = {
  person: [
    { pre: 'Das ist',      article: 'ein',   post: 'Mann.',                   ending: 'er', label: 'ein · Mask. · Nom'   },
    { pre: 'Das ist',      article: 'eine',  post: 'Frau.',                   ending: 'e',  label: 'eine · Fem. · Nom'   },
    { pre: 'Das ist',      article: 'ein',   post: 'Kind.',                   ending: 'es', label: 'ein · Neut. · Nom'   },
    { pre: '',             article: 'Der',   post: 'Lehrer erklärt.',         ending: 'e',  label: 'der · Mask. · Nom'   },
    { pre: '',             article: 'Die',   post: 'Schülerin antwortet.',    ending: 'e',  label: 'die · Fem. · Nom'    },
    { pre: '',             article: 'Das',   post: 'Kind lacht.',             ending: 'e',  label: 'das · Neut. · Nom'   },
    { pre: 'Ich kenne',    article: 'einen', post: 'Arzt.',                   ending: 'en', label: 'einen · Mask. · Akk' },
    { pre: 'Ich kenne',    article: 'eine',  post: 'Ärztin.',                ending: 'e',  label: 'eine · Fem. · Akk'   },
    { pre: 'Ich sehe',     article: 'ein',   post: 'Kind.',                   ending: 'es', label: 'ein · Neut. · Akk'   },
    { pre: 'Ich kenne',    article: 'den',   post: 'Mann.',                   ending: 'en', label: 'den · Mask. · Akk'   },
    { pre: 'Ich besuche',  article: 'die',   post: 'Freundin.',               ending: 'e',  label: 'die · Fem. · Akk'    },
    { pre: 'Ich sehe',     article: 'das',   post: 'Kind.',                   ending: 'e',  label: 'das · Neut. · Akk'   },
    { pre: 'Ich helfe',    article: 'dem',   post: 'Mann.',                   ending: 'en', label: 'dem · Mask. · Dat'   },
    { pre: 'Ich helfe',    article: 'der',   post: 'Frau.',                   ending: 'en', label: 'der · Fem. · Dat'    },
    { pre: 'Ich helfe',    article: 'dem',   post: 'Kind.',                   ending: 'en', label: 'dem · Neut. · Dat'   },
  ],
  weather: [
    { pre: 'Das ist',      article: 'ein',   post: 'Tag.',                    ending: 'er', label: 'ein · Mask. · Nom'   },
    { pre: 'Das ist',      article: 'eine',  post: 'Nacht.',                  ending: 'e',  label: 'eine · Fem. · Nom'   },
    { pre: 'Das ist',      article: 'ein',   post: 'Wetter.',                 ending: 'es', label: 'ein · Neut. · Nom'   },
    { pre: '',             article: 'Der',   post: 'Tag beginnt.',            ending: 'e',  label: 'der · Mask. · Nom'   },
    { pre: '',             article: 'Die',   post: 'Luft ist frisch.',        ending: 'e',  label: 'die · Fem. · Nom'    },
    { pre: '',             article: 'Das',   post: 'Wetter bleibt so.',       ending: 'e',  label: 'das · Neut. · Nom'   },
    { pre: 'Ich erlebe',   article: 'einen', post: 'Tag.',                    ending: 'en', label: 'einen · Mask. · Akk' },
    { pre: 'Ich spüre',    article: 'eine',  post: 'Brise.',                  ending: 'e',  label: 'eine · Fem. · Akk'   },
    { pre: 'Ich erlebe',   article: 'ein',   post: 'Klima.',                  ending: 'es', label: 'ein · Neut. · Akk'   },
    { pre: 'Ich genieße',  article: 'den',   post: 'Tag.',                    ending: 'en', label: 'den · Mask. · Akk'   },
    { pre: 'Ich mag',      article: 'die',   post: 'Luft hier.',              ending: 'e',  label: 'die · Fem. · Akk'    },
    { pre: 'Ich mag',      article: 'das',   post: 'Wetter.',                 ending: 'e',  label: 'das · Neut. · Akk'   },
    { pre: 'Bei',          article: 'dem',   post: 'Tag gehe ich raus.',      ending: 'en', label: 'dem · Mask. · Dat'   },
    { pre: 'In',           article: 'der',   post: 'Jahreszeit reise ich.',   ending: 'en', label: 'der · Fem. · Dat'    },
    { pre: 'Bei',          article: 'dem',   post: 'Wetter bleibe ich drin.', ending: 'en', label: 'dem · Neut. · Dat'   },
  ],
  food: [
    { pre: 'Das ist',      article: 'ein',   post: 'Kaffee.',                 ending: 'er', label: 'ein · Mask. · Nom'   },
    { pre: 'Das ist',      article: 'eine',  post: 'Suppe.',                  ending: 'e',  label: 'eine · Fem. · Nom'   },
    { pre: 'Das ist',      article: 'ein',   post: 'Brot.',                   ending: 'es', label: 'ein · Neut. · Nom'   },
    { pre: '',             article: 'Der',   post: 'Kuchen schmeckt gut.',    ending: 'e',  label: 'der · Mask. · Nom'   },
    { pre: '',             article: 'Die',   post: 'Suppe ist fertig.',       ending: 'e',  label: 'die · Fem. · Nom'    },
    { pre: '',             article: 'Das',   post: 'Essen kommt.',            ending: 'e',  label: 'das · Neut. · Nom'   },
    { pre: 'Ich bestelle', article: 'einen', post: 'Tee.',                    ending: 'en', label: 'einen · Mask. · Akk' },
    { pre: 'Ich esse',     article: 'eine',  post: 'Suppe.',                  ending: 'e',  label: 'eine · Fem. · Akk'   },
    { pre: 'Ich esse',     article: 'ein',   post: 'Brot.',                   ending: 'es', label: 'ein · Neut. · Akk'   },
    { pre: 'Ich trinke',   article: 'den',   post: 'Kaffee.',                 ending: 'en', label: 'den · Mask. · Akk'   },
    { pre: 'Ich mag',      article: 'die',   post: 'Suppe.',                  ending: 'e',  label: 'die · Fem. · Akk'    },
    { pre: 'Ich esse',     article: 'das',   post: 'Brot.',                   ending: 'e',  label: 'das · Neut. · Akk'   },
    { pre: 'Mit',          article: 'dem',   post: 'Kaffee fange ich an.',    ending: 'en', label: 'dem · Mask. · Dat'   },
    { pre: 'Mit',          article: 'der',   post: 'Soße passt es gut.',      ending: 'en', label: 'der · Fem. · Dat'    },
    { pre: 'Mit',          article: 'dem',   post: 'Brot schmeckt es besser.',ending: 'en', label: 'dem · Neut. · Dat'   },
  ],
  thing: [
    { pre: 'Das ist',   article: 'ein',   post: 'Raum.',                   ending: 'er', label: 'ein · Mask. · Nom'   },
    { pre: 'Das ist',   article: 'eine',  post: 'Wohnung.',                ending: 'e',  label: 'eine · Fem. · Nom'   },
    { pre: 'Das ist',   article: 'ein',   post: 'Auto.',                   ending: 'es', label: 'ein · Neut. · Nom'   },
    { pre: '',          article: 'Der',   post: 'Tisch steht hier.',       ending: 'e',  label: 'der · Mask. · Nom'   },
    { pre: '',          article: 'Die',   post: 'Wohnung gefällt mir.',    ending: 'e',  label: 'die · Fem. · Nom'    },
    { pre: '',          article: 'Das',   post: 'Auto gehört mir.',        ending: 'e',  label: 'das · Neut. · Nom'   },
    { pre: 'Ich kaufe', article: 'einen', post: 'Stuhl.',                  ending: 'en', label: 'einen · Mask. · Akk' },
    { pre: 'Ich miete', article: 'eine',  post: 'Wohnung.',                ending: 'e',  label: 'eine · Fem. · Akk'   },
    { pre: 'Ich kaufe', article: 'ein',   post: 'Auto.',                   ending: 'es', label: 'ein · Neut. · Akk'   },
    { pre: 'Ich kaufe', article: 'den',   post: 'Stuhl.',                  ending: 'en', label: 'den · Mask. · Akk'   },
    { pre: 'Ich miete', article: 'die',   post: 'Wohnung.',                ending: 'e',  label: 'die · Fem. · Akk'    },
    { pre: 'Ich kaufe', article: 'das',   post: 'Auto.',                   ending: 'e',  label: 'das · Neut. · Akk'   },
    { pre: 'In',        article: 'dem',   post: 'Raum ist es ruhig.',      ending: 'en', label: 'dem · Mask. · Dat'   },
    { pre: 'In',        article: 'der',   post: 'Küche riecht es gut.',    ending: 'en', label: 'der · Fem. · Dat'    },
    { pre: 'Mit',       article: 'dem',   post: 'Auto fahre ich gern.',    ending: 'en', label: 'dem · Neut. · Dat'   },
  ],
  abstract: [
    { pre: 'Das ist',      article: 'ein',   post: 'Unterschied.',            ending: 'er', label: 'ein · Mask. · Nom'   },
    { pre: 'Das ist',      article: 'eine',  post: 'Frage.',                  ending: 'e',  label: 'eine · Fem. · Nom'   },
    { pre: 'Das ist',      article: 'ein',   post: 'Thema.',                  ending: 'es', label: 'ein · Neut. · Nom'   },
    { pre: '',             article: 'Der',   post: 'Plan klappt.',            ending: 'e',  label: 'der · Mask. · Nom'   },
    { pre: '',             article: 'Die',   post: 'Frage bleibt.',           ending: 'e',  label: 'die · Fem. · Nom'    },
    { pre: '',             article: 'Das',   post: 'Thema bleibt.',           ending: 'e',  label: 'das · Neut. · Nom'   },
    { pre: 'Ich sehe',     article: 'einen', post: 'Vorteil.',                ending: 'en', label: 'einen · Mask. · Akk' },
    { pre: 'Ich habe',     article: 'eine',  post: 'Idee.',                   ending: 'e',  label: 'eine · Fem. · Akk'   },
    { pre: 'Ich löse',     article: 'ein',   post: 'Problem.',                ending: 'es', label: 'ein · Neut. · Akk'   },
    { pre: 'Ich erkenne',  article: 'den',   post: 'Unterschied.',            ending: 'en', label: 'den · Mask. · Akk'   },
    { pre: 'Ich verstehe', article: 'die',   post: 'Frage.',                  ending: 'e',  label: 'die · Fem. · Akk'    },
    { pre: 'Ich löse',     article: 'das',   post: 'Problem.',                ending: 'e',  label: 'das · Neut. · Akk'   },
    { pre: 'Mit',          article: 'dem',   post: 'Ansatz klappt es.',       ending: 'en', label: 'dem · Mask. · Dat'   },
    { pre: 'Bei',          article: 'der',   post: 'Lösung helfe ich.',       ending: 'en', label: 'der · Fem. · Dat'    },
    { pre: 'Bei',          article: 'dem',   post: 'Ergebnis bin ich zufrieden.', ending: 'en', label: 'dem · Neut. · Dat' },
  ],
};

// Nullartikel patterns (stage 40+): article: '' — no article blank.
// User types the full inflected adjective form (strong declension).
// New dative endings: -em (masc/neut), -er (fem).

const NULL_PATTERNS = {
  person: [
    { pre: 'Er ist',       article: '', post: 'Lehrer.',                   ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Sie ist',      article: '', post: 'Ärztin.',                   ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Als',          article: '', post: 'Kind lernt man viel.',      ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Als',          article: '', post: 'Lehrer weiß er das.',       ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Als',          article: '', post: 'Mutter hilft sie gern.',    ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Als',          article: '', post: 'Baby schläft man viel.',    ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Ich sehe',     article: '', post: 'Blick in seinen Augen.',    ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Ich höre',     article: '', post: 'Stimme draußen.',           ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Sie zeigt',    article: '', post: 'Verhalten.',                ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Er hat',       article: '', post: 'Charakter.',                ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Sie hat',      article: '', post: 'Persönlichkeit.',           ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Das zeigt',    article: '', post: 'Verhalten.',                ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Blick schaut er vorbei.',   ending: 'em', label: 'Mask. · Dat · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Stimme spricht sie.',       ending: 'er', label: 'Fem. · Dat · Nullart.'  },
    { pre: 'Mit',          article: '', post: 'Verhalten überzeugt er.',   ending: 'em', label: 'Neut. · Dat · Nullart.' },
  ],
  weather: [
    { pre: 'Das ist',      article: '', post: 'Wind.',                     ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das ist',      article: '', post: 'Luft.',                     ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das ist',      article: '', post: 'Wetter.',                   ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Heute war',    article: '', post: 'Tag.',                      ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Nacht.',                    ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Draußen ist',  article: '', post: 'Klima.',                    ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Ich erlebe',   article: '', post: 'Sommer.',                   ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Ich spüre',    article: '', post: 'Brise.',                    ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Ich mag',      article: '', post: 'Wetter.',                   ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Er genießt',   article: '', post: 'Wind.',                     ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Sie liebt',    article: '', post: 'Luft.',                     ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Wir erleben',  article: '', post: 'Klima.',                    ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Wind kommt die Kälte.',     ending: 'em', label: 'Mask. · Dat · Nullart.' },
    { pre: 'Bei',          article: '', post: 'Luft fühle ich mich gut.',  ending: 'er', label: 'Fem. · Dat · Nullart.'  },
    { pre: 'Bei',          article: '', post: 'Wetter bleibe ich drin.',   ending: 'em', label: 'Neut. · Dat · Nullart.' },
  ],
  food: [
    { pre: 'Das ist',      article: '', post: 'Kaffee.',                   ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das ist',      article: '', post: 'Suppe.',                    ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das ist',      article: '', post: 'Brot.',                     ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Tee.',                      ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Soße.',                     ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das war',      article: '', post: 'Essen.',                    ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Ich trinke',   article: '', post: 'Kaffee.',                   ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Ich esse',     article: '', post: 'Suppe.',                    ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Ich esse',     article: '', post: 'Brot.',                     ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Er trinkt',    article: '', post: 'Tee.',                      ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Sie mag',      article: '', post: 'Soße.',                     ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Wir essen',    article: '', post: 'Essen.',                    ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Kaffee beginne ich den Tag.',ending: 'em', label: 'Mask. · Dat · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Soße schmeckt es besser.',  ending: 'er', label: 'Fem. · Dat · Nullart.'  },
    { pre: 'Mit',          article: '', post: 'Brot geht es besser.',      ending: 'em', label: 'Neut. · Dat · Nullart.' },
  ],
  thing: [
    { pre: 'Das ist',      article: '', post: 'Stil.',                     ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das ist',      article: '', post: 'Qualität.',                 ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das ist',      article: '', post: 'Design.',                   ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Service.',                  ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Musik.',                    ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das war',      article: '', post: 'Spiel.',                    ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Ich kaufe',    article: '', post: 'Stuhl.',                    ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Ich kaufe',    article: '', post: 'Jacke.',                    ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Er hat',       article: '', post: 'Auto.',                     ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Er braucht',   article: '', post: 'Tisch.',                    ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Sie nimmt',    article: '', post: 'Tasche.',                   ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Wir kaufen',   article: '', post: 'Auto.',                     ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Zug fährt es sich gut.',    ending: 'em', label: 'Mask. · Dat · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Tasche geht es besser.',    ending: 'er', label: 'Fem. · Dat · Nullart.'  },
    { pre: 'Mit',          article: '', post: 'Auto ist es einfacher.',    ending: 'em', label: 'Neut. · Dat · Nullart.' },
  ],
  abstract: [
    { pre: 'Das ist',      article: '', post: 'Unterschied.',              ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das ist',      article: '', post: 'Qualität.',                 ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das ist',      article: '', post: 'Wissen.',                   ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Fortschritt.',              ending: 'er', label: 'Mask. · Nom · Nullart.' },
    { pre: 'Das war',      article: '', post: 'Erfahrung.',                ending: 'e',  label: 'Fem. · Nom · Nullart.'  },
    { pre: 'Das war',      article: '', post: 'Ergebnis.',                 ending: 'es', label: 'Neut. · Nom · Nullart.' },
    { pre: 'Ich sehe',     article: '', post: 'Vorteil darin.',            ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Ich habe',     article: '', post: 'Idee.',                     ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Ich löse',     article: '', post: 'Problem.',                  ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Er findet',    article: '', post: 'Fehler.',                   ending: 'en', label: 'Mask. · Akk · Nullart.' },
    { pre: 'Sie hat',      article: '', post: 'Meinung dazu.',             ending: 'e',  label: 'Fem. · Akk · Nullart.'  },
    { pre: 'Wir brauchen', article: '', post: 'Wissen.',                   ending: 'es', label: 'Neut. · Akk · Nullart.' },
    { pre: 'Mit',          article: '', post: 'Erfolg bin ich zufrieden.', ending: 'em', label: 'Mask. · Dat · Nullart.' },
    { pre: 'Dank',         article: '', post: 'Hilfe klappt es.',          ending: 'er', label: 'Fem. · Dat · Nullart.'  },
    { pre: 'Mit',          article: '', post: 'Wissen kann man viel.',     ending: 'em', label: 'Neut. · Dat · Nullart.' },
  ],
};

// ─── Semantic category lookup ─────────────────────────────────────────────────

const WORD_CAT = {
  jung: 'person', alt: 'person', glücklich: 'person', müde: 'person',
  krank: 'person', traurig: 'person', hungrig: 'person', nervös: 'person',
  neugierig: 'person', nett: 'person', freundlich: 'person', böse: 'person',
  fleißig: 'person', faul: 'person', aktiv: 'person', sportlich: 'person',
  intelligent: 'person', dumm: 'person', zufrieden: 'person', froh: 'person',
  blond: 'person', erfolgreich: 'person', zuverlässig: 'person',
  kreativ: 'person', selbständig: 'person', verantwortlich: 'person',
  dominant: 'person', ambivalent: 'person', optimistisch: 'person',
  pessimistisch: 'person', skeptisch: 'person', zynisch: 'person',
  gesund: 'person', schwach: 'person',

  warm: 'weather', kalt: 'weather', kühl: 'weather', nass: 'weather',
  trocken: 'weather', neblig: 'weather', sonnig: 'weather',
  hell: 'weather', dunkel: 'weather',

  heiß: 'food', lecker: 'food', frisch: 'food',

  schnell: 'abstract', langsam: 'abstract',
  schwer: 'abstract', leicht: 'abstract',
  lang: 'abstract', kurz: 'abstract',
  früh: 'abstract', spät: 'abstract',
  sicher: 'abstract', gefährlich: 'abstract',
  laut: 'person', leise: 'person',
  wichtig: 'abstract', notwendig: 'abstract', hilfreich: 'abstract',
  möglich: 'abstract', unmöglich: 'abstract', schwierig: 'abstract',
  einfach: 'abstract', richtig: 'abstract', falsch: 'abstract',
  pünktlich: 'abstract', dringend: 'abstract', typisch: 'abstract',
  sozial: 'abstract', politisch: 'abstract', wirtschaftlich: 'abstract',
  öffentlich: 'abstract', privat: 'abstract', international: 'abstract',
  praktisch: 'abstract', allgemein: 'abstract', ähnlich: 'abstract',
  verschieden: 'abstract', gemeinsam: 'abstract', persönlich: 'abstract',
};

function getCategory(word) {
  if (WORD_CAT[word.de]) return WORD_CAT[word.de];
  if (word.level === 'B2' || word.level === 'C1' || word.level === 'C2') return 'abstract';
  return 'thing';
}

const SKIP = new Set(['hoch', 'nah', 'viel', 'wenig']);

// ─── Exercise builder ─────────────────────────────────────────────────────────

function buildExercise(word, patternTable, isNull = false) {
  const cat       = getCategory(word);
  const pattern   = patternTable[cat][word.id % 15];
  const stem      = word.de.endsWith('e') ? word.de.slice(0, -1) : word.de;
  const inflected = stem + pattern.ending;

  const article    = pattern.article || '';
  const artHint    = article ? article[0] : '';  // e.g. 'e' or 'd'
  const artRest    = article ? article.slice(1) : '';  // e.g. 'in', 'ie', 'em'

  // Build the full sentence: pre + article + inflectedAdj + post
  const example = [pattern.pre, article, inflected, pattern.post].filter(Boolean).join(' ');

  return {
    ...word,
    pre:           pattern.pre,
    post:          pattern.post,
    example,
    conjugatedForm: inflected,
    articleFull:   article,
    articleHint:   artHint,
    articleRest:   artRest,
    // For Nullartikel: hide the stem so learner types the complete inflected form.
    stem:          isNull ? '' : stem,
    ending:        isNull ? inflected : pattern.ending,
    grammarLabel:  pattern.label,
  };
}

export function buildAdjectiveExercises(level = null) {
  const words = VOCAB.filter(w =>
    w.type === 'adj' && !SKIP.has(w.de) && !w.de.endsWith('el') && !w.de.endsWith('er')
  ).filter(w => !level || w.level === level);
  return words.map(w => buildExercise(w, CAT_PATTERNS)).sort(() => Math.random() - 0.5);
}

export function getAdjectiveStages() {
  const all = VOCAB.filter(w =>
    w.type === 'adj' && !SKIP.has(w.de) && !w.de.endsWith('el') && !w.de.endsWith('er')
  );

  const stages = [];
  for (let i = 0; i < all.length; i += 5) {
    const chunk = all.slice(i, i + 5);
    if (chunk.length < 2) break;
    const stageNum      = stages.length + 1;
    const isNullartikel = stageNum >= 40;
    const table         = isNullartikel ? NULL_PATTERNS : CAT_PATTERNS;
    stages.push({
      id:             `adjective-${stageNum}`,
      stageNum,
      isNullartikel,
      words:          chunk.map(w => ({ ...buildExercise(w, table, isNullartikel), isNullartikel })),
    });
  }
  return stages;
}
