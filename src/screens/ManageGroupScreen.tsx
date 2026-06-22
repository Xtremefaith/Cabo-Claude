import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackButton, Button, Screen } from '../components/ui';
import { PhotoPicker } from '../components/PhotoPicker';
import { useGroup } from '../store/useStore';
import { leaveGroup, updateGroup } from '../store/storage';
import { DEFAULT_SPICE, SPICE_LABELS } from '../data/spice';

export function ManageGroupScreen() {
  const navigate = useNavigate();
  const group = useGroup();
  const [name, setName] = useState(group?.name ?? '');
  const [copied, setCopied] = useState(false);

  if (!group) {
    return (
      <Screen>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-2xl font-extrabold">No group</p>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </Screen>
    );
  }

  const inviteLink = `${window.location.origin}${window.location.pathname}#/join/${group.code}`;
  const spice = group.settings?.spice ?? DEFAULT_SPICE;

  const share = async () => {
    const text = `Join my Claude Cabo group "${group.name}" 🌴 — group code ${group.code}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: 'Claude Cabo', text, url: inviteLink });
      } catch {
        /* user dismissed */
      }
    } else {
      await copy();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  const nameDirty = name.trim().length > 0 && name.trim() !== group.name;

  return (
    <Screen>
      <BackButton onClick={() => navigate('/')} />
      <h1 className="mb-6 font-display text-3xl font-extrabold">Manage group</h1>

      {/* Group photo */}
      <div className="flex flex-col items-center gap-2">
        <PhotoPicker onPhoto={(photo) => updateGroup({ photo })} label="Change group photo">
          {group.photo ? (
            <img
              src={group.photo}
              alt={group.name}
              draggable={false}
              className="h-28 w-28 rounded-full object-cover shadow-card"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-white/20 bg-white/5 text-4xl">
              👥
            </div>
          )}
        </PhotoPicker>
        <p className="font-body text-xs font-bold uppercase tracking-widest text-white/40">
          {group.photo ? 'Tap to change' : 'Add a group photo'}
        </p>
      </div>

      {/* Name */}
      <label className="mb-2 mt-8 block font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
        Group name
      </label>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-display text-xl font-extrabold text-white focus:border-hot focus:outline-none"
        />
        <Button disabled={!nameDirty} onClick={() => updateGroup({ name: name.trim() })}>
          Save
        </Button>
      </div>

      {/* Invite */}
      <div className="mt-8 rounded-2xl glass p-4">
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Invite the crew
        </p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-display text-3xl font-extrabold tracking-widest text-sun">
            {group.code}
          </span>
          <span className="font-body text-xs font-bold text-white/40">share with the password</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={share}>
            Share invite 🔗
          </Button>
          <Button variant="ghost" onClick={copy}>
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>
        <p className="mt-3 font-body text-xs font-bold text-white/35">
          The link fills in the code automatically. Tell them the password yourself — it's never in
          the link.
        </p>
      </div>

      {/* Spice level */}
      <div className="mt-4 rounded-2xl glass p-4">
        <p className="font-display text-sm font-extrabold uppercase tracking-widest text-white/50">
          Spice level
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => updateGroup({ settings: { ...(group.settings ?? {}), spice: n } })}
              aria-label={`Set spice ${n}`}
              className={`text-3xl transition active:scale-90 ${
                n <= spice ? '' : 'opacity-20 grayscale'
              }`}
            >
              🌶️
            </button>
          ))}
        </div>
        <p className="mt-2 font-display text-sm font-extrabold">
          {spice} / 5 · <span className="text-hot">{SPICE_LABELS[spice]}</span>
        </p>
        <p className="mt-1 font-body text-xs font-bold text-white/35">
          Controls how wild the Most Likely To prompts get for the whole group.
        </p>
      </div>

      <div className="flex-1" />
      <button
        onClick={() => {
          if (confirm('Leave this group on this device? You can rejoin with the code + password.')) {
            leaveGroup();
            navigate('/');
          }
        }}
        className="py-3 font-body text-sm font-bold text-white/30 active:scale-95"
      >
        Leave group
      </button>
    </Screen>
  );
}
