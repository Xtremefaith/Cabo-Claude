// Curated rosters of well-known celebrities, grouped by category. The player
// chooses a category before each round of Hot or Not.
//
// Headshots are NOT bundled. At runtime the app resolves each person's photo
// from Wikipedia's image API using `wikiTitle` (see lib/wikiImages.ts). That
// keeps the repo light, avoids shipping copyrighted images, and self-corrects
// if a photo on Wikipedia changes. `wikiTitle` must match the real Wikipedia
// page title exactly (including any "(musician)"/"(comedian)" disambiguation).
//
// Each category needs at least DECK_SIZE (10) people per gender so a full deck
// can always be sampled for either player gender.

import type { Candidate, CategoryId, Gender } from '../types';

export interface CategoryMeta {
  id: CategoryId;
  /** Singular noun shown on the swipe card tag, e.g. "Actor". */
  label: string;
  /** Plural title shown on the category picker tile, e.g. "Actors". */
  plural: string;
  emoji: string;
  /** Short teaser shown under the title on the picker. */
  blurb: string;
  /** Tailwind gradient for the picker tile. */
  gradient: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'comedians',
    label: 'Comedian',
    plural: 'Comedians',
    emoji: '🎤',
    blurb: 'Stand-ups & sketch stars',
    gradient: 'from-hot via-sun to-sun',
  },
  {
    id: 'actors',
    label: 'Actor',
    plural: 'Actors',
    emoji: '🎬',
    blurb: 'Big-screen heavyweights',
    gradient: 'from-indigo-500 via-purple-500 to-hot',
  },
  {
    id: 'musicians',
    label: 'Musician',
    plural: 'Musicians',
    emoji: '🎶',
    blurb: 'Chart-topping icons',
    gradient: 'from-cyan-400 via-sky-500 to-indigo-500',
  },
  {
    id: 'athletes',
    label: 'Athlete',
    plural: 'Athletes',
    emoji: '🏅',
    blurb: 'Champions & legends',
    gradient: 'from-emerald-400 via-teal-500 to-sky-500',
  },
];

export const CELEBRITIES: Candidate[] = [
  // ===================== COMEDIANS =====================
  // --- men ---
  { id: 'kevin-hart', name: 'Kevin Hart', gender: 'male', category: 'comedians', wikiTitle: 'Kevin Hart', blurb: 'Stand-up dynamo' },
  { id: 'dave-chappelle', name: 'Dave Chappelle', gender: 'male', category: 'comedians', wikiTitle: 'Dave Chappelle', blurb: "Chappelle's Show legend" },
  { id: 'jerry-seinfeld', name: 'Jerry Seinfeld', gender: 'male', category: 'comedians', wikiTitle: 'Jerry Seinfeld', blurb: 'Observational king' },
  { id: 'chris-rock', name: 'Chris Rock', gender: 'male', category: 'comedians', wikiTitle: 'Chris Rock', blurb: 'Sharp, fearless stand-up' },
  { id: 'bill-burr', name: 'Bill Burr', gender: 'male', category: 'comedians', wikiTitle: 'Bill Burr', blurb: 'Ranting Boston firebrand' },
  { id: 'john-mulaney', name: 'John Mulaney', gender: 'male', category: 'comedians', wikiTitle: 'John Mulaney', blurb: 'Dapper storyteller' },
  { id: 'trevor-noah', name: 'Trevor Noah', gender: 'male', category: 'comedians', wikiTitle: 'Trevor Noah', blurb: 'Ex–Daily Show host' },
  { id: 'steve-martin', name: 'Steve Martin', gender: 'male', category: 'comedians', wikiTitle: 'Steve Martin', blurb: 'Wild and crazy guy' },
  { id: 'eddie-murphy', name: 'Eddie Murphy', gender: 'male', category: 'comedians', wikiTitle: 'Eddie Murphy', blurb: 'SNL & Beverly Hills Cop' },
  { id: 'ricky-gervais', name: 'Ricky Gervais', gender: 'male', category: 'comedians', wikiTitle: 'Ricky Gervais', blurb: 'The Office (UK) creator' },
  { id: 'jim-carrey', name: 'Jim Carrey', gender: 'male', category: 'comedians', wikiTitle: 'Jim Carrey', blurb: 'Rubber-faced icon' },
  { id: 'bo-burnham', name: 'Bo Burnham', gender: 'male', category: 'comedians', wikiTitle: 'Bo Burnham', blurb: 'Musical comedy auteur' },
  { id: 'hasan-minhaj', name: 'Hasan Minhaj', gender: 'male', category: 'comedians', wikiTitle: 'Hasan Minhaj', blurb: 'Patriot Act host' },
  { id: 'conan-obrien', name: "Conan O'Brien", gender: 'male', category: 'comedians', wikiTitle: "Conan O'Brien", blurb: 'Late-night ginger' },
  { id: 'adam-sandler', name: 'Adam Sandler', gender: 'male', category: 'comedians', wikiTitle: 'Adam Sandler', blurb: 'SNL & Happy Gilmore' },
  { id: 'sebastian-maniscalco', name: 'Sebastian Maniscalco', gender: 'male', category: 'comedians', wikiTitle: 'Sebastian Maniscalco', blurb: 'Animated Italian-American' },
  { id: 'aziz-ansari', name: 'Aziz Ansari', gender: 'male', category: 'comedians', wikiTitle: 'Aziz Ansari', blurb: 'Master of None' },
  { id: 'pete-davidson', name: 'Pete Davidson', gender: 'male', category: 'comedians', wikiTitle: 'Pete Davidson', blurb: 'SNL wildcard' },
  // --- women ---
  { id: 'tina-fey', name: 'Tina Fey', gender: 'female', category: 'comedians', wikiTitle: 'Tina Fey', blurb: '30 Rock & Weekend Update' },
  { id: 'amy-poehler', name: 'Amy Poehler', gender: 'female', category: 'comedians', wikiTitle: 'Amy Poehler', blurb: "Parks & Rec's Leslie Knope" },
  { id: 'ali-wong', name: 'Ali Wong', gender: 'female', category: 'comedians', wikiTitle: 'Ali Wong', blurb: 'Baby Cobra phenom' },
  { id: 'sarah-silverman', name: 'Sarah Silverman', gender: 'female', category: 'comedians', wikiTitle: 'Sarah Silverman', blurb: 'Provocative & playful' },
  { id: 'wanda-sykes', name: 'Wanda Sykes', gender: 'female', category: 'comedians', wikiTitle: 'Wanda Sykes', blurb: 'Quick-witted veteran' },
  { id: 'kate-mckinnon', name: 'Kate McKinnon', gender: 'female', category: 'comedians', wikiTitle: 'Kate McKinnon', blurb: 'SNL chameleon' },
  { id: 'maya-rudolph', name: 'Maya Rudolph', gender: 'female', category: 'comedians', wikiTitle: 'Maya Rudolph', blurb: 'SNL impressions queen' },
  { id: 'tig-notaro', name: 'Tig Notaro', gender: 'female', category: 'comedians', wikiTitle: 'Tig Notaro', blurb: 'Deadpan storyteller' },
  { id: 'nikki-glaser', name: 'Nikki Glaser', gender: 'female', category: 'comedians', wikiTitle: 'Nikki Glaser', blurb: 'Roast-battle sniper' },
  { id: 'iliza-shlesinger', name: 'Iliza Shlesinger', gender: 'female', category: 'comedians', wikiTitle: 'Iliza Shlesinger', blurb: 'Last Comic Standing winner' },
  { id: 'chelsea-handler', name: 'Chelsea Handler', gender: 'female', category: 'comedians', wikiTitle: 'Chelsea Handler', blurb: 'Talk-show trailblazer' },
  { id: 'whitney-cummings', name: 'Whitney Cummings', gender: 'female', category: 'comedians', wikiTitle: 'Whitney Cummings', blurb: '2 Broke Girls co-creator' },
  { id: 'kristen-wiig', name: 'Kristen Wiig', gender: 'female', category: 'comedians', wikiTitle: 'Kristen Wiig', blurb: 'Bridesmaids & SNL' },
  { id: 'mindy-kaling', name: 'Mindy Kaling', gender: 'female', category: 'comedians', wikiTitle: 'Mindy Kaling', blurb: 'The Office writer/star' },
  { id: 'leslie-jones', name: 'Leslie Jones', gender: 'female', category: 'comedians', wikiTitle: 'Leslie Jones (comedian)', blurb: 'SNL powerhouse' },
  { id: 'hannah-gadsby', name: 'Hannah Gadsby', gender: 'female', category: 'comedians', wikiTitle: 'Hannah Gadsby', blurb: 'Nanette creator' },
  { id: 'margaret-cho', name: 'Margaret Cho', gender: 'female', category: 'comedians', wikiTitle: 'Margaret Cho', blurb: 'Stand-up trailblazer' },
  { id: 'michelle-wolf', name: 'Michelle Wolf', gender: 'female', category: 'comedians', wikiTitle: 'Michelle Wolf', blurb: 'Sharp political wit' },

  // ===================== ACTORS =====================
  // --- men ---
  { id: 'tom-hanks', name: 'Tom Hanks', gender: 'male', category: 'actors', wikiTitle: 'Tom Hanks', blurb: "America's everyman" },
  { id: 'leonardo-dicaprio', name: 'Leonardo DiCaprio', gender: 'male', category: 'actors', wikiTitle: 'Leonardo DiCaprio', blurb: 'Titanic to The Revenant' },
  { id: 'denzel-washington', name: 'Denzel Washington', gender: 'male', category: 'actors', wikiTitle: 'Denzel Washington', blurb: 'Two-time Oscar winner' },
  { id: 'brad-pitt', name: 'Brad Pitt', gender: 'male', category: 'actors', wikiTitle: 'Brad Pitt', blurb: 'Leading-man icon' },
  { id: 'will-smith', name: 'Will Smith', gender: 'male', category: 'actors', wikiTitle: 'Will Smith', blurb: 'Fresh Prince to blockbusters' },
  { id: 'morgan-freeman', name: 'Morgan Freeman', gender: 'male', category: 'actors', wikiTitle: 'Morgan Freeman', blurb: 'The voice of cinema' },
  { id: 'robert-downey-jr', name: 'Robert Downey Jr.', gender: 'male', category: 'actors', wikiTitle: 'Robert Downey Jr.', blurb: 'Iron Man himself' },
  { id: 'ryan-reynolds', name: 'Ryan Reynolds', gender: 'male', category: 'actors', wikiTitle: 'Ryan Reynolds', blurb: 'Deadpool wisecracker' },
  { id: 'keanu-reeves', name: 'Keanu Reeves', gender: 'male', category: 'actors', wikiTitle: 'Keanu Reeves', blurb: 'Neo & John Wick' },
  { id: 'chris-hemsworth', name: 'Chris Hemsworth', gender: 'male', category: 'actors', wikiTitle: 'Chris Hemsworth', blurb: 'The mighty Thor' },
  { id: 'idris-elba', name: 'Idris Elba', gender: 'male', category: 'actors', wikiTitle: 'Idris Elba', blurb: 'Luther & The Wire' },
  { id: 'samuel-l-jackson', name: 'Samuel L. Jackson', gender: 'male', category: 'actors', wikiTitle: 'Samuel L. Jackson', blurb: 'Pulp Fiction force' },
  // --- women ---
  { id: 'meryl-streep', name: 'Meryl Streep', gender: 'female', category: 'actors', wikiTitle: 'Meryl Streep', blurb: 'Most-nominated ever' },
  { id: 'scarlett-johansson', name: 'Scarlett Johansson', gender: 'female', category: 'actors', wikiTitle: 'Scarlett Johansson', blurb: 'Black Widow' },
  { id: 'jennifer-lawrence', name: 'Jennifer Lawrence', gender: 'female', category: 'actors', wikiTitle: 'Jennifer Lawrence', blurb: 'Hunger Games star' },
  { id: 'viola-davis', name: 'Viola Davis', gender: 'female', category: 'actors', wikiTitle: 'Viola Davis', blurb: 'EGOT powerhouse' },
  { id: 'margot-robbie', name: 'Margot Robbie', gender: 'female', category: 'actors', wikiTitle: 'Margot Robbie', blurb: 'Barbie & Harley Quinn' },
  { id: 'zendaya', name: 'Zendaya', gender: 'female', category: 'actors', wikiTitle: 'Zendaya', blurb: 'Euphoria & Dune' },
  { id: 'emma-stone', name: 'Emma Stone', gender: 'female', category: 'actors', wikiTitle: 'Emma Stone', blurb: 'La La Land & Poor Things' },
  { id: 'sandra-bullock', name: 'Sandra Bullock', gender: 'female', category: 'actors', wikiTitle: 'Sandra Bullock', blurb: 'Speed to Gravity' },
  { id: 'julia-roberts', name: 'Julia Roberts', gender: 'female', category: 'actors', wikiTitle: 'Julia Roberts', blurb: "America's sweetheart" },
  { id: 'charlize-theron', name: 'Charlize Theron', gender: 'female', category: 'actors', wikiTitle: 'Charlize Theron', blurb: 'Mad Max: Fury Road' },
  { id: 'natalie-portman', name: 'Natalie Portman', gender: 'female', category: 'actors', wikiTitle: 'Natalie Portman', blurb: 'Black Swan Oscar' },
  { id: 'gal-gadot', name: 'Gal Gadot', gender: 'female', category: 'actors', wikiTitle: 'Gal Gadot', blurb: 'Wonder Woman' },

  // ===================== MUSICIANS =====================
  // --- men ---
  { id: 'bruno-mars', name: 'Bruno Mars', gender: 'male', category: 'musicians', wikiTitle: 'Bruno Mars', blurb: 'Pop-funk showman' },
  { id: 'ed-sheeran', name: 'Ed Sheeran', gender: 'male', category: 'musicians', wikiTitle: 'Ed Sheeran', blurb: 'Singer-songwriter juggernaut' },
  { id: 'the-weeknd', name: 'The Weeknd', gender: 'male', category: 'musicians', wikiTitle: 'The Weeknd', blurb: 'Blinding Lights hitmaker' },
  { id: 'john-legend', name: 'John Legend', gender: 'male', category: 'musicians', wikiTitle: 'John Legend', blurb: 'Soulful EGOT' },
  { id: 'justin-timberlake', name: 'Justin Timberlake', gender: 'male', category: 'musicians', wikiTitle: 'Justin Timberlake', blurb: 'NSYNC to solo pop' },
  { id: 'harry-styles', name: 'Harry Styles', gender: 'male', category: 'musicians', wikiTitle: 'Harry Styles', blurb: 'One Direction breakout' },
  { id: 'bad-bunny', name: 'Bad Bunny', gender: 'male', category: 'musicians', wikiTitle: 'Bad Bunny', blurb: 'Reggaeton superstar' },
  { id: 'post-malone', name: 'Post Malone', gender: 'male', category: 'musicians', wikiTitle: 'Post Malone', blurb: 'Genre-blending hitmaker' },
  { id: 'eminem', name: 'Eminem', gender: 'male', category: 'musicians', wikiTitle: 'Eminem', blurb: 'Rap God' },
  { id: 'pharrell-williams', name: 'Pharrell Williams', gender: 'male', category: 'musicians', wikiTitle: 'Pharrell Williams', blurb: 'Happy super-producer' },
  { id: 'usher', name: 'Usher', gender: 'male', category: 'musicians', wikiTitle: 'Usher (musician)', blurb: 'R&B hitmaker' },
  { id: 'shawn-mendes', name: 'Shawn Mendes', gender: 'male', category: 'musicians', wikiTitle: 'Shawn Mendes', blurb: 'Pop heartthrob' },
  // --- women ---
  { id: 'beyonce', name: 'Beyoncé', gender: 'female', category: 'musicians', wikiTitle: 'Beyoncé', blurb: 'Queen Bey' },
  { id: 'taylor-swift', name: 'Taylor Swift', gender: 'female', category: 'musicians', wikiTitle: 'Taylor Swift', blurb: 'Eras-tour phenomenon' },
  { id: 'adele', name: 'Adele', gender: 'female', category: 'musicians', wikiTitle: 'Adele', blurb: 'Powerhouse balladeer' },
  { id: 'rihanna', name: 'Rihanna', gender: 'female', category: 'musicians', wikiTitle: 'Rihanna', blurb: 'Pop & Fenty mogul' },
  { id: 'ariana-grande', name: 'Ariana Grande', gender: 'female', category: 'musicians', wikiTitle: 'Ariana Grande', blurb: 'Whistle-note pop star' },
  { id: 'billie-eilish', name: 'Billie Eilish', gender: 'female', category: 'musicians', wikiTitle: 'Billie Eilish', blurb: 'Gen-Z chart-topper' },
  { id: 'lady-gaga', name: 'Lady Gaga', gender: 'female', category: 'musicians', wikiTitle: 'Lady Gaga', blurb: 'Pop chameleon' },
  { id: 'dua-lipa', name: 'Dua Lipa', gender: 'female', category: 'musicians', wikiTitle: 'Dua Lipa', blurb: 'Future Nostalgia' },
  { id: 'katy-perry', name: 'Katy Perry', gender: 'female', category: 'musicians', wikiTitle: 'Katy Perry', blurb: 'Teenage Dream hits' },
  { id: 'miley-cyrus', name: 'Miley Cyrus', gender: 'female', category: 'musicians', wikiTitle: 'Miley Cyrus', blurb: 'Pop-rock shapeshifter' },
  { id: 'selena-gomez', name: 'Selena Gomez', gender: 'female', category: 'musicians', wikiTitle: 'Selena Gomez', blurb: 'Pop star & actress' },
  { id: 'alicia-keys', name: 'Alicia Keys', gender: 'female', category: 'musicians', wikiTitle: 'Alicia Keys', blurb: 'Piano-driven R&B' },

  // ===================== ATHLETES =====================
  // --- men ---
  { id: 'cristiano-ronaldo', name: 'Cristiano Ronaldo', gender: 'male', category: 'athletes', wikiTitle: 'Cristiano Ronaldo', blurb: 'Football goal machine' },
  { id: 'lionel-messi', name: 'Lionel Messi', gender: 'male', category: 'athletes', wikiTitle: 'Lionel Messi', blurb: 'World Cup maestro' },
  { id: 'lebron-james', name: 'LeBron James', gender: 'male', category: 'athletes', wikiTitle: 'LeBron James', blurb: 'NBA all-time scorer' },
  { id: 'tom-brady', name: 'Tom Brady', gender: 'male', category: 'athletes', wikiTitle: 'Tom Brady', blurb: '7-time Super Bowl champ' },
  { id: 'stephen-curry', name: 'Stephen Curry', gender: 'male', category: 'athletes', wikiTitle: 'Stephen Curry', blurb: 'Three-point revolution' },
  { id: 'usain-bolt', name: 'Usain Bolt', gender: 'male', category: 'athletes', wikiTitle: 'Usain Bolt', blurb: 'Fastest man alive' },
  { id: 'roger-federer', name: 'Roger Federer', gender: 'male', category: 'athletes', wikiTitle: 'Roger Federer', blurb: 'Tennis maestro' },
  { id: 'tiger-woods', name: 'Tiger Woods', gender: 'male', category: 'athletes', wikiTitle: 'Tiger Woods', blurb: 'Golf icon' },
  { id: 'michael-jordan', name: 'Michael Jordan', gender: 'male', category: 'athletes', wikiTitle: 'Michael Jordan', blurb: 'The GOAT' },
  { id: 'kevin-durant', name: 'Kevin Durant', gender: 'male', category: 'athletes', wikiTitle: 'Kevin Durant', blurb: 'Unstoppable scorer' },
  { id: 'patrick-mahomes', name: 'Patrick Mahomes', gender: 'male', category: 'athletes', wikiTitle: 'Patrick Mahomes', blurb: 'Chiefs gunslinger' },
  { id: 'shaquille-oneal', name: "Shaquille O'Neal", gender: 'male', category: 'athletes', wikiTitle: "Shaquille O'Neal", blurb: 'Dominant big man' },
  // --- women ---
  { id: 'serena-williams', name: 'Serena Williams', gender: 'female', category: 'athletes', wikiTitle: 'Serena Williams', blurb: '23 Grand Slam titles' },
  { id: 'simone-biles', name: 'Simone Biles', gender: 'female', category: 'athletes', wikiTitle: 'Simone Biles', blurb: 'Most-decorated gymnast' },
  { id: 'megan-rapinoe', name: 'Megan Rapinoe', gender: 'female', category: 'athletes', wikiTitle: 'Megan Rapinoe', blurb: 'World Cup winger' },
  { id: 'naomi-osaka', name: 'Naomi Osaka', gender: 'female', category: 'athletes', wikiTitle: 'Naomi Osaka', blurb: 'Grand Slam champion' },
  { id: 'alex-morgan', name: 'Alex Morgan', gender: 'female', category: 'athletes', wikiTitle: 'Alex Morgan', blurb: 'USWNT striker' },
  { id: 'venus-williams', name: 'Venus Williams', gender: 'female', category: 'athletes', wikiTitle: 'Venus Williams', blurb: 'Tennis trailblazer' },
  { id: 'ronda-rousey', name: 'Ronda Rousey', gender: 'female', category: 'athletes', wikiTitle: 'Ronda Rousey', blurb: 'MMA pioneer' },
  { id: 'lindsey-vonn', name: 'Lindsey Vonn', gender: 'female', category: 'athletes', wikiTitle: 'Lindsey Vonn', blurb: 'Downhill ski legend' },
  { id: 'allyson-felix', name: 'Allyson Felix', gender: 'female', category: 'athletes', wikiTitle: 'Allyson Felix', blurb: 'Most-decorated sprinter' },
  { id: 'maria-sharapova', name: 'Maria Sharapova', gender: 'female', category: 'athletes', wikiTitle: 'Maria Sharapova', blurb: 'Grand Slam star' },
  { id: 'mia-hamm', name: 'Mia Hamm', gender: 'female', category: 'athletes', wikiTitle: 'Mia Hamm', blurb: 'Soccer icon' },
  { id: 'danica-patrick', name: 'Danica Patrick', gender: 'female', category: 'athletes', wikiTitle: 'Danica Patrick', blurb: 'Racing trailblazer' },
];

export function getCategory(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/** Candidates in a given category of a given gender. */
export function candidatesBy(category: CategoryId, gender: Gender): Candidate[] {
  return CELEBRITIES.filter((c) => c.category === category && c.gender === gender);
}
