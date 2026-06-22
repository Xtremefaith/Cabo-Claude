import { type ReactNode, useRef, useState } from 'react';
import { fileToSquareDataUrl } from '../lib/util';

/**
 * Wraps an avatar (or any preview) in a tappable button that opens the device
 * photo picker / camera, downscales the chosen image, and hands back a small
 * data URL via `onPhoto`. A little 📷 badge signals it's editable.
 */
export function PhotoPicker({
  children,
  onPhoto,
  label = 'Add photo',
}: {
  children: ReactNode;
  onPhoto: (dataUrl: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        className="relative inline-flex rounded-full active:scale-95"
      >
        {children}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-hot text-sm shadow-glow-hot ring-2 ring-night-900">
          {busy ? '…' : '📷'}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // let the same file be re-picked later
          if (!file) return;
          setBusy(true);
          try {
            onPhoto(await fileToSquareDataUrl(file));
          } catch {
            alert("Couldn't load that image — try a different one.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
