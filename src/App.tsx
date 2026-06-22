import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { PlayerPickScreen } from './screens/PlayerPickScreen';
import { CategoryPickScreen } from './screens/CategoryPickScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RevealScreen } from './screens/RevealScreen';
import { GroupGate } from './screens/GroupGate';
import { HotOrNotScreen } from './games/hotOrNot/HotOrNotScreen';
import { Screen } from './components/ui';
import { isCloud } from './store/storage';
import { useGroup, useReady } from './store/useStore';

export default function App() {
  const ready = useReady();
  const group = useGroup();

  // Cloud mode: wait for startup, then require a group before the arcade.
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

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play/:gameId" element={<PlayerPickScreen />} />
        <Route path="/play/:gameId/category/:playerId" element={<CategoryPickScreen />} />
        <Route path="/play/:gameId/run/:playerId/:category" element={<HotOrNotScreen />} />
        <Route path="/players/:playerId" element={<ProfileScreen />} />
        <Route path="/reveal" element={<RevealScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
