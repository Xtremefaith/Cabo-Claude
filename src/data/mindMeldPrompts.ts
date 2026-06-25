// Built-in prompt deck for Mind Meld — the collaborative "say the same thing"
// game. Each prompt asks the crew to blurt a short answer; you win together by
// matching each other. `spice` is a 1–5 rating; a game only draws prompts at or
// below the group's chosen spice (see data/spice.ts and the group settings).
//
// Good prompts have an obvious-but-not-only answer: enough of a "default" that
// the crew can converge, enough room that the lone wolves are funny. Keep them
// short — one or two words is the ideal answer.

export interface MindMeldPrompt {
  id: string;
  /** Shown verbatim; phrase as an instruction ("Name a…"). */
  text: string;
  spice: number; // 1 (wholesome) … 5 (unhinged)
}

export const MIND_MELD_PROMPTS: MindMeldPrompt[] = [
  // --- 1: squeaky clean ---
  { id: 'fruit', text: 'Name a fruit', spice: 1 },
  { id: 'beach-bag', text: "Name something you'd find in a beach bag", spice: 1 },
  { id: 'pizza-topping', text: 'Name a pizza topping', spice: 1 },
  { id: 'ice-cream', text: 'Name an ice cream flavor', spice: 1 },
  { id: 'board-game', text: 'Name a board game', spice: 1 },
  { id: 'superhero', text: 'Name a superhero', spice: 1 },
  { id: 'zoo-animal', text: 'Name an animal at the zoo', spice: 1 },
  { id: 'breakfast', text: 'Name a breakfast food', spice: 1 },
  { id: 'color', text: 'Name a color', spice: 1 },
  { id: 'road-trip-snack', text: 'Name the ultimate road-trip snack', spice: 1 },
  { id: 'disney', text: 'Name a Disney movie', spice: 1 },
  { id: 'pet', text: 'Name a kind of pet', spice: 1 },

  // --- 2: playful ---
  { id: 'cabo-pack', text: "Name something you're packing for Cabo", spice: 2 },
  { id: 'karaoke', text: 'Name a go-to karaoke song', spice: 2 },
  { id: 'guilty-tv', text: 'Name a guilty-pleasure TV show', spice: 2 },
  { id: 'first-round', text: "Name the first drink you'd order on the trip", spice: 2 },
  { id: 'hangover-cure', text: 'Name the best hangover cure', spice: 2 },
  { id: 'celeb-crush', text: 'Name a celebrity everyone secretly has a crush on', spice: 2 },
  { id: 'app-open', text: 'Name the app you open first every morning', spice: 2 },
  { id: 'dance-floor', text: 'Name the song that gets you on the dance floor', spice: 2 },
  { id: 'late-night-food', text: 'Name the best 2am food', spice: 2 },
  { id: 'tourist-trap', text: 'Name a classic tourist-trap activity', spice: 2 },

  // --- 3: a little spicy ---
  { id: 'overrated', text: 'Name something everyone loves that is actually overrated', spice: 3 },
  { id: 'icks', text: 'Name a dating ick', spice: 3 },
  { id: 'bad-tattoo', text: 'Name a tattoo someone would regret on this trip', spice: 3 },
  { id: 'crew-late', text: 'Name the crew member most likely to be late', spice: 3 },
  { id: 'red-flag', text: 'Name a relationship red flag', spice: 3 },
  { id: 'lie', text: 'Name a little white lie everyone tells', spice: 3 },
  { id: 'split-bill', text: 'Name who always "forgets" their wallet', spice: 3 },

  // --- 4: bring the heat ---
  { id: 'first-drunk', text: 'Name who gets drunk first tonight', spice: 4 },
  { id: 'texts-ex', text: 'Name who is most likely to text their ex on the trip', spice: 4 },
  { id: 'worst-secret', text: "Name the crew member worst at keeping a secret", spice: 4 },
  { id: 'jail', text: 'Name who would get the whole group arrested', spice: 4 },
  { id: 'shameless', text: 'Name the most shameless person in the crew', spice: 4 },

  // --- 5: unhinged ---
  { id: 'one-night', text: 'Name who has the wildest one-night-stand story', spice: 5 },
  { id: 'group-chat-leak', text: "Name whose DMs would end friendships if leaked", spice: 5 },
  { id: 'finish-trip-single', text: 'Name who will NOT make it home single', spice: 5 },
  { id: 'cabo-fling', text: 'Name who is hooking up first on this trip', spice: 5 },
];
