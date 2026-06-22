// React bindings over the localStorage store using useSyncExternalStore so any
// screen that reads players/results stays in sync after mutations.

import { useSyncExternalStore } from 'react';
import { getPlayers, getResults, subscribe } from './storage';
import type { GameResult, Player } from '../types';

export function usePlayers(): Player[] {
  return useSyncExternalStore(subscribe, getPlayers, getPlayers);
}

export function useResults(): GameResult[] {
  return useSyncExternalStore(subscribe, getResults, getResults);
}
