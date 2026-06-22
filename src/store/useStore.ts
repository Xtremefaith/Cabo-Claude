// React bindings over the localStorage store using useSyncExternalStore so any
// screen that reads players/results stays in sync after mutations.

import { useSyncExternalStore } from 'react';
import { getGroup, getMyPlayerId, getPlayers, getResults, isReady, subscribe } from './storage';
import type { GameResult, Player } from '../types';

export function usePlayers(): Player[] {
  return useSyncExternalStore(subscribe, getPlayers, getPlayers);
}

export function useResults(): GameResult[] {
  return useSyncExternalStore(subscribe, getResults, getResults);
}

export function useGroup() {
  return useSyncExternalStore(subscribe, getGroup, getGroup);
}

export function useReady(): boolean {
  return useSyncExternalStore(subscribe, isReady, isReady);
}

export function useMyPlayerId(): string | null {
  return useSyncExternalStore(subscribe, getMyPlayerId, getMyPlayerId);
}
