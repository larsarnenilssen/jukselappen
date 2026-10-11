import { describe, expect, it } from 'vitest';
import { MAKS_I_BAKGRUNNEN, oppdaterStabel, siderIBakgrunnen, type Oppforing } from '../../src/app/sidestabel.ts';

type Type = 'forste' | 'ny' | 'historikk';
const o = (dybde: number, sti: string, sporring = '') => ({ dybde, sti, sporring });

/** Går gjennom navigasjonene og gir listen og oppføringen som vises til slutt. */
function gaa(steg: [ReturnType<typeof o>, Type][]): { stabel: Oppforing[]; aktiv: Oppforing } {
  let stabel: Oppforing[] = [];
  let aktiv: Oppforing | null = null;
  for (const [ny, type] of steg) ({ stabel, aktiv } = oppdaterStabel(stabel, ny, type, aktiv));
  return { stabel, aktiv: aktiv as Oppforing };
}

const stier = (liste: Oppforing[]) => liste.map((x) => x.sti);

describe('sidene i bakgrunnen (avgjørelse 111)', () => {
  it('forside → inntak → mer opplæring: tilbake til inntak har forsiden og mer opplæring i bakgrunnen', () => {
    const { stabel, aktiv } = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
      [o(2, '/inntak/mer-opplaering'), 'ny'],
      [o(1, '/inntak'), 'historikk'],
    ]);
    expect(aktiv.sti).toBe('/inntak');
    expect(stier(siderIBakgrunnen(stabel, aktiv))).toEqual(['/', '/inntak/mer-opplaering']);
  });

  it('tilbake og fram gir samme side (samme besøk) som før', () => {
    const forst = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
    ]);
    const { aktiv } = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
      [o(0, '/'), 'historikk'],
      [o(1, '/inntak'), 'historikk'],
    ]);
    expect(forst.stabel.find((x) => x.sti === '/')?.besok).not.toBe(forst.aktiv.besok);
    expect(aktiv.sti).toBe('/inntak');
  });

  it('en ny side fra midten fjerner sidene foran', () => {
    const { stabel } = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
      [o(2, '/inntak/mer-opplaering'), 'ny'],
      [o(1, '/inntak'), 'historikk'],
      [o(2, '/inntak/poeng'), 'ny'],
    ]);
    expect(stier(stabel)).toEqual(['/', '/inntak', '/inntak/poeng']);
  });

  it('holder høyst fem sider i bakgrunnen, de nærmeste først', () => {
    const alle = ['/', '/a', '/b', '/c', '/d', '/e', '/f', '/g'];
    const { stabel, aktiv } = gaa(alle.map((s, i) => [o(i, s), i === 0 ? 'forste' : 'ny']));
    const bak = siderIBakgrunnen(stabel, aktiv);
    expect(bak).toHaveLength(MAKS_I_BAKGRUNNEN);
    expect(stier(bak)).toEqual(['/f', '/e', '/d', '/c', '/b']);
  });

  it('ved lik avstand går siden bak foran siden foran', () => {
    const { stabel, aktiv } = gaa([
      [o(0, '/a'), 'forste'],
      [o(1, '/b'), 'ny'],
      [o(2, '/c'), 'ny'],
      [o(1, '/b'), 'historikk'],
    ]);
    expect(stier(siderIBakgrunnen(stabel, aktiv, 1))).toEqual(['/a']);
  });

  it('stegene i en veiviser er samme besøk og samme side', () => {
    const { stabel, aktiv } = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak/veiviser', 'steg=a'), 'ny'],
      [o(2, '/inntak/veiviser', 'steg=b'), 'ny'],
      [o(3, '/inntak/veiviser', 'steg=c'), 'ny'],
    ]);
    expect(new Set(stabel.filter((x) => x.sti === '/inntak/veiviser').map((x) => x.besok)).size).toBe(1);
    expect(stier(siderIBakgrunnen(stabel, aktiv))).toEqual(['/']);
  });

  it('samme side senere er et nytt besøk med en ny side, f.eks. «Fortsett i Arbeidsplan» fra Beskjeftigelse', () => {
    const { stabel, aktiv } = gaa([
      [o(0, '/arbeidstid/arbeidsplan'), 'forste'],
      [o(1, '/arbeidstid/beskjeftigelse'), 'ny'],
      [o(2, '/arbeidstid/arbeidsplan'), 'ny'],
    ]);
    const forste = stabel.find((x) => x.dybde === 0);
    expect(aktiv.besok).not.toBe(forste?.besok);
    // Den første Arbeidsplan står fortsatt i bakgrunnen, med sin egen tilstand.
    expect(stier(siderIBakgrunnen(stabel, aktiv))).toEqual(['/arbeidstid/beskjeftigelse', '/arbeidstid/arbeidsplan']);
  });

  it('søket fra toppfeltet har en egen oppføring på samme adresse: tilbake dit gir siden som sto der', () => {
    // Siden er på dybde 1, søket på dybde 2 (ukjent for skallet), og treffet på dybde 3.
    const { stabel, aktiv } = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/om'), 'ny'],
      [o(3, '/begreper/arsramme'), 'ny'],
    ]);
    const om = stabel.find((x) => x.sti === '/om');
    const tilbake = oppdaterStabel(stabel, o(2, '/om'), 'historikk', aktiv);
    expect(tilbake.aktiv.besok).toBe(om?.besok);
  });

  it('tilbake og fram oppdaterer spørringen på plassen sin', () => {
    const { stabel } = gaa([
      [o(0, '/sok', 'q=a'), 'forste'],
      [o(1, '/fag'), 'ny'],
      [o(0, '/sok', 'q=ab'), 'historikk'],
    ]);
    expect(stabel.map((x) => [x.dybde, x.sti, x.sporring])).toEqual([
      [0, '/sok', 'q=ab'],
      [1, '/fag', ''],
    ]);
  });

  it('glemmer sider langt unna', () => {
    const { stabel } = gaa(Array.from({ length: 40 }, (_, i) => [o(i, `/s${i}`), i === 0 ? 'forste' : 'ny'] as [ReturnType<typeof o>, Type]));
    expect(stabel.length).toBeLessThanOrEqual(21);
  });
});
