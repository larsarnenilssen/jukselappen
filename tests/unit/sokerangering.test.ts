// Hverdagsord og rangering i søket (avgjørelse 100): «leseplikt» finner undervisningstid og årsramme, og paragrafer om
// grunnskolen og privatskoler står lenger ned enn de om videregående, privatskolene bare når «Privatskole» ikke er valgt.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Synonymer } from '../../src/core/innhold/skjema.ts';
import { byggIndeks, lastIndeks, serialiser, sok, type Sokeoppforing } from '../../src/core/sok/sok.ts';
import { rangerTreff } from '../../src/core/sok/synlige.ts';
import { omGrunnskolen } from '../../src/modules/lov/index.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const synonymer = lesFil(rot, join(rot, 'content/sok/synonymer.yaml')) as Synonymer;

const lov = (id: string, tittel: string, omrade?: Sokeoppforing['omrade']): Sokeoppforing => ({
  id,
  type: 'lov',
  tittel: { nb: tittel, nn: tittel },
  rute: `/${id}`,
  modul: 'lov',
  ...(omrade ? { omrade } : {}),
});

const oppforinger: Sokeoppforing[] = [
  { id: 'arsramme', type: 'begrep', tittel: { nb: 'Årsramme', nn: 'Årsramme' }, tekst: { nb: 'Undervisningstid i året.', nn: 'Undervisningstid i året.' }, rute: '/a', modul: 'begreper' },
  { id: 'orden', type: 'begrep', tittel: { nb: 'Orden og oppførsel', nn: 'Orden og oppførsel' }, rute: '/o', modul: 'begreper' },
  { id: 'orden-alene', type: 'begrep', tittel: { nb: 'Orden i papirene', nn: 'Orden i papira' }, rute: '/p', modul: 'begreper' },
  lov('lov:opplaeringsforskrifta:9-44', '§ 9-44 Føring av fråvær i grunnskolen (opplæringsforskrifta)', ['grunnskole']),
  lov('lov:privatskoleforskrifta:6-50', '§ 6-50 Føring av fråvær i vidaregåande opplæring (privatskoleforskrifta)', ['privatskole']),
  lov('lov:opplaeringsforskrifta:9-53', '§ 9-53 Føring av fråvær i vidaregåande opplæring (opplæringsforskrifta) med ein lengre tittel'),
];
const indeks = byggIndeks(oppforinger, synonymer);
const ider = (s: string, privatskole = false) => rangerTreff(sok(indeks, s), privatskole).map((t) => t.id);

describe('hverdagsord i søket', () => {
  it('ordlisten har bare enkeltord i `ord`', () => {
    for (const h of synonymer.hverdagsord ?? []) for (const o of h.ord) expect(o).not.toMatch(/\s/);
  });

  it('«leseplikt» finner årsrammen, som ikke inneholder ordet', () => {
    expect(ider('leseplikt')).toContain('arsramme');
    expect(ider('Undervisningsplikt')).toContain('arsramme');
  });

  it('et uttrykk på flere ord må ha alle ordene', () => {
    const treff = ider('ordenskarakter');
    expect(treff).toContain('orden');
    expect(treff).not.toContain('orden-alene');
  });

  it('virker også etter at indeksen er lagret og lastet', () => {
    const lastet = lastIndeks(serialiser(indeks), synonymer);
    expect(sok(lastet, 'leseplikt').map((t) => t.id)).toContain('arsramme');
  });

  it('søk uten hverdagsord gir de samme treffene som før', () => {
    expect(ider('årsramme')).toEqual(['arsramme']);
  });
});

describe('ord appen kaller noe annet (12.10.2026)', () => {
  // Som i appen: et fag og en paragraf med ordet i tittelen, og oversiktene som har ordet bare i stikkordene.
  const sider: Sokeoppforing[] = [
    { id: 'kalender', type: 'modul', tittel: { nb: 'Kalender', nn: 'Kalender' }, stikkord: ['frister', 'datoer', 'årshjul', 'skolerute', 'ferie'], rute: '/kalender', modul: 'kalender' },
    lov('lov:forvaltningsloven:11b', '§ 11 b Adgang for Kongen til å fastsette frister (forvaltningsloven)'),
    { id: 'itall', type: 'modul', tittel: { nb: 'Videregående i tall', nn: 'Vidaregåande i tal' }, stikkord: ['statistikk', 'tall', 'søkere', 'elevtall', 'læreplass', 'formidling', 'gjennomføring', 'fravær'], rute: '/statistikk', modul: 'statistikk' },
    { id: 'fag:REA3065', type: 'fag', tittel: { nb: 'Statistikk', nn: 'Statistikk' }, rute: '/fag/REA3065', modul: 'fag' },
    // Har «videregående», et ord som begynner på i («ikke») og et ord én bokstav fra «tall» («tale»), men ikke «i»,
    // «tall» eller «statistikk».
    { id: 'stoy', type: 'begrep', tittel: { nb: 'Elevtale', nn: 'Elevtale' }, tekst: { nb: 'Eleven skal ikke holde en tale om videregående.', nn: 'Eleven skal ikkje halde ein tale om vidaregåande.' }, rute: '/stoy', modul: 'begreper' },
  ];
  const egen = byggIndeks(sider, synonymer);
  const forst = (s: string) => sok(egen, s).map((t) => t.id);

  it('«frister» og «frist» gir Kalender først', () => {
    expect(forst('frister')[0]).toBe('kalender');
    expect(forst('fristar')[0]).toBe('kalender');
    expect(forst('frist')[0]).toBe('kalender');
  });

  it('«statistikk» gir Videregående i tall først, og faget står fortsatt i treffene', () => {
    const treff = forst('statistikk');
    expect(treff[0]).toBe('itall');
    expect(treff).toContain('fag:REA3065');
  });

  it('korte ord i et uttrykk står som hele ord, og uttrykket tåler ikke skrivefeil', () => {
    expect(forst('statistikk')).not.toContain('stoy');
  });
});

describe('rangeringen av grunnskole og privatskole', () => {
  it('paragrafen om videregående står før grunnskolen og privatskolene når «Privatskole» ikke er valgt', () => {
    const treff = ider('fravær');
    expect(treff).toHaveLength(3);
    expect(treff[0]).toBe('lov:opplaeringsforskrifta:9-53');
  });

  it('med «Privatskole» valgt står privatskoleforskrifta der den ellers ville stått, og grunnskolen er fortsatt nede', () => {
    const treff = ider('fravær', true);
    expect(treff.indexOf('lov:privatskoleforskrifta:6-50')).toBeLessThan(treff.indexOf('lov:opplaeringsforskrifta:9-44'));
    expect(treff.at(-1)).toBe('lov:opplaeringsforskrifta:9-44');
  });

  it('ingen treff tas bort, og like treff beholder rekkefølgen', () => {
    const treff = [
      { id: 'a', score: 10 },
      { id: 'b', score: 10, omrade: ['grunnskole' as const] },
      { id: 'c', score: 10 },
      { id: 'd', score: 30, omrade: ['privatskole' as const, 'grunnskole' as const] },
    ];
    expect(rangerTreff(treff, false).map((t) => t.id)).toEqual(['a', 'c', 'd', 'b']);
    expect(rangerTreff(treff, true).map((t) => t.id)).toEqual(['d', 'a', 'c', 'b']);
  });

  it('paragrafer om overgangen fra grunnskolen til videregående regnes ikke som grunnskole', () => {
    expect(omGrunnskolen('§ 9-44 Føring av fråvær i grunnskolen')).toBe(true);
    expect(omGrunnskolen('§ 3-13 Permisjon frå den pliktige grunnskoleopplæringa')).toBe(true);
    expect(omGrunnskolen('§ 9-5 Overgangen frå grunnskolen til den vidaregåande opplæringa')).toBe(false);
    expect(omGrunnskolen('§ 9-53 Føring av fråvær i vidaregåande opplæring')).toBe(false);
  });
});
