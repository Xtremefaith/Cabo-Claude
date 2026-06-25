// Candidate pool for live Heaven or Hell, rated on the shared 1–5 spice scale.
// The deck builder filters by the group's spice (`spice <= maxSpice`), so the
// higher a group's spice, the more controversial the faces that can surface.
//
// Two layers:
//  - The mainstream `CELEBRITIES` roster (reused from Hot or Not — guarantees
//    working Wikipedia headshots) seeds **spice 1**: squeaky-clean entertainers
//    and athletes, no controversy.
//  - `CONTROVERSIAL` adds **spice 3–5**: provocative celebs → divisive moguls and
//    media → polarizing politicians, televangelists, and internet provocateurs.
//
// Editorial lines (deliberate): candidates are **public figures** only, and we
// exclude anyone whose notability is primarily violent or sexual crime against
// real victims, or heads of state tied to mass atrocities — "should X go to
// Hell" isn't a debatable party question for those, and gamifying it trivializes
// real victims. Everything else (politics, religion, scandal, provocation) is in.
// This is a starting set — it's just data; add/retune names freely.
//
// NOTE: headshots resolve at runtime from `wikiTitle` via lib/wikiImages (with a
// graceful initials fallback), so a stale/ambiguous title degrades, never breaks.

import { CELEBRITIES } from './celebrities';

export interface HoHCandidate {
  id: string;
  name: string;
  /** Wikipedia page title for the runtime headshot (redirects are followed). */
  wikiTitle: string;
  /** Short, playful "known for" line shown on the card. */
  blurb: string;
  /** 1 (squeaky clean) … 5 (unhinged). Gates when the candidate can appear. */
  spice: number;
}

// spice 3 — a little spicy: love-'em-or-hate-'em, scandal-lite provocateurs.
const SPICE_3: HoHCandidate[] = [
  { id: 'kim-kardashian', name: 'Kim Kardashian', wikiTitle: 'Kim Kardashian', blurb: 'Reality-TV mogul', spice: 3 },
  { id: 'justin-bieber', name: 'Justin Bieber', wikiTitle: 'Justin Bieber', blurb: 'Pop star, past antics', spice: 3 },
  { id: 'gordon-ramsay', name: 'Gordon Ramsay', wikiTitle: 'Gordon Ramsay', blurb: 'Foul-mouthed chef', spice: 3 },
  { id: 'howard-stern', name: 'Howard Stern', wikiTitle: 'Howard Stern', blurb: 'The original shock-jock', spice: 3 },
  { id: 'miley-cyrus-hoh', name: 'Miley Cyrus', wikiTitle: 'Miley Cyrus', blurb: 'Wrecking-ball provocateur', spice: 3 },
  { id: 'cardi-b', name: 'Cardi B', wikiTitle: 'Cardi B', blurb: 'Unfiltered rap star', spice: 3 },
  { id: 'nicki-minaj', name: 'Nicki Minaj', wikiTitle: 'Nicki Minaj', blurb: 'Feud-prone rap queen', spice: 3 },
  { id: 'charlie-sheen', name: 'Charlie Sheen', wikiTitle: 'Charlie Sheen', blurb: '"Winning" meltdown icon', spice: 3 },
  { id: 'dennis-rodman', name: 'Dennis Rodman', wikiTitle: 'Dennis Rodman', blurb: 'NBA bad boy abroad', spice: 3 },
  { id: 'gwyneth-paltrow', name: 'Gwyneth Paltrow', wikiTitle: 'Gwyneth Paltrow', blurb: 'Goop wellness guru', spice: 3 },
  { id: 'kathy-griffin', name: 'Kathy Griffin', wikiTitle: 'Kathy Griffin', blurb: 'Provocative comedian', spice: 3 },
  { id: 'pamela-anderson', name: 'Pamela Anderson', wikiTitle: 'Pamela Anderson', blurb: 'Tabloid-era icon', spice: 3 },
];

// spice 4 — bring the heat: genuinely divisive moguls, media, and scandal figures.
const SPICE_4: HoHCandidate[] = [
  { id: 'kanye-west', name: 'Kanye West', wikiTitle: 'Kanye West', blurb: 'Ye — nonstop controversy', spice: 4 },
  { id: 'elon-musk', name: 'Elon Musk', wikiTitle: 'Elon Musk', blurb: 'Polarizing tech mogul', spice: 4 },
  { id: 'mark-zuckerberg', name: 'Mark Zuckerberg', wikiTitle: 'Mark Zuckerberg', blurb: 'Social-media overlord', spice: 4 },
  { id: 'logan-paul', name: 'Logan Paul', wikiTitle: 'Logan Paul', blurb: 'YouTube provocateur', spice: 4 },
  { id: 'jake-paul', name: 'Jake Paul', wikiTitle: 'Jake Paul', blurb: 'YouTuber-turned-boxer', spice: 4 },
  { id: 'mel-gibson', name: 'Mel Gibson', wikiTitle: 'Mel Gibson', blurb: 'Infamous off-screen rants', spice: 4 },
  { id: 'roseanne-barr', name: 'Roseanne Barr', wikiTitle: 'Roseanne Barr', blurb: 'Career-ending tweets', spice: 4 },
  { id: 'martin-shkreli', name: 'Martin Shkreli', wikiTitle: 'Martin Shkreli', blurb: 'The "Pharma Bro"', spice: 4 },
  { id: 'vince-mcmahon', name: 'Vince McMahon', wikiTitle: 'Vince McMahon', blurb: 'Scandal-hit WWE boss', spice: 4 },
  { id: 'ted-nugent', name: 'Ted Nugent', wikiTitle: 'Ted Nugent', blurb: 'Firebrand rocker', spice: 4 },
  { id: 'kid-rock', name: 'Kid Rock', wikiTitle: 'Kid Rock', blurb: 'Polarizing provocateur', spice: 4 },
  { id: 'bill-maher', name: 'Bill Maher', wikiTitle: 'Bill Maher', blurb: 'Provocative pundit', spice: 4 },
];

// spice 5 — unhinged: the most polarizing public figures (politics, pulpit, web).
const SPICE_5: HoHCandidate[] = [
  { id: 'donald-trump', name: 'Donald Trump', wikiTitle: 'Donald Trump', blurb: 'The ultimate lightning rod', spice: 5 },
  { id: 'andrew-tate', name: 'Andrew Tate', wikiTitle: 'Andrew Tate', blurb: 'Manosphere provocateur', spice: 5 },
  { id: 'joel-osteen', name: 'Joel Osteen', wikiTitle: 'Joel Osteen', blurb: 'Prosperity-gospel smiler', spice: 5 },
  { id: 'kenneth-copeland', name: 'Kenneth Copeland', wikiTitle: 'Kenneth Copeland', blurb: 'Televangelist jet fleet', spice: 5 },
  { id: 'jerry-falwell-jr', name: 'Jerry Falwell Jr.', wikiTitle: 'Jerry Falwell Jr.', blurb: 'Scandal-hit preacher', spice: 5 },
  { id: 'jim-bakker', name: 'Jim Bakker', wikiTitle: 'Jim Bakker', blurb: 'Disgraced televangelist', spice: 5 },
  { id: 'piers-morgan', name: 'Piers Morgan', wikiTitle: 'Piers Morgan', blurb: 'Professional contrarian', spice: 5 },
];

const CONTROVERSIAL: HoHCandidate[] = [...SPICE_3, ...SPICE_4, ...SPICE_5];

/** Full candidate pool: mainstream roster at spice 1 + the controversial tiers. */
export const HEAVEN_OR_HELL_CANDIDATES: HoHCandidate[] = [
  ...CELEBRITIES.map((c) => ({
    id: c.id,
    name: c.name,
    wikiTitle: c.wikiTitle,
    blurb: c.blurb,
    spice: 1,
  })),
  ...CONTROVERSIAL,
];
