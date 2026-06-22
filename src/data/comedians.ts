// Curated roster of well-known comedians for the "Comedian" category.
//
// Headshots are NOT bundled. At runtime the app resolves each comedian's photo
// from Wikipedia's image API using `wikiTitle` (see lib/wikiImages.ts). That
// keeps the repo light, avoids shipping copyrighted images, and self-corrects
// if a photo on Wikipedia changes. `wikiTitle` must match the real Wikipedia
// page title exactly (including any "(comedian)" disambiguation).

import type { Candidate } from '../types';

export const COMEDIANS: Candidate[] = [
  // --- men ---
  { id: 'kevin-hart', name: 'Kevin Hart', gender: 'male', wikiTitle: 'Kevin Hart', blurb: 'Stand-up dynamo' },
  { id: 'dave-chappelle', name: 'Dave Chappelle', gender: 'male', wikiTitle: 'Dave Chappelle', blurb: "Chappelle's Show legend" },
  { id: 'jerry-seinfeld', name: 'Jerry Seinfeld', gender: 'male', wikiTitle: 'Jerry Seinfeld', blurb: 'Observational king' },
  { id: 'chris-rock', name: 'Chris Rock', gender: 'male', wikiTitle: 'Chris Rock', blurb: 'Sharp, fearless stand-up' },
  { id: 'bill-burr', name: 'Bill Burr', gender: 'male', wikiTitle: 'Bill Burr', blurb: 'Ranting Boston firebrand' },
  { id: 'john-mulaney', name: 'John Mulaney', gender: 'male', wikiTitle: 'John Mulaney', blurb: 'Dapper storyteller' },
  { id: 'trevor-noah', name: 'Trevor Noah', gender: 'male', wikiTitle: 'Trevor Noah', blurb: 'Ex–Daily Show host' },
  { id: 'steve-martin', name: 'Steve Martin', gender: 'male', wikiTitle: 'Steve Martin', blurb: 'Wild and crazy guy' },
  { id: 'eddie-murphy', name: 'Eddie Murphy', gender: 'male', wikiTitle: 'Eddie Murphy', blurb: 'SNL & Beverly Hills Cop' },
  { id: 'ricky-gervais', name: 'Ricky Gervais', gender: 'male', wikiTitle: 'Ricky Gervais', blurb: 'The Office (UK) creator' },
  { id: 'jim-carrey', name: 'Jim Carrey', gender: 'male', wikiTitle: 'Jim Carrey', blurb: 'Rubber-faced icon' },
  { id: 'bo-burnham', name: 'Bo Burnham', gender: 'male', wikiTitle: 'Bo Burnham', blurb: 'Musical comedy auteur' },
  { id: 'hasan-minhaj', name: 'Hasan Minhaj', gender: 'male', wikiTitle: 'Hasan Minhaj', blurb: 'Patriot Act host' },
  { id: 'conan-obrien', name: "Conan O'Brien", gender: 'male', wikiTitle: "Conan O'Brien", blurb: 'Late-night ginger' },
  { id: 'adam-sandler', name: 'Adam Sandler', gender: 'male', wikiTitle: 'Adam Sandler', blurb: 'SNL & Happy Gilmore' },
  { id: 'sebastian-maniscalco', name: 'Sebastian Maniscalco', gender: 'male', wikiTitle: 'Sebastian Maniscalco', blurb: 'Animated Italian-American' },
  { id: 'aziz-ansari', name: 'Aziz Ansari', gender: 'male', wikiTitle: 'Aziz Ansari', blurb: 'Master of None' },
  { id: 'pete-davidson', name: 'Pete Davidson', gender: 'male', wikiTitle: 'Pete Davidson', blurb: 'SNL wildcard' },

  // --- women ---
  { id: 'tina-fey', name: 'Tina Fey', gender: 'female', wikiTitle: 'Tina Fey', blurb: '30 Rock & Weekend Update' },
  { id: 'amy-poehler', name: 'Amy Poehler', gender: 'female', wikiTitle: 'Amy Poehler', blurb: "Parks & Rec's Leslie Knope" },
  { id: 'ali-wong', name: 'Ali Wong', gender: 'female', wikiTitle: 'Ali Wong', blurb: 'Baby Cobra phenom' },
  { id: 'sarah-silverman', name: 'Sarah Silverman', gender: 'female', wikiTitle: 'Sarah Silverman', blurb: 'Provocative & playful' },
  { id: 'wanda-sykes', name: 'Wanda Sykes', gender: 'female', wikiTitle: 'Wanda Sykes', blurb: 'Quick-witted veteran' },
  { id: 'kate-mckinnon', name: 'Kate McKinnon', gender: 'female', wikiTitle: 'Kate McKinnon', blurb: 'SNL chameleon' },
  { id: 'maya-rudolph', name: 'Maya Rudolph', gender: 'female', wikiTitle: 'Maya Rudolph', blurb: 'SNL impressions queen' },
  { id: 'tig-notaro', name: 'Tig Notaro', gender: 'female', wikiTitle: 'Tig Notaro', blurb: 'Deadpan storyteller' },
  { id: 'nikki-glaser', name: 'Nikki Glaser', gender: 'female', wikiTitle: 'Nikki Glaser', blurb: 'Roast-battle sniper' },
  { id: 'iliza-shlesinger', name: 'Iliza Shlesinger', gender: 'female', wikiTitle: 'Iliza Shlesinger', blurb: 'Last Comic Standing winner' },
  { id: 'chelsea-handler', name: 'Chelsea Handler', gender: 'female', wikiTitle: 'Chelsea Handler', blurb: 'Talk-show trailblazer' },
  { id: 'whitney-cummings', name: 'Whitney Cummings', gender: 'female', wikiTitle: 'Whitney Cummings', blurb: '2 Broke Girls co-creator' },
  { id: 'kristen-wiig', name: 'Kristen Wiig', gender: 'female', wikiTitle: 'Kristen Wiig', blurb: 'Bridesmaids & SNL' },
  { id: 'mindy-kaling', name: 'Mindy Kaling', gender: 'female', wikiTitle: 'Mindy Kaling', blurb: 'The Office writer/star' },
  { id: 'leslie-jones', name: 'Leslie Jones', gender: 'female', wikiTitle: 'Leslie Jones (comedian)', blurb: 'SNL powerhouse' },
  { id: 'hannah-gadsby', name: 'Hannah Gadsby', gender: 'female', wikiTitle: 'Hannah Gadsby', blurb: 'Nanette creator' },
  { id: 'margaret-cho', name: 'Margaret Cho', gender: 'female', wikiTitle: 'Margaret Cho', blurb: 'Stand-up trailblazer' },
  { id: 'michelle-wolf', name: 'Michelle Wolf', gender: 'female', wikiTitle: 'Michelle Wolf', blurb: 'Sharp political wit' },
];

export function comediansByGender(gender: 'male' | 'female'): Candidate[] {
  return COMEDIANS.filter((c) => c.gender === gender);
}
