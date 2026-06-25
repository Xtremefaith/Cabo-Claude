// Built-in question pool for Trivia — the live general-knowledge quiz. Each
// question shows a prompt and four options; `answer` is correct and `decoys`
// are three plausible wrong options, shuffled together at deck-build time (same
// shape as quotePrompts). Speed-scored with a leaderboard, like Famous Lines.
//
// `category` is shown on the card as the round's topic. `difficulty` (1 easy …
// 3 hard) is stored for future filtering but not yet used to build decks.

export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  answer: string;
  decoys: [string, string, string];
  difficulty: number; // 1 (easy) … 3 (hard)
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  // --- Geography ---
  {
    id: 'geo-au-capital',
    category: 'Geography',
    question: 'What is the capital of Australia?',
    answer: 'Canberra',
    decoys: ['Sydney', 'Melbourne', 'Perth'],
    difficulty: 2,
  },
  {
    id: 'geo-longest-river',
    category: 'Geography',
    question: 'Which is the longest river in the world?',
    answer: 'The Nile',
    decoys: ['The Amazon', 'The Yangtze', 'The Mississippi'],
    difficulty: 2,
  },
  {
    id: 'geo-smallest-country',
    category: 'Geography',
    question: 'What is the smallest country in the world?',
    answer: 'Vatican City',
    decoys: ['Monaco', 'San Marino', 'Liechtenstein'],
    difficulty: 2,
  },
  {
    id: 'geo-hot-desert',
    category: 'Geography',
    question: 'What is the largest hot desert on Earth?',
    answer: 'The Sahara',
    decoys: ['The Gobi', 'The Kalahari', 'The Arabian'],
    difficulty: 2,
  },
  {
    id: 'geo-most-lakes',
    category: 'Geography',
    question: 'Which country has the most natural lakes?',
    answer: 'Canada',
    decoys: ['Russia', 'United States', 'Finland'],
    difficulty: 3,
  },
  {
    id: 'geo-med-sea',
    category: 'Geography',
    question: 'Which sea separates Europe from Africa?',
    answer: 'The Mediterranean',
    decoys: ['The Red Sea', 'The Black Sea', 'The Caspian Sea'],
    difficulty: 2,
  },

  // --- History ---
  {
    id: 'hist-first-potus',
    category: 'History',
    question: 'Who was the first President of the United States?',
    answer: 'George Washington',
    decoys: ['Thomas Jefferson', 'John Adams', 'Benjamin Franklin'],
    difficulty: 1,
  },
  {
    id: 'hist-ww2-end',
    category: 'History',
    question: 'In what year did World War II end?',
    answer: '1945',
    decoys: ['1944', '1946', '1939'],
    difficulty: 2,
  },
  {
    id: 'hist-mona-lisa',
    category: 'History',
    question: 'Who painted the Mona Lisa?',
    answer: 'Leonardo da Vinci',
    decoys: ['Michelangelo', 'Raphael', 'Rembrandt'],
    difficulty: 1,
  },
  {
    id: 'hist-titanic',
    category: 'History',
    question: 'Which ocean liner sank on its maiden voyage in 1912?',
    answer: 'Titanic',
    decoys: ['Lusitania', 'Britannic', 'Olympic'],
    difficulty: 1,
  },
  {
    id: 'hist-pyramid',
    category: 'History',
    question: 'Which Ancient Wonder of the World still stands today?',
    answer: 'Great Pyramid of Giza',
    decoys: ['Hanging Gardens of Babylon', 'Colossus of Rhodes', 'Lighthouse of Alexandria'],
    difficulty: 2,
  },

  // --- Science ---
  {
    id: 'sci-gold-symbol',
    category: 'Science',
    question: 'What is the chemical symbol for gold?',
    answer: 'Au',
    decoys: ['Ag', 'Gd', 'Go'],
    difficulty: 2,
  },
  {
    id: 'sci-bones',
    category: 'Science',
    question: 'How many bones are in the adult human body?',
    answer: '206',
    decoys: ['201', '212', '196'],
    difficulty: 3,
  },
  {
    id: 'sci-red-planet',
    category: 'Science',
    question: 'Which planet is known as the Red Planet?',
    answer: 'Mars',
    decoys: ['Venus', 'Jupiter', 'Mercury'],
    difficulty: 1,
  },
  {
    id: 'sci-plant-gas',
    category: 'Science',
    question: 'Which gas do plants absorb from the air for photosynthesis?',
    answer: 'Carbon dioxide',
    decoys: ['Oxygen', 'Nitrogen', 'Hydrogen'],
    difficulty: 1,
  },
  {
    id: 'sci-hardest',
    category: 'Science',
    question: 'What is the hardest known natural material?',
    answer: 'Diamond',
    decoys: ['Quartz', 'Titanium', 'Graphite'],
    difficulty: 1,
  },
  {
    id: 'sci-largest-planet',
    category: 'Science',
    question: 'What is the largest planet in our solar system?',
    answer: 'Jupiter',
    decoys: ['Saturn', 'Neptune', 'Earth'],
    difficulty: 1,
  },
  {
    id: 'sci-cell-powerhouse',
    category: 'Science',
    question: 'Which organelle is known as the powerhouse of the cell?',
    answer: 'Mitochondria',
    decoys: ['Nucleus', 'Ribosome', 'Chloroplast'],
    difficulty: 2,
  },
  {
    id: 'sci-water-boil',
    category: 'Science',
    question: 'At sea level, water boils at what temperature in Celsius?',
    answer: '100°',
    decoys: ['90°', '120°', '80°'],
    difficulty: 1,
  },

  // --- Animals ---
  {
    id: 'ani-largest',
    category: 'Animals',
    question: 'What is the largest animal on Earth?',
    answer: 'Blue whale',
    decoys: ['African elephant', 'Giraffe', 'Whale shark'],
    difficulty: 1,
  },
  {
    id: 'ani-fastest',
    category: 'Animals',
    question: 'What is the fastest land animal?',
    answer: 'Cheetah',
    decoys: ['Lion', 'Pronghorn', 'Greyhound'],
    difficulty: 1,
  },
  {
    id: 'ani-spider-legs',
    category: 'Animals',
    question: 'How many legs does a spider have?',
    answer: '8',
    decoys: ['6', '10', '12'],
    difficulty: 1,
  },
  {
    id: 'ani-flightless',
    category: 'Animals',
    question: 'Which of these birds cannot fly?',
    answer: 'Penguin',
    decoys: ['Eagle', 'Sparrow', 'Robin'],
    difficulty: 1,
  },

  // --- Sports ---
  {
    id: 'sport-soccer-team',
    category: 'Sports',
    question: 'How many players from one team are on a soccer field at kickoff?',
    answer: '11',
    decoys: ['9', '10', '12'],
    difficulty: 1,
  },
  {
    id: 'sport-olympics',
    category: 'Sports',
    question: 'How often are the modern Summer Olympic Games held?',
    answer: 'Every 4 years',
    decoys: ['Every 2 years', 'Every year', 'Every 5 years'],
    difficulty: 1,
  },
  {
    id: 'sport-dunk',
    category: 'Sports',
    question: 'In which sport would you perform a slam dunk?',
    answer: 'Basketball',
    decoys: ['Volleyball', 'Tennis', 'Hockey'],
    difficulty: 1,
  },
  {
    id: 'sport-touchdown',
    category: 'Sports',
    question: 'How many points is a touchdown worth in American football?',
    answer: '6',
    decoys: ['7', '3', '5'],
    difficulty: 2,
  },

  // --- Music ---
  {
    id: 'music-piano-keys',
    category: 'Music',
    question: 'How many keys does a standard piano have?',
    answer: '88',
    decoys: ['76', '92', '64'],
    difficulty: 2,
  },
  {
    id: 'music-hey-jude',
    category: 'Music',
    question: 'Which band recorded the song "Hey Jude"?',
    answer: 'The Beatles',
    decoys: ['The Rolling Stones', 'The Beach Boys', 'Queen'],
    difficulty: 1,
  },
  {
    id: 'music-guitar-strings',
    category: 'Music',
    question: 'How many strings does a standard guitar have?',
    answer: '6',
    decoys: ['4', '5', '7'],
    difficulty: 1,
  },

  // --- Food & Drink ---
  {
    id: 'food-guac',
    category: 'Food & Drink',
    question: 'What is the main ingredient in guacamole?',
    answer: 'Avocado',
    decoys: ['Tomato', 'Pepper', 'Cucumber'],
    difficulty: 1,
  },
  {
    id: 'food-pizza',
    category: 'Food & Drink',
    question: 'Which country is widely credited with inventing pizza?',
    answer: 'Italy',
    decoys: ['Greece', 'France', 'United States'],
    difficulty: 1,
  },
  {
    id: 'food-saffron',
    category: 'Food & Drink',
    question: 'Which spice is the most expensive by weight?',
    answer: 'Saffron',
    decoys: ['Vanilla', 'Cardamom', 'Cinnamon'],
    difficulty: 2,
  },

  // --- Literature ---
  {
    id: 'lit-romeo',
    category: 'Literature',
    question: 'Who wrote "Romeo and Juliet"?',
    answer: 'William Shakespeare',
    decoys: ['Charles Dickens', 'Jane Austen', 'Mark Twain'],
    difficulty: 1,
  },
  {
    id: 'lit-hamlet',
    category: 'Literature',
    question: '"To be, or not to be" is a line from which play?',
    answer: 'Hamlet',
    decoys: ['Macbeth', 'Othello', 'King Lear'],
    difficulty: 2,
  },

  // --- Tech ---
  {
    id: 'tech-www',
    category: 'Technology',
    question: 'What does "WWW" stand for?',
    answer: 'World Wide Web',
    decoys: ['Wide World Web', 'World Web Wide', 'Web World Wide'],
    difficulty: 1,
  },
  {
    id: 'tech-apple-cofounder',
    category: 'Technology',
    question: 'Who co-founded Apple alongside Steve Jobs?',
    answer: 'Steve Wozniak',
    decoys: ['Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos'],
    difficulty: 2,
  },
  {
    id: 'tech-cpu',
    category: 'Technology',
    question: 'In computing, what does "CPU" stand for?',
    answer: 'Central Processing Unit',
    decoys: ['Computer Processing Unit', 'Central Print Unit', 'Core Processing Unit'],
    difficulty: 2,
  },

  // --- Maths ---
  {
    id: 'math-hexagon',
    category: 'Maths',
    question: 'How many sides does a hexagon have?',
    answer: '6',
    decoys: ['5', '7', '8'],
    difficulty: 1,
  },
  {
    id: 'math-prime',
    category: 'Maths',
    question: 'Which of these is a prime number?',
    answer: '17',
    decoys: ['21', '27', '15'],
    difficulty: 2,
  },
];
