// Built-in prompt deck for Most Likely To. Each completes "Most likely to …".
// `spice` is a 1–5 rating; a game only draws prompts at or below the group's
// chosen spice level (see data/spice.ts and the group settings).

export interface MostLikelyPrompt {
  id: string;
  text: string;
  spice: number; // 1 (wholesome) … 5 (unhinged)
}

export const MOST_LIKELY_PROMPTS: MostLikelyPrompt[] = [
  // --- 1: squeaky clean ---
  { id: 'famous', text: 'become famous', spice: 1 },
  { id: 'millionaire', text: 'become a millionaire', spice: 1 },
  { id: 'zombie', text: 'survive a zombie apocalypse', spice: 1 },
  { id: 'ten-pets', text: 'adopt ten pets', spice: 1 },
  { id: 'lost-gps', text: 'get lost with the GPS on', spice: 1 },
  { id: 'olympics', text: 'win an Olympic medal', spice: 1 },
  { id: 'president', text: 'become president', spice: 1 },
  { id: 'cancel-plans', text: 'cancel plans to stay in bed', spice: 1 },
  { id: 'overpack', text: 'overpack for a weekend trip', spice: 1 },
  { id: 'cry-movie', text: 'cry at a movie', spice: 1 },
  { id: 'forget-birthday', text: 'forget their own birthday', spice: 1 },
  // --- 2: playful ---
  { id: 'late-wedding', text: 'show up late to their own wedding', spice: 2 },
  { id: 'viral', text: 'go viral by accident', spice: 2 },
  { id: 'reality-tv', text: 'end up on a reality TV show', spice: 2 },
  { id: 'podcast', text: 'start a podcast nobody asked for', spice: 2 },
  { id: 'ghost-chat', text: 'ghost the group chat for a week', spice: 2 },
  { id: 'last-slice', text: 'eat the last slice without asking', spice: 2 },
  { id: 'argue-online', text: 'start an argument in the comments', spice: 2 },
  // --- 3: a little spicy ---
  { id: 'table-dance', text: 'end up dancing on a table', spice: 3 },
  { id: 'flirt-ticket', text: 'flirt their way out of a ticket', spice: 3 },
  { id: 'regret-tattoo', text: 'get a tattoo they regret', spice: 3 },
  { id: 'close-bar', text: 'close down the bar every time', spice: 3 },
  { id: 'lie-age', text: 'lie about their age on a night out', spice: 3 },
  { id: 'lose-phone', text: 'lose their phone on a night out', spice: 3 },
  // --- 4: bring the heat ---
  { id: 'kicked-out', text: 'get kicked out of the bar', spice: 4 },
  { id: 'text-ex', text: 'text their ex at 2am', spice: 4 },
  { id: 'secret-dating', text: 'have a secret dating profile', spice: 4 },
  { id: 'skinny-dip', text: 'skinny dip on vacation', spice: 4 },
  { id: 'risky-text', text: 'send a risky text to the wrong person', spice: 4 },
  // --- 5: unhinged ---
  { id: 'vacation-fling', text: 'have a vacation fling', spice: 5 },
  { id: 'wake-up-random', text: 'wake up somewhere random after a night out', spice: 5 },
  { id: 'streak-resort', text: 'streak across the resort on a dare', spice: 5 },
];
