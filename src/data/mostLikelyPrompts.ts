// Built-in prompt deck for Most Likely To. Each completes "Most likely to …".
// `spice` is tagged for a future filter; the game currently shuffles all of
// them together (mix of party-safe and cheeky).

export interface MostLikelyPrompt {
  id: string;
  text: string;
  spice: 'mild' | 'spicy';
}

export const MOST_LIKELY_PROMPTS: MostLikelyPrompt[] = [
  // --- party-safe ---
  { id: 'famous', text: 'become famous', spice: 'mild' },
  { id: 'millionaire', text: 'become a millionaire', spice: 'mild' },
  { id: 'zombie', text: 'survive a zombie apocalypse', spice: 'mild' },
  { id: 'cry-movie', text: 'cry at a movie', spice: 'mild' },
  { id: 'late-wedding', text: 'show up late to their own wedding', spice: 'mild' },
  { id: 'ten-pets', text: 'adopt ten pets', spice: 'mild' },
  { id: 'viral', text: 'go viral by accident', spice: 'mild' },
  { id: 'reality-tv', text: 'end up on a reality TV show', spice: 'mild' },
  { id: 'lost-gps', text: 'get lost with the GPS on', spice: 'mild' },
  { id: 'podcast', text: 'start a podcast nobody asked for', spice: 'mild' },
  { id: 'olympics', text: 'win an Olympic medal', spice: 'mild' },
  { id: 'ghost-chat', text: 'ghost the group chat for a week', spice: 'mild' },
  { id: 'president', text: 'become president', spice: 'mild' },
  { id: 'last-slice', text: 'eat the last slice without asking', spice: 'mild' },
  { id: 'cancel-plans', text: 'cancel plans to stay in bed', spice: 'mild' },
  { id: 'overpack', text: 'overpack for a weekend trip', spice: 'mild' },
  // --- cheeky / after-dark ---
  { id: 'kicked-out', text: 'get kicked out of the bar', spice: 'spicy' },
  { id: 'text-ex', text: 'text their ex at 2am', spice: 'spicy' },
  { id: 'secret-dating', text: 'have a secret dating profile', spice: 'spicy' },
  { id: 'table-dance', text: 'end up dancing on a table', spice: 'spicy' },
  { id: 'flirt-ticket', text: 'flirt their way out of a ticket', spice: 'spicy' },
  { id: 'skinny-dip', text: 'skinny dip on vacation', spice: 'spicy' },
  { id: 'vacation-fling', text: 'have a vacation fling', spice: 'spicy' },
  { id: 'regret-tattoo', text: 'get a tattoo they regret', spice: 'spicy' },
  { id: 'risky-text', text: 'send a risky text to the wrong person', spice: 'spicy' },
  { id: 'close-bar', text: 'close down the bar every time', spice: 'spicy' },
  { id: 'lie-age', text: 'lie about their age on a night out', spice: 'spicy' },
  { id: 'lose-phone', text: 'lose their phone on a night out', spice: 'spicy' },
];
