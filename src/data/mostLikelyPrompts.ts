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

  // ===== expanded deck =====
  // --- 1: squeaky clean ---
  { id: 'start-business', text: 'start their own business', spice: 1 },
  { id: 'write-book', text: 'write a book one day', spice: 1 },
  { id: 'adopt-stray', text: 'adopt a stray animal on the trip', spice: 1 },
  { id: 'run-marathon', text: 'run a marathon', spice: 1 },
  { id: 'learn-language', text: 'learn a new language fluently', spice: 1 },
  { id: 'move-abroad', text: 'move to another country', spice: 1 },
  { id: 'plan-trip', text: 'plan the whole group trip', spice: 1 },
  { id: 'early-gym', text: 'wake up early to hit the gym', spice: 1 },
  { id: 'big-family', text: 'have a big family', spice: 1 },
  { id: 'survive-wild', text: 'survive a week in the wilderness', spice: 1 },
  // --- 2: playful ---
  { id: 'karaoke-mic', text: 'hog the karaoke mic', spice: 2 },
  { id: 'cry-wedding', text: "cry at a stranger's wedding", spice: 2 },
  { id: 'lock-out', text: 'lock themselves out of the room', spice: 2 },
  { id: 'befriend-stranger', text: 'make friends with a total stranger', spice: 2 },
  { id: 'worst-dancer', text: 'be the worst dancer in the room', spice: 2 },
  { id: 'group-photog', text: 'be the one taking all the photos', spice: 2 },
  { id: 'always-late', text: 'always be the last to arrive', spice: 2 },
  { id: 'food-pics', text: 'photograph their food before eating', spice: 2 },
  { id: 'spoil-show', text: 'spoil the show for everyone', spice: 2 },
  { id: 'lose-bet', text: 'lose a bet and have to pay up', spice: 2 },
  // --- 3: a little spicy ---
  { id: 'sing-public', text: 'get caught singing loudly in public', spice: 3 },
  { id: 'cry-karaoke', text: 'cry during karaoke', spice: 3 },
  { id: 'last-dancefloor', text: 'be the last one on the dance floor', spice: 3 },
  { id: 'order-shots', text: 'order another round of shots', spice: 3 },
  { id: 'know-bartender', text: 'be on a first-name basis with the bartender', spice: 3 },
  { id: 'drunk-typos', text: 'send texts full of typos after a few drinks', spice: 3 },
  { id: 'conga-line', text: 'start a conga line', spice: 3 },
  { id: 'karaoke-duet', text: 'drag someone into a karaoke duet', spice: 3 },
  // --- 4: bring the heat ---
  { id: 'crash-party', text: "crash a party they weren't invited to", spice: 4 },
  { id: 'double-date', text: 'go on two dates in one day', spice: 4 },
  { id: 'fake-name', text: 'give a fake name to a stranger', spice: 4 },
  { id: 'pool-clothed', text: 'jump in the pool fully clothed', spice: 4 },
  { id: 'lose-shoes', text: 'lose their shoes by the end of the night', spice: 4 },
  // --- 5: unhinged ---
  { id: 'trip-hookup', text: 'hook up with someone on the trip', spice: 5 },
  { id: 'miss-flight', text: 'miss the flight home', spice: 5 },
  { id: 'stranger-number', text: "go home with a stranger's number", spice: 5 },
];
