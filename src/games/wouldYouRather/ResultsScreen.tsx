import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useResults, useMyPlayerId, useGroup } from '../../store/useStore';
import { addResult, getPlayer } from '../../store/storage';
import { WOULD_YOU_RATHER_PROMPTS } from '../../data/wouldYouRatherPrompts';
import { DEFAULT_SPICE } from '../../data/spice';
import { uid } from '../../lib/util';
import { buildWouldYouRatherReveal, myWouldYouRatherChoices } from './stats';

export function WouldYouRatherResultsScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const myPlayerId = useMyPlayerId();
  const group = useGroup();
  const me = getPlayer(myPlayerId ?? '');

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const rows = useMemo(() => buildWouldYouRatherReveal(results), [results]);
  const myChoices = useMemo(
    () => myWouldYouRatherChoices(results, myPlayerId ?? ''),
    [results, myPlayerId],
  );

  const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
  // Dilemmas you can still answer: eligible by spice and not yet answered by you.
  const toAnswer = useMemo(
    () => WOULD_YOU_RATHER_PROMPTS.filter((p) => p.spice <= maxSpice && !myChoices.has(p.id)),
    [maxSpice, myChoices],
  );

  const castChoice = (
    promptId: string,
    optionA: string,
    optionB: string,
    choice: 'a' | 'b',
  ) => {
    if (!me) return;
    addResult({
      id: uid(),
      gameId: 'would-you-rather',
      playerId: me.id,
      playedAt: Date.now(),
      data: { choices: [{ promptId, optionA, optionB, choice }] },
    });
  };

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Would You Rather 🤔</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        See how the group split — answer any you missed.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {/* Dilemmas you can still weigh in on */}
        {me && toAnswer.length > 0 && (
          <>
            <p className="font-display text-sm font-extrabold uppercase tracking-widest text-sun">
              Your turn — tap to choose
            </p>
            {toAnswer.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4">
                <p className="mb-3 font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
                  Would you rather…
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => castChoice(p.id, p.optionA, p.optionB, 'a')}
                    className="rounded-2xl bg-hot/15 p-3 text-left font-display text-sm font-extrabold leading-tight active:scale-95"
                  >
                    {p.optionA}
                  </button>
                  <button
                    onClick={() => castChoice(p.id, p.optionA, p.optionB, 'b')}
                    className="rounded-2xl bg-not/15 p-3 text-left font-display text-sm font-extrabold leading-tight active:scale-95"
                  >
                    {p.optionB}
                  </button>
                </div>
              </div>
            ))}
            <div className="my-1 h-px bg-white/10" />
          </>
        )}

        {rows.length === 0 && toAnswer.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="text-5xl">🤔</div>
            <p className="font-display text-2xl font-extrabold">No answers yet</p>
            <Button onClick={() => navigate('/play/would-you-rather/run')}>
              Play Would You Rather
            </Button>
          </div>
        )}

        {/* The splits */}
        {rows.map((row, i) => {
          const myPick = myChoices.get(row.promptId);
          const total = row.totalVotes || 1;
          const pctA = Math.round((row.countA / total) * 100);
          const pctB = 100 - pctA;
          const aVoters = row.ballots.filter((b) => b.choice === 'a');
          const bVoters = row.ballots.filter((b) => b.choice === 'b');
          return (
            <motion.div
              key={row.promptId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="glass rounded-2xl p-4"
            >
              {/* labels */}
              <div className="mb-2 flex items-start justify-between gap-3">
                <p className={`font-display text-sm font-extrabold leading-tight ${myPick === 'a' ? 'text-hot' : 'text-white'}`}>
                  {row.optionA}
                </p>
                <p className={`text-right font-display text-sm font-extrabold leading-tight ${myPick === 'b' ? 'text-not' : 'text-white'}`}>
                  {row.optionB}
                </p>
              </div>

              {/* split bar */}
              <div className="flex h-7 w-full overflow-hidden rounded-full bg-white/5">
                {row.countA > 0 && (
                  <div
                    className="flex items-center justify-start bg-hot/70 px-2 font-display text-xs font-extrabold text-night-900"
                    style={{ width: `${pctA}%` }}
                  >
                    {pctA}%
                  </div>
                )}
                {row.countB > 0 && (
                  <div
                    className="ml-auto flex items-center justify-end bg-not/70 px-2 font-display text-xs font-extrabold text-night-900"
                    style={{ width: `${pctB}%` }}
                  >
                    {pctB}%
                  </div>
                )}
              </div>

              {/* who picked what */}
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="flex flex-wrap gap-1">
                  {aVoters.map(({ voterId }) => {
                    const v = byId.get(voterId);
                    return v ? <PlayerAvatar key={voterId} player={v} size={22} /> : null;
                  })}
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {bVoters.map(({ voterId }) => {
                    const v = byId.get(voterId);
                    return v ? <PlayerAvatar key={voterId} player={v} size={22} /> : null;
                  })}
                </div>
              </div>

              {myPick && (
                <p className="mt-2 font-body text-xs font-bold text-white/40">
                  You picked {myPick === 'a' ? row.optionA : row.optionB}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={() => navigate('/play/would-you-rather/run')}>Play again</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Cabo
        </Button>
      </div>
    </Screen>
  );
}
