// Topic list for Cancún vs Cabo — the group's head-to-head trip survey. Each
// topic is one head-to-head category the crew votes on (which destination did
// it better). The two contestants are NOT fixed here — they're set per room at
// start (default "Cancún" vs "Cabo"), so this list is just the measurable
// categories. A session plays every topic in order; it's a survey, not a
// random deck, so we measure everything.

export interface CancunVsCaboTopic {
  id: string;
  /** The category being compared, shown as the round's title. */
  label: string;
  emoji: string;
}

export const CANCUN_VS_CABO_TOPICS: CancunVsCaboTopic[] = [
  { id: 'weather', label: 'Weather', emoji: '☀️' },
  { id: 'atmosphere', label: 'Atmosphere', emoji: '✨' },
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'accommodations', label: 'Accommodations', emoji: '🛏️' },
  { id: 'pool', label: 'Pool', emoji: '🏊' },
  { id: 'mexican-restaurant', label: 'Mexican Restaurant', emoji: '🌮' },
  { id: 'italian-restaurant', label: 'Italian Restaurant', emoji: '🍝' },
  { id: 'drink-quality', label: 'Drink Quality', emoji: '🍹' },
  { id: 'food-overall', label: 'Food (Overall)', emoji: '🍽️' },
  { id: 'customer-service', label: 'Customer Service', emoji: '🛎️' },
  { id: 'staff-friendliness', label: 'Staff Friendliness', emoji: '😊' },
  { id: 'nightlife', label: 'Nightlife', emoji: '🌙' },
  { id: 'excursions', label: 'Excursions & Activities', emoji: '🤿' },
  { id: 'views', label: 'Views & Scenery', emoji: '🌅' },
  { id: 'sunsets', label: 'Sunsets', emoji: '🌇' },
  { id: 'cleanliness', label: 'Cleanliness', emoji: '🧼' },
  { id: 'travel', label: 'Travel & Getting There', emoji: '✈️' },
  { id: 'cost', label: 'Cost', emoji: '💸' },
  { id: 'value', label: 'Value for Money', emoji: '⚖️' },
  { id: 'crew-fun', label: 'Crew Fun & Memories', emoji: '🎉' },
];
