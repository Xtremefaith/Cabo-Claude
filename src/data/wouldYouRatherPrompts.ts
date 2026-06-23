// Built-in dilemma deck for Would You Rather. Each prompt is an either/or:
// "Would you rather <optionA> … or <optionB>?". `spice` is a 1–5 rating; a game
// only draws prompts at or below the group's chosen spice level (see
// data/spice.ts and the group settings), exactly like Most Likely To.

export interface WouldYouRatherPrompt {
  id: string;
  optionA: string;
  optionB: string;
  spice: number; // 1 (wholesome) … 5 (unhinged)
}

export const WOULD_YOU_RATHER_PROMPTS: WouldYouRatherPrompt[] = [
  // --- 1: squeaky clean ---
  { id: 'fly-invisible', optionA: 'be able to fly', optionB: 'be invisible', spice: 1 },
  { id: 'beach-mountains', optionA: 'live by the beach', optionB: 'live in the mountains', spice: 1 },
  { id: 'tacos-margs', optionA: 'have unlimited tacos for life', optionB: 'have unlimited margaritas for life', spice: 1 },
  { id: 'chef-masseuse', optionA: 'have a personal chef', optionB: 'have a personal masseuse', spice: 1 },
  { id: 'upgrades-nobags', optionA: 'always get free flight upgrades', optionB: 'never check a bag again', spice: 1 },
  { id: 'read-minds-future', optionA: 'read minds', optionB: 'see the future', spice: 1 },
  { id: 'early-late', optionA: 'always be ten minutes early', optionB: 'always be ten minutes late', spice: 1 },
  // --- 2: playful ---
  { id: 'history-camera', optionA: 'make your search history public', optionB: 'make your camera roll public', spice: 2 },
  { id: 'whisper-shout', optionA: 'only be able to whisper', optionB: 'only be able to shout', spice: 2 },
  { id: 'sing-dance', optionA: 'have to sing instead of talk', optionB: 'have to dance instead of walk', spice: 2 },
  { id: 'tiktok-rich', optionA: 'be TikTok famous', optionB: 'be rich but totally anonymous', spice: 2 },
  { id: 'nophone-nocoffee', optionA: 'give up your phone for a week', optionB: 'give up coffee for a month', spice: 2 },
  { id: 'planner-driver', optionA: 'be the one who plans every trip', optionB: 'be the designated driver every night', spice: 2 },
  // --- 3: a little spicy ---
  { id: 'hungover-nobuzz', optionA: 'always be slightly hungover', optionB: 'never feel a buzz again', spice: 3 },
  { id: 'ex-neighbor-friend', optionA: 'have your ex move in next door', optionB: 'have your ex date your best friend', spice: 3 },
  { id: 'flirt-drink-dance', optionA: 'flirt with a stranger for a free drink', optionB: 'dance on the bar for one', spice: 3 },
  { id: 'boss-text-party', optionA: 'send a typo-ridden text to your boss', optionB: 'get a little too tipsy at the work party', spice: 3 },
  { id: 'redate-rekiss', optionA: 'redo a date with your worst date', optionB: 'redo a kiss with your worst kiss', spice: 3 },
  { id: 'profile-mom-coworkers', optionA: 'have your dating profile seen by your mom', optionB: 'have it seen by your coworkers', spice: 3 },
  // --- 4: bring the heat ---
  { id: 'text-ex-call-boss', optionA: 'drunk-text your ex at 2am', optionB: 'drunk-call your boss at 2am', spice: 4 },
  { id: 'dream-friend', optionA: 'have a steamy dream about a friend', optionB: 'find out a friend had one about you', spice: 4 },
  { id: 'skinnydip-lapdance', optionA: 'skinny dip with the group', optionB: 'give someone a lap dance on a dare', spice: 4 },
  { id: 'risky-text-history', optionA: 'have your last risky text read aloud', optionB: 'have your search history shown at dinner', spice: 4 },
  { id: 'ex-once-dryspell', optionA: 'hook up with an ex one more time', optionB: 'go a full year with nobody', spice: 4 },
  { id: 'bottle-streak', optionA: 'make out with someone in the group', optionB: 'streak down the hallway', spice: 4 },
  // --- 5: unhinged ---
  { id: 'fling-stranger-group', optionA: 'have a vacation fling with a stranger', optionB: 'have one with someone in the group', spice: 5 },
  { id: 'striptease-midnight-dip', optionA: 'give the group a striptease', optionB: 'skinny dip with everyone at midnight', spice: 5 },
  { id: 'bodycount-location', optionA: 'reveal your body count out loud', optionB: 'reveal your wildest hookup spot', spice: 5 },
  { id: 'nude-wrong-resurface', optionA: 'send a nude to the wrong person', optionB: 'have an old one resurface', spice: 5 },
  { id: 'caught-parents-boss', optionA: 'get caught hooking up by your parents', optionB: 'get caught by your boss', spice: 5 },
];
