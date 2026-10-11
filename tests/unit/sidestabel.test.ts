import { describe, expect, it } from 'vitest';
import { MAKS_I_BAKGRUNNEN, oppdaterStabel, siderIBakgrunnen, type Oppforing } from '../../src/app/sidestabel.ts';

const o = (dybde: number, sti: string, sporring = ''): Oppforing => ({ dybde, sti, sporring });

function gaa(steg: [Oppforing, 'forste' | 'ny' | 'historikk'][]): Oppforing[] {
  return steg.reduce<Oppforing[]>((s, [ny, type]) => oppdaterStabel(s, ny, type), []);
}

describe('sidene i bakgrunnen (avgjørelse 111)', () => {
  it('forside → inntak → mer opplæring: tilbake til inntak har forsiden og mer opplæring i bakgrunnen', () => {
    const stabel = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
      [o(2, '/inntak/mer-opplaering'), 'ny'],
      [o(1, '/inntak'), 'historikk'],
    ]);
    expect(siderIBakgrunnen(stabel, o(1, '/inntak')).map((x) => x.sti)).toEqual(['/', '/inntak/mer-opplaering']);
  });

  it('en ny side fra midten fjerner sidene foran', () => {
    const stabel = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak'), 'ny'],
      [o(2, '/inntak/mer-opplaering'), 'ny'],
      [o(1, '/inntak'), 'historikk'],
      [o(2, '/inntak/poeng'), 'ny'],
    ]);
    expect(stabel.map((x) => x.sti)).toEqual(['/', '/inntak', '/inntak/poeng']);
  });

  it('holder høyst fem sider i bakgrunnen, de nærmeste først', () => {
    const stier = ['/', '/a', '/b', '/c', '/d', '/e', '/f', '/g'];
    const stabel = gaa(stier.map((s, i) => [o(i, s), i === 0 ? 'forste' : 'ny'] as [Oppforing, 'forste' | 'ny']));
    const bak = siderIBakgrunnen(stabel, o(7, '/g'));
    expect(bak).toHaveLength(MAKS_I_BAKGRUNNEN);
    expect(bak.map((x) => x.sti)).toEqual(['/f', '/e', '/d', '/c', '/b']);
  });

  it('ved lik avstand går siden bak foran siden foran', () => {
    const stabel = gaa([
      [o(0, '/a'), 'forste'],
      [o(1, '/b'), 'ny'],
      [o(2, '/c'), 'ny'],
      [o(1, '/b'), 'historikk'],
    ]);
    expect(siderIBakgrunnen(stabel, o(1, '/b'), 1).map((x) => x.sti)).toEqual(['/a']);
  });

  it('én side per sti: stegene i en veiviser er samme side', () => {
    const stabel = gaa([
      [o(0, '/'), 'forste'],
      [o(1, '/inntak/veiviser', 'steg=a'), 'ny'],
      [o(2, '/inntak/veiviser', 'steg=b'), 'ny'],
      [o(3, '/inntak/veiviser', 'steg=c'), 'ny'],
    ]);
    expect(siderIBakgrunnen(stabel, o(3, '/inntak/veiviser', 'steg=c')).map((x) => x.sti)).toEqual(['/']);
  });

  it('tilbake og fram oppdaterer spørringen på plassen sin', () => {
    const stabel = gaa([
      [o(0, '/sok', 'q=a'), 'forste'],
      [o(1, '/fag'), 'ny'],
      [o(0, '/sok', 'q=ab'), 'historikk'],
    ]);
    expect(stabel).toEqual([o(0, '/sok', 'q=ab'), o(1, '/fag')]);
  });

  it('glemmer sider langt unna', () => {
    const stabel = gaa(Array.from({ length: 40 }, (_, i) => [o(i, `/s${i}`), i === 0 ? 'forste' : 'ny'] as [Oppforing, 'forste' | 'ny']));
    expect(stabel.length).toBeLessThanOrEqual(21);
  });
});
