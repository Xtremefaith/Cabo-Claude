// Built-in quote deck for Guess Who Said It — "Famous Lines" mode (variant B).
// Each prompt shows an iconic movie line; the player guesses which film it's
// from. `answer` is the correct film and `decoys` are plausible wrong films;
// the four are shuffled into multiple-choice options at deck-build time.
//
// `spice` is a 1–5 rating (see data/spice.ts). Famous lines are mostly clean,
// so most sit at 1–2; a game only draws prompts at or below the group's spice.

export interface QuotePrompt {
  id: string;
  /** The iconic line, shown verbatim on the card. */
  quote: string;
  /** The correct source film. */
  answer: string;
  /** Three plausible wrong films shown alongside the answer. */
  decoys: [string, string, string];
  /** Short context revealed after answering (who said it / year). */
  hint?: string;
  spice: number; // 1 (clean) … 5 (unhinged)
}

export const QUOTE_PROMPTS: QuotePrompt[] = [
  {
    id: 'offer-refuse',
    quote: "I'm gonna make him an offer he can't refuse.",
    answer: 'The Godfather',
    decoys: ['Goodfellas', 'Scarface', 'The Departed'],
    hint: 'Vito Corleone, 1972',
    spice: 1,
  },
  {
    id: 'force-be-with-you',
    quote: 'May the Force be with you.',
    answer: 'Star Wars',
    decoys: ['Star Trek', 'Dune', 'Guardians of the Galaxy'],
    hint: 'A galaxy far, far away, 1977',
    spice: 1,
  },
  {
    id: 'looking-at-you',
    quote: "Here's looking at you, kid.",
    answer: 'Casablanca',
    decoys: ['Gone with the Wind', 'Citizen Kane', 'The Maltese Falcon'],
    hint: 'Rick to Ilsa, 1942',
    spice: 1,
  },
  {
    id: 'handle-the-truth',
    quote: "You can't handle the truth!",
    answer: 'A Few Good Men',
    decoys: ['The Firm', 'A Time to Kill', 'JFK'],
    hint: 'Col. Jessup, 1992',
    spice: 1,
  },
  {
    id: 'box-of-chocolates',
    quote: 'Life is like a box of chocolates. You never know what you’re gonna get.',
    answer: 'Forrest Gump',
    decoys: ['Big', 'The Green Mile', 'Cast Away'],
    hint: 'Forrest on the bench, 1994',
    spice: 1,
  },
  {
    id: 'ill-be-back',
    quote: "I'll be back.",
    answer: 'The Terminator',
    decoys: ['Predator', 'RoboCop', 'Total Recall'],
    hint: 'The T-800, 1984',
    spice: 2,
  },
  {
    id: 'why-so-serious',
    quote: 'Why so serious?',
    answer: 'The Dark Knight',
    decoys: ['Joker', 'Batman Begins', 'Watchmen'],
    hint: 'The Joker, 2008',
    spice: 2,
  },
  {
    id: 'infinity-beyond',
    quote: 'To infinity and beyond!',
    answer: 'Toy Story',
    decoys: ['WALL·E', 'The Incredibles', 'Monsters, Inc.'],
    hint: 'Buzz Lightyear, 1995',
    spice: 1,
  },
  {
    id: 'keep-swimming',
    quote: 'Just keep swimming.',
    answer: 'Finding Nemo',
    decoys: ['Moana', 'Shark Tale', 'The Little Mermaid'],
    hint: 'Dory, 2003',
    spice: 1,
  },
  {
    id: 'bigger-boat',
    quote: "You're gonna need a bigger boat.",
    answer: 'Jaws',
    decoys: ['The Perfect Storm', 'Deep Blue Sea', 'Titanic'],
    hint: 'Chief Brody, 1975',
    spice: 1,
  },
  {
    id: 'houston-problem',
    quote: 'Houston, we have a problem.',
    answer: 'Apollo 13',
    decoys: ['Gravity', 'Interstellar', 'The Martian'],
    hint: 'Jim Lovell, 1995',
    spice: 1,
  },
  {
    id: 'little-friend',
    quote: 'Say hello to my little friend!',
    answer: 'Scarface',
    decoys: ['The Godfather', "Carlito's Way", 'Casino'],
    hint: 'Tony Montana, 1983',
    spice: 2,
  },
  {
    id: 'no-place-like-home',
    quote: "There's no place like home.",
    answer: 'The Wizard of Oz',
    decoys: ['Mary Poppins', 'Alice in Wonderland', 'The Sound of Music'],
    hint: 'Dorothy, 1939',
    spice: 1,
  },
  {
    id: 'my-precious',
    quote: 'My precious.',
    answer: 'The Lord of the Rings',
    decoys: ['The Hobbit', 'Harry Potter', 'Game of Thrones'],
    hint: 'Gollum, 2002',
    spice: 1,
  },
  {
    id: 'i-see-dead-people',
    quote: 'I see dead people.',
    answer: 'The Sixth Sense',
    decoys: ['The Others', 'Insidious', 'The Ring'],
    hint: 'Cole Sear, 1999',
    spice: 2,
  },
  {
    id: 'baby-in-corner',
    quote: 'Nobody puts Baby in a corner.',
    answer: 'Dirty Dancing',
    decoys: ['Footloose', 'Grease', 'Flashdance'],
    hint: 'Johnny Castle, 1987',
    spice: 1,
  },
  {
    id: 'et-phone-home',
    quote: 'E.T. phone home.',
    answer: 'E.T. the Extra-Terrestrial',
    decoys: ['Close Encounters of the Third Kind', 'Cocoon', 'Flight of the Navigator'],
    hint: 'E.T., 1982',
    spice: 1,
  },
  {
    id: 'show-me-the-money',
    quote: 'Show me the money!',
    answer: 'Jerry Maguire',
    decoys: ['Wall Street', 'The Wolf of Wall Street', 'Boiler Room'],
    hint: 'Rod Tidwell, 1996',
    spice: 1,
  },
  {
    id: 'wax-on-wax-off',
    quote: 'Wax on, wax off.',
    answer: 'The Karate Kid',
    decoys: ['Rocky', 'Bloodsport', 'Kickboxer'],
    hint: 'Mr. Miyagi, 1984',
    spice: 1,
  },
  {
    id: 'heres-johnny',
    quote: "Here's Johnny!",
    answer: 'The Shining',
    decoys: ['Psycho', 'The Exorcist', 'Misery'],
    hint: 'Jack Torrance, 1980',
    spice: 2,
  },
  {
    id: 'i-am-your-father',
    quote: 'No, I am your father.',
    answer: 'The Empire Strikes Back',
    decoys: ['Return of the Jedi', 'The Phantom Menace', 'Revenge of the Sith'],
    hint: 'Darth Vader, 1980',
    spice: 1,
  },
  {
    id: 'yippee-ki-yay',
    quote: 'Yippee-ki-yay!',
    answer: 'Die Hard',
    decoys: ['Lethal Weapon', 'Speed', 'Con Air'],
    hint: 'John McClane, 1988',
    spice: 3,
  },
  {
    id: 'you-talking-to-me',
    quote: 'You talking to me?',
    answer: 'Taxi Driver',
    decoys: ['Raging Bull', 'Mean Streets', 'Goodfellas'],
    hint: 'Travis Bickle, 1976',
    spice: 2,
  },
  {
    id: 'frankly-my-dear',
    quote: "Frankly, my dear, I don't give a damn.",
    answer: 'Gone with the Wind',
    decoys: ['Casablanca', 'Doctor Zhivago', 'An Affair to Remember'],
    hint: 'Rhett Butler, 1939',
    spice: 3,
  },
];
