// Om siden vises, eller står skjult i bakgrunnen (avgjørelse 111). Sider og komponenter som lytter på hele vinduet
// (rulling, størrelse) eller måler seg selv, bruker dette, så en skjult side ikke reagerer.
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export const SideAktiv = createContext(true);

/** Sann når siden vises, usann når den står skjult i bakgrunnen. */
export function useSideAktiv(): boolean {
  return useContext(SideAktiv);
}
