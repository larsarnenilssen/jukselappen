// Datafilene skrives bare når innholdet er endret, men nyhetene skrives hver gang, så tidspunktet for hentingen i appen
// er det siste (avgjørelse 116).
import { mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { skrivHvisEndret } from '../../scripts/data/hent.ts';

const forrige = { hentet: '2026-10-12T00:01:00.000Z', saker: ['a'] };
const samme = { hentet: '2026-10-12T06:37:00.000Z', saker: ['a'] };

describe('skrivHvisEndret', () => {
  it('skriver ikke når bare tidspunktet er nytt', () => {
    const fil = join(mkdtempSync(join(tmpdir(), 'data-')), 'fil.json');
    writeFileSync(fil, 'fra før');
    expect(skrivHvisEndret(fil, forrige, samme)).toBe(false);
    expect(readFileSync(fil, 'utf8')).toBe('fra før');
  });

  it('med alltid skrives det nye tidspunktet, og svaret sier at innholdet ikke er endret', () => {
    const fil = join(mkdtempSync(join(tmpdir(), 'data-')), 'fil.json');
    expect(skrivHvisEndret(fil, forrige, samme, { alltid: true })).toBe(false);
    expect(statSync(fil).size).toBeGreaterThan(0);
    expect(readFileSync(fil, 'utf8')).toContain(samme.hentet);
    expect(skrivHvisEndret(fil, forrige, { ...samme, saker: ['a', 'b'] }, { alltid: true })).toBe(true);
  });

  it('nyhetene skrives hver gang', () => {
    const kode = readFileSync(join(__dirname, '../../scripts/hent-nyheter.ts'), 'utf8');
    expect(kode).toContain('skrivHvisEndret(FIL, forrige, ny, { alltid: true })');
  });
});
