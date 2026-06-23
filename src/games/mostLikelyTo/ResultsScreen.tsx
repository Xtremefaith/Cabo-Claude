import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BackButton, Button, Screen } from '../../components/ui';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { usePlayers, useResults, useMyPlayerId, useGroup } from '../../store/useStore';
import { addResult, getPlayer } from '../../store/storage';
import { MOST_LIKELY_PROMPTS } from '../../data/mostLikelyPrompts';
import { DEFAULT_SPICE } from '../../data/spice';
import { uid } from '../../lib/util';
import { buildMostLikelyReveal, myMostLikelyVotes } from './stats';

export function MostLikelyResultsScreen() {
  const navigate = useNavigate();
  const players = usePlayers();
  const results = useResults();
  const myPlayerId = useMyPlayerId();
  const group = useGroup();
  const me = getPlayer(myPlayerId ?? '');

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const rows = useMemo(() => buildMostLikelyReveal(results), [results]);
  const myVotes = useMemo(
    () => myMostLikelyVotes(results, myPlayerId ?? ''),
    [results, myPlayerId],
  );

  const maxSpice = group?.settings?.spice ?? DEFAULT_SPICE;
  // Prompts you can still vote on: eligible by spice and not yet answered by you.
  const toVote = useMemo(
    () => MOST_LIKELY_PROMPTS.filter((p) => p.spice <= maxSpice && !myVotes.has(p.id)),
    [maxSpice, myVotes],
  );

  const castVote = (promptId: string, promptText: string, targetPlayerId: string) => {
    if (!me) return;
    addResult({
      id: uid(),
      gameId: 'most-likely-to',
      playerId: me.id,
      playedAt: Date.now(),
      data: { votes: [{ promptId, promptText, targetPlayerId }] },
    });
  };

  const canVote = me && players.length >= 2;

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-1 font-display text-3xl font-extrabold">Most Likely To 🏆</h1>
      <p className="mb-4 font-body text-sm text-white/50">
        Crowns reflect the whole group — vote on any you missed.
      </p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
        {/* Prompts you can still weigh in on */}
        {canVote && toVote.length > 0 && (
          <>
            <p className="font-display text-sm font-extrabold uppercase tracking-widest text-sun">
              Your turn — tap to vote
            </p>
            {toVote.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-4">
                <p className="font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
                  Most likely to
                </p>
                <p className="mb-3 font-display text-lg font-extrabold leading-tight">{p.text}</p>
                <div className="flex flex-wrap gap-2">
                  {players.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => castVote(p.id, p.text, m.id)}
                      className="flex w-16 flex-col items-center gap-1 active:scale-95"
                    >
                      <PlayerAvatar player={m} size={48} />
                      <span className="w-full truncate text-center font-body text-xs font-bold text-white/60">
                        {m.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="my-1 h-px bg-white/10" />
          </>
        )}

        {rows.length === 0 && toVote.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="text-5xl">🏆</div>
            <p className="font-display text-2xl font-extrabold">No votes yet</p>
            <Button onClick={() => navigate('/live/most-likely-to')}>Play Most Likely To</Button>
          </div>
        )}

        {/* The crowns */}
        {rows.map((row, i) => {
          const myPick = myVotes.get(row.promptId);
          return (
            <motion.div
              key={row.promptId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="glass rounded-2xl p-4"
            >
              <p className="font-body text-xs font-extrabold uppercase tracking-widest text-white/45">
                Most likely to
              </p>
              <p className="mb-3 font-display text-lg font-extrabold leading-tight">
                {row.promptText}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {row.winnerIds.map((id) => {
                  const p = byId.get(id);
                  if (!p) return null;
                  return (
                    <div key={id} className="flex items-center gap-2 rounded-2xl bg-hot/15 px-3 py-2">
                      <PlayerAvatar player={p} size={40} />
                      <div>
                        <p className="font-display text-base font-extrabold leading-tight">
                          {p.name}
                        </p>
                        <p className="font-body text-xs font-bold text-hot-glow">
                          {row.topCount} {row.topCount === 1 ? 'vote' : 'votes'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {row.ballots.map(({ voterId, targetId }) => {
                  const voter = byId.get(voterId);
                  const target = byId.get(targetId);
                  if (!voter || !target) return null;
                  return (
                    <div
                      key={voterId}
                      className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1"
                      title={`${voter.name} → ${target.name}`}
                    >
                      <PlayerAvatar player={voter} size={22} />
                      <span className="text-white/40">→</span>
                      <PlayerAvatar player={target} size={22} />
                    </div>
                  );
                })}
              </div>

              {myPick && (
                <p className="mt-2 font-body text-xs font-bold text-white/40">
                  You picked {byId.get(myPick)?.name ?? '—'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={() => navigate('/live/most-likely-to')}>Vote again</Button>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Cabo
        </Button>
      </div>
    </Screen>
  );
}
