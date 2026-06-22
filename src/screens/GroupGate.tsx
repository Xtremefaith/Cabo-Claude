import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Logo, Screen } from '../components/ui';
import { createGroup, joinGroup } from '../store/storage';

/**
 * Shown (in cloud mode) until this device belongs to a group. People either
 * create a private group — getting a shareable code — or join one with a code
 * and the shared password. The password is verified server-side; nothing is
 * readable until membership is confirmed.
 */
export function GroupGate() {
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (mode === 'create') {
        await createGroup(name, password);
      } else {
        await joinGroup(code, password);
      }
      // On success the store enters the group and this gate unmounts.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    password.trim().length >= 4 &&
    (mode === 'create' ? name.trim().length > 0 : code.trim().length >= 4) &&
    !busy;

  return (
    <Screen>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col"
      >
        <div className="flex justify-center pt-8">
          <Logo />
        </div>

        <p className="mt-2 text-center font-body text-white/60">
          Your private club. Play from any phone — only your group can see it.
        </p>

        {/* mode toggle */}
        <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
          {(['join', 'create'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`rounded-xl py-3 font-display text-sm font-extrabold uppercase tracking-widest transition ${
                mode === m ? 'bg-gradient-to-r from-hot to-sun text-night-900' : 'text-white/60'
              }`}
            >
              {m === 'join' ? 'Join group' : 'Create group'}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) void submit();
          }}
          className="mt-6 flex flex-col gap-4"
        >
          {mode === 'create' ? (
            <Field
              label="Group name"
              value={name}
              onChange={setName}
              placeholder="e.g. Cabo Crew"
              maxLength={30}
              autoFocus
            />
          ) : (
            <Field
              label="Group code"
              value={code}
              onChange={(v) => setCode(v.toUpperCase())}
              placeholder="6-character code"
              maxLength={6}
              autoCapitalize="characters"
              autoFocus
            />
          )}

          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Shared group password"
            type="password"
            maxLength={64}
          />

          {error && (
            <p className="rounded-xl bg-not/15 px-4 py-3 text-center font-body text-sm font-bold text-not-glow">
              {error}
            </p>
          )}

          <Button type="submit" disabled={!canSubmit} className="mt-2 w-full">
            {busy ? 'One sec…' : mode === 'create' ? 'Create & enter →' : 'Join →'}
          </Button>
        </form>

        <p className="mt-6 text-center font-body text-xs font-bold text-white/35">
          {mode === 'create'
            ? "You'll get a code to share with your group."
            : 'Ask whoever made the group for the code + password.'}
        </p>
      </motion.div>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
  autoFocus,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  autoFocus?: boolean;
  autoCapitalize?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
        {label}
      </span>
      <input
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-display text-xl font-extrabold text-white placeholder:text-white/25 focus:border-hot focus:outline-none"
      />
    </label>
  );
}
