import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { PlayerPickScreen } from './screens/PlayerPickScreen';
import { CategoryPickScreen } from './screens/CategoryPickScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RevealScreen } from './screens/RevealScreen';
import { HotOrNotScreen } from './games/hotOrNot/HotOrNotScreen';

export default function App() {
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
