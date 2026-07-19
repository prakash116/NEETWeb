'use client';

import dynamic from 'next/dynamic';

// three.js loads only on the client, only where the background is rendered.
const MoleculeField = dynamic(() => import('./molecule-field'), { ssr: false });

/**
 * Fixed full-viewport backdrop shared by the marketing, auth, and standalone
 * app pages: gradient wash + glow blobs + the three.js molecule field.
 * Content scrolls above it; glass surfaces (`bg-white/…` + backdrop-blur)
 * pick up the animation behind them.
 */
export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-teal-50/60" />
      <div className="absolute -top-24 -left-24 size-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-28 size-[28rem] rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute -bottom-36 left-1/3 size-96 rounded-full bg-violet-200/30 blur-3xl" />
      <MoleculeField />
    </div>
  );
}
