// React bindings over the live-session store (mirrors store/useStore.ts).

import { useSyncExternalStore } from 'react';
import { getAnswers, getLiveSession, getRoster, subscribeLive } from './liveStore';
import type { LiveSession, SessionAnswer, SessionPlayer } from './types';

export function useLiveSession(): LiveSession | null {
  return useSyncExternalStore(subscribeLive, getLiveSession, getLiveSession);
}

export function useSessionRoster(): SessionPlayer[] {
  return useSyncExternalStore(subscribeLive, getRoster, getRoster);
}

export function useSessionAnswers(): SessionAnswer[] {
  return useSyncExternalStore(subscribeLive, getAnswers, getAnswers);
}
