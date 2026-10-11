// Sidene i bakgrunnen (avgjørelse 111). Sidene brukeren har gått gjennom i en rett linje, står skjult i bakgrunnen, så
// tilbake og fram viser dem med en gang, der brukeren var. Her er reglene for hvilke sider som står der, som rene
// funksjoner. Appskallet tegner dem.
import type { Navigasjonstype } from './ruter.ts';

/** En side i historikken: hvor langt inn i appen den står (dybden), stien og spørringen. */
export interface Oppforing {
  dybde: number;
  sti: string;
  sporring: string;
}

/** Hvor mange sider som står skjult i bakgrunnen, i tillegg til siden som vises (eier 11.10.2026). */
export const MAKS_I_BAKGRUNNEN = 5;

/** Oppføringer lenger unna enn dette glemmes, så listen ikke vokser. */
const HUSKES = 20;

/**
 * Oppdaterer listen etter en navigasjon. En ny side (lenke) fjerner sidene foran, som nettleserens historikk. Tilbake og
 * fram (historikk) og første side setter siden på sin plass.
 */
export function oppdaterStabel(stabel: readonly Oppforing[], ny: Oppforing, type: Navigasjonstype): Oppforing[] {
  const beholdes = stabel.filter((o) => (type === 'ny' ? o.dybde < ny.dybde : o.dybde !== ny.dybde) && Math.abs(o.dybde - ny.dybde) <= HUSKES);
  return [...beholdes, ny].sort((a, b) => a.dybde - b.dybde);
}

/**
 * Sidene som står skjult i bakgrunnen: de nærmeste i historikken, én per sti, uten siden som vises. Ved lik avstand
 * går siden bak foran siden foran.
 */
export function siderIBakgrunnen(stabel: readonly Oppforing[], aktiv: Oppforing, maks = MAKS_I_BAKGRUNNEN): Oppforing[] {
  const avstand = (o: Oppforing) => Math.abs(o.dybde - aktiv.dybde) * 2 + (o.dybde > aktiv.dybde ? 1 : 0);
  const valgt: Oppforing[] = [];
  const stier = new Set([aktiv.sti]);
  for (const o of [...stabel].sort((a, b) => avstand(a) - avstand(b))) {
    if (valgt.length >= maks) break;
    if (stier.has(o.sti)) continue;
    stier.add(o.sti);
    valgt.push(o);
  }
  return valgt;
}
