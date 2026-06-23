import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { PlayerPickScreen } from './screens/PlayerPickScreen';
import { CategoryPickScreen } from './screens/CategoryPickScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RevealScreen } from './screens/RevealScreen';
import { GroupGate } from './screens/GroupGate';
import { PlayerSetupScreen } from './screens/PlayerSetupScreen';
import { ManageGroupScreen } from './screens/ManageGroupScreen';
import { HotOrNotScreen } from './games/hotOrNot/HotOrNotScreen';
import { MostLikelyScreen } from './games/mostLikelyTo/MostLikelyScreen';
import { MostLikelyResultsScreen } from './games/mostLikelyTo/ResultsScreen';
import { GuessWhoModeScreen } from './games/guessWhoSaidIt/ModeSelectScreen';
import { GuessWhoScreen } from './games/guessWhoSaidIt/GuessWhoScreen';
import { GuessWhoResultsScreen } from './games/guessWhoSaidIt/ResultsScreen';
import { InsidersHubScreen } from './games/guessWhoSaidIt/InsidersHubScreen';
import { AddQuoteScreen } from './games/guessWhoSaidIt/AddQuoteScreen';
import { InsidersGuessScreen } from './games/guessWhoSaidIt/InsidersGuessScreen';
import { InsidersResultsScreen } from './games/guessWhoSaidIt/InsidersResultsScreen';
import { LiveGuessWhoScreen } from './live/LiveGuessWhoScreen';
import { WouldYouRatherScreen } from './games/wouldYouRather/WouldYouRatherScreen';
import { WouldYouRatherResultsScreen } from './games/wouldYouRather/ResultsScreen';
import { Screen } from './components/ui';
import { isCloud } from './store/storage';
import { useGroup, useMyPlayerId, useReady } from './store/useStore';

export default function App() {
  const ready = useReady();
  const group = useGroup();
  const myPlayerId = useMyPlayerId();

  // Cloud mode: wait for startup → require a group → set up your own player.
  if (isCloud() && !ready) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-float text-5xl">🃏</div>
        </div>
      </Screen>
    );
  }
  if (isCloud() && !group) {
    return <GroupGate />;
  }
  if (isCloud() && group && !myPlayerId) {
    return <PlayerSetupScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play/:gameId" element={<PlayerPickScreen />} />
        <Route path="/play/:gameId/category/:playerId" element={<CategoryPickScreen />} />
        <Route path="/play/:gameId/run/:playerId/:category" element={<HotOrNotScreen />} />
        <Route path="/play/most-likely-to/run" element={<MostLikelyScreen />} />
        <Route path="/play/most-likely-to/results" element={<MostLikelyResultsScreen />} />
        <Route path="/play/guess-who-said-it" element={<GuessWhoModeScreen />} />
        <Route path="/live/guess-who-said-it" element={<LiveGuessWhoScreen />} />
        <Route path="/play/guess-who-said-it/run" element={<GuessWhoScreen />} />
        <Route path="/play/guess-who-said-it/results" element={<GuessWhoResultsScreen />} />
        <Route path="/play/guess-who-said-it/insiders" element={<InsidersHubScreen />} />
        <Route path="/play/guess-who-said-it/insiders/add" element={<AddQuoteScreen />} />
        <Route path="/play/guess-who-said-it/insiders/play" element={<InsidersGuessScreen />} />
        <Route path="/play/guess-who-said-it/insiders/results" element={<InsidersResultsScreen />} />
        <Route path="/play/would-you-rather/run" element={<WouldYouRatherScreen />} />
        <Route path="/play/would-you-rather/results" element={<WouldYouRatherResultsScreen />} />
        <Route path="/manage" element={<ManageGroupScreen />} />
        <Route path="/players/:playerId" element={<ProfileScreen />} />
        <Route path="/reveal" element={<RevealScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
