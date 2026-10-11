// Sidene i bakgrunnen (avgjørelse 111). Sidene brukeren har gått gjennom i en rett linje, står skjult i bakgrunnen, så
// tilbake og fram viser dem med en gang, der brukeren var. Her er reglene for hvilke sider som står der, som rene
// funksjoner. Appskallet tegner dem.
import type { Navigasjonstype } from './ruter.ts';

/**
 * En side i historikken: hvor langt inn i appen den står (dybden), stien, spørringen og besøket. Et besøk er
 * oppføringer etter hverandre på samme sti, f.eks. stegene i en veiviser. De deler én side. Kommer brukeren til samme
 * sti senere, er det et nytt besøk med en ny side, så siden leser tilstanden i sin egen oppføring (f.eks. skjemaet i en
 * kalkulator), som før.
 */
export interface Oppforing {
  dybde: number;
  sti: string;
  sporring: string;
  besok: number;
}

export type NyOppforing = Omit<Oppforing, 'besok'>;

/** Hvor mange sider som står skjult i bakgrunnen, i tillegg til siden som vises (eier 11.10.2026). */
export const MAKS_I_BAKGRUNNEN = 5;

/** Oppføringer lenger unna enn dette glemmes, så listen ikke vokser. */
const HUSKES = 20;

let neste = 0;
const nyttBesok = () => (neste += 1);

/**
 * Oppdaterer listen etter en navigasjon og gir oppføringen som vises. En ny side (lenke) fjerner sidene foran, som
 * nettleserens historikk, og hører til samme besøk som siden brukeren kom fra når stien er den samme. Tilbake og fram
 * (historikk) finner oppføringen på dybden. Er den ukjent (f.eks. søket fra toppfeltet, som har en egen oppføring på
 * samme adresse), hører den til besøket ved siden av når stien er den samme.
 */
export function oppdaterStabel(stabel: readonly Oppforing[], ny: NyOppforing, type: Navigasjonstype, forrige: Oppforing | null): { stabel: Oppforing[]; aktiv: Oppforing } {
  let besok: number;
  if (type === 'ny') {
    besok = forrige && forrige.sti === ny.sti ? forrige.besok : nyttBesok();
  } else {
    const kjent = stabel.find((o) => o.dybde === ny.dybde && o.sti === ny.sti);
    const nabo = stabel.find((o) => Math.abs(o.dybde - ny.dybde) === 1 && o.sti === ny.sti);
    besok = kjent?.besok ?? nabo?.besok ?? nyttBesok();
  }
  const aktiv: Oppforing = { ...ny, besok };
  const beholdes = stabel.filter((o) => (type === 'ny' ? o.dybde < ny.dybde : o.dybde !== ny.dybde) && Math.abs(o.dybde - ny.dybde) <= HUSKES);
  return { stabel: [...beholdes, aktiv].sort((a, b) => a.dybde - b.dybde), aktiv };
}

/**
 * Sidene som står skjult i bakgrunnen: de nærmeste i historikken, én per besøk, uten siden som vises. Ved lik avstand
 * går siden bak foran siden foran. For et besøk med flere oppføringer brukes den nærmeste.
 */
export function siderIBakgrunnen(stabel: readonly Oppforing[], aktiv: Oppforing, maks = MAKS_I_BAKGRUNNEN): Oppforing[] {
  const avstand = (o: Oppforing) => Math.abs(o.dybde - aktiv.dybde) * 2 + (o.dybde > aktiv.dybde ? 1 : 0);
  const valgt: Oppforing[] = [];
  const besok = new Set([aktiv.besok]);
  for (const o of [...stabel].sort((a, b) => avstand(a) - avstand(b))) {
    if (valgt.length >= maks) break;
    if (besok.has(o.besok)) continue;
    besok.add(o.besok);
    valgt.push(o);
  }
  return valgt;
}
