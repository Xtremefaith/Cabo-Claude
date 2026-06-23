import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useMyPlayerId } from '../../store/useStore';
import { addResult, getPlayer } from '../../store/storage';
import { uid } from '../../lib/util';

const MAX_LEN = 160;

export function AddQuoteScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const myPlayerId = useMyPlayerId();
  const me = getPlayer(myPlayerId ?? '');

  const [text, setText] = useState('');
  const [saidBy, setSaidBy] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  if (!me) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-2xl font-extrabold">Set up your player first</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  const canSave = text.trim().length > 0 && saidBy !== null;

  const save = () => {
    if (!canSave) return;
    addResult({
      id: uid(),
      gameId: 'guess-who-said-it',
      playerId: me.id,
      playedAt: Date.now(),
      data: { mode: 'insiders-quote', saidByPlayerId: saidBy!, text: text.trim() },
    });
    setSavedCount((n) => n + 1);
    setText('');
    setSaidBy(null);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  };

  return (
    <Screen>
      <BackButton onClick={() => navigate('/play/guess-who-said-it/insiders')} />
      <div className="mb-4">
        <h1 className="font-display text-3xl font-extrabold">Add a quote</h1>
        <p className="font-body text-sm text-white/50">
          Something a crew member actually said. They won't see who added it.
        </p>
      </div>

      <label className="mb-2 block font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
        The quote
      </label>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
        placeholder="“I'm pretty sure that's not how tequila works…”"
        rows={3}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-display text-lg font-extrabold text-white placeholder:text-white/25 focus:border-hot focus:outline-none"
      />
      <p className="mt-1 text-right font-body text-xs font-bold text-white/30">
        {text.length}/{MAX_LEN}
      </p>

      <p className="mb-3 mt-5 font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
        Who said it?
      </p>
      <div className="grid grid-cols-3 gap-3 overflow-y-auto pb-2">
        {players.map((p) => {
          const selected = saidBy === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSaidBy(p.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl p-2 transition active:scale-95 ${
                selected ? 'bg-hot/20 ring-2 ring-hot' : 'bg-white/5'
              }`}
            >
              <PlayerAvatar player={p} size={64} />
              <span className="w-full truncate text-center font-display text-sm font-extrabold">
                {p.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      <AnimatePresence>
        {justSaved && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pb-2 text-center font-display text-sm font-extrabold text-emerald-300"
          >
            Saved! Added {savedCount} {savedCount === 1 ? 'quote' : 'quotes'} this session.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-2 flex flex-col gap-2">
        <Button disabled={!canSave} onClick={save}>
          Save quote
        </Button>
        <Button variant="ghost" onClick={() => navigate('/play/guess-who-said-it/insiders')}>
          {savedCount ? 'Done' : 'Cancel'}
        </Button>
      </div>
    </Screen>
  );
}
