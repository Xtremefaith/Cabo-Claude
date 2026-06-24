// Built-in deck for Finish the Lyric. Each prompt shows one line of a song; the
// player picks the line that comes next. `answer` is the correct next line and
// `decoys` are plausible wrong lines (drawn from other songs so the right answer
// never hides among same-song lines). The four are shuffled into multiple-choice
// options at deck-build time.
//
// IMPORTANT: every song here is in the PUBLIC DOMAIN (traditional folk, nursery
// rhymes, spirituals, and pre-1929 standards), so the lyrics are safe to ship
// verbatim. Do NOT add lines from modern, copyrighted songs to this file — a
// future "bring your own lyrics" path will handle those separately.
//
// `spice` is a 1–5 rating (see data/spice.ts). These are squeaky clean, so they
// all sit at 1 and always appear regardless of the group's spice setting.

export interface LyricPrompt {
  id: string;
  /** The lyric line shown on the card. */
  line: string;
  /** The line that comes next (the correct pick). */
  answer: string;
  /** Three plausible wrong next-lines shown alongside the answer. */
  decoys: [string, string, string];
  /** The song title, revealed after answering. */
  hint?: string;
  spice: number; // 1 (clean) … 5 (unhinged)
}

export const LYRIC_PROMPTS: LyricPrompt[] = [
  {
    id: 'twinkle-star',
    line: 'Twinkle, twinkle, little star,',
    answer: 'How I wonder what you are.',
    decoys: ['Life is but a dream.', 'And down will come baby.', 'All the livelong day.'],
    hint: 'Twinkle, Twinkle, Little Star (traditional)',
    spice: 1,
  },
  {
    id: 'row-boat',
    line: 'Row, row, row your boat,',
    answer: 'Gently down the stream.',
    decoys: ['How I wonder what you are.', 'All through the town.', 'Have you any wool?'],
    hint: 'Row, Row, Row Your Boat (traditional)',
    spice: 1,
  },
  {
    id: 'mary-lamb',
    line: 'Mary had a little lamb,',
    answer: 'Its fleece was white as snow.',
    decoys: ['He jumped over the moon.', 'Eating her curds and whey.', 'All the king’s horses.'],
    hint: 'Mary Had a Little Lamb (traditional)',
    spice: 1,
  },
  {
    id: 'old-macdonald',
    line: 'Old MacDonald had a farm,',
    answer: 'E-I-E-I-O.',
    decoys: ['Hee-haw, all day long.', 'With a moo-moo here.', 'All the livelong day.'],
    hint: 'Old MacDonald Had a Farm (traditional)',
    spice: 1,
  },
  {
    id: 'railroad',
    line: 'I’ve been working on the railroad,',
    answer: 'All the livelong day.',
    decoys: ['Riding on a pony.', 'Gently down the stream.', 'E-I-E-I-O.'],
    hint: 'I’ve Been Working on the Railroad (traditional)',
    spice: 1,
  },
  {
    id: 'yankee-doodle',
    line: 'Yankee Doodle went to town,',
    answer: 'Riding on a pony,',
    decoys: ['All the livelong day,', 'How I wonder what you are,', 'Gently down the stream,'],
    hint: 'Yankee Doodle (traditional)',
    spice: 1,
  },
  {
    id: 'jingle-verse',
    line: 'Dashing through the snow,',
    answer: 'In a one-horse open sleigh,',
    decoys: ['Glory to the newborn King,', 'Joy to the world, the Lord is come,', 'Deck the halls with boughs of holly,'],
    hint: 'Jingle Bells (J. L. Pierpont, 1857)',
    spice: 1,
  },
  {
    id: 'jingle-chorus',
    line: 'Jingle bells, jingle bells,',
    answer: 'Jingle all the way!',
    decoys: ['Dashing through the snow,', 'Five golden rings!', 'Glory to the newborn King,'],
    hint: 'Jingle Bells (1857)',
    spice: 1,
  },
  {
    id: 'deck-halls',
    line: 'Deck the halls with boughs of holly,',
    answer: 'Fa-la-la-la-la, la-la-la-la.',
    decoys: ['Glory to the newborn King,', 'Silent night, holy night,', 'O come, all ye faithful,'],
    hint: 'Deck the Halls (traditional Welsh)',
    spice: 1,
  },
  {
    id: 'twelve-days',
    line: 'On the first day of Christmas, my true love gave to me,',
    answer: 'A partridge in a pear tree.',
    decoys: ['Five golden rings!', 'And a happy New Year!', 'Two turtle doves,'],
    hint: 'The Twelve Days of Christmas (traditional)',
    spice: 1,
  },
  {
    id: 'amazing-grace',
    line: 'Amazing grace, how sweet the sound,',
    answer: 'That saved a wretch like me.',
    decoys: ['Swing low, sweet chariot,', 'When the saints go marching in,', 'Glory, glory, hallelujah,'],
    hint: 'Amazing Grace (John Newton, 1779)',
    spice: 1,
  },
  {
    id: 'saints',
    line: 'Oh, when the saints go marching in,',
    answer: 'Lord, how I want to be in that number,',
    decoys: ['Coming for to carry me home,', 'Glory, glory, hallelujah,', 'That saved a wretch like me,'],
    hint: 'When the Saints Go Marching In (traditional)',
    spice: 1,
  },
  {
    id: 'swing-low',
    line: 'Swing low, sweet chariot,',
    answer: 'Coming for to carry me home.',
    decoys: ['Lord, how I want to be in that number,', 'Michael, row the boat ashore,', 'That saved a wretch like me.'],
    hint: 'Swing Low, Sweet Chariot (spiritual)',
    spice: 1,
  },
  {
    id: 'clementine',
    line: 'Oh my darling, oh my darling,',
    answer: 'Oh my darling, Clementine,',
    decoys: ['In a cavern, in a canyon,', 'You are lost and gone forever,', 'Dreadful sorry, Clementine.'],
    hint: 'Oh My Darling, Clementine (traditional)',
    spice: 1,
  },
  {
    id: 'my-bonnie',
    line: 'My Bonnie lies over the ocean,',
    answer: 'My Bonnie lies over the sea,',
    decoys: ['Row, row, row your boat,', 'For he’s a jolly good fellow,', 'She’ll be coming ’round the mountain,'],
    hint: 'My Bonnie Lies Over the Ocean (traditional)',
    spice: 1,
  },
  {
    id: 'ball-game',
    line: 'Take me out to the ball game,',
    answer: 'Take me out with the crowd.',
    decoys: ['Glory, glory, hallelujah,', 'Row, row, row your boat,', 'And a happy New Year!'],
    hint: 'Take Me Out to the Ball Game (1908)',
    spice: 1,
  },
  {
    id: 'london-bridge',
    line: 'London Bridge is falling down,',
    answer: 'Falling down, falling down,',
    decoys: ['E-I-E-I-O,', 'Pop! goes the weasel,', 'And down will come baby,'],
    hint: 'London Bridge Is Falling Down (traditional)',
    spice: 1,
  },
  {
    id: 'itsy-spider',
    line: 'The itsy bitsy spider climbed up the water spout,',
    answer: 'Down came the rain and washed the spider out,',
    decoys: ['How I wonder what you are,', 'And down will come baby,', 'E-I-E-I-O,'],
    hint: 'The Itsy Bitsy Spider (traditional)',
    spice: 1,
  },
  {
    id: 'baa-black-sheep',
    line: 'Baa, baa, black sheep,',
    answer: 'Have you any wool?',
    decoys: ['How I wonder what you are?', 'Gently down the stream?', 'All the livelong day?'],
    hint: 'Baa, Baa, Black Sheep (traditional)',
    spice: 1,
  },
  {
    id: 'hickory-dock',
    line: 'Hickory dickory dock,',
    answer: 'The mouse ran up the clock,',
    decoys: ['All the king’s horses,', 'How I wonder what you are,', 'And down will come baby,'],
    hint: 'Hickory Dickory Dock (traditional)',
    spice: 1,
  },
];
