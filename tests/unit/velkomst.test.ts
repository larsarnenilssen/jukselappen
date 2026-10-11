import { describe, expect, it } from 'vitest';
import { verktoyoverskrift } from '../../src/components/Oversiktsdel.tsx';
import { ANBEFALTE, lesRolle, ROLLER } from '../../src/app/velkomst/roller.ts';
import { samleFavorittbare } from '../../src/modules/register.ts';
import { velkomstNb } from '../../src/strings/velkomst.nb.ts';
import { velkomstNn } from '../../src/strings/velkomst.nn.ts';

describe('velkomsten (fase 10)', () => {
  it('de anbefalte favorittene finnes i modulenes favorittbare', async () => {
    const alle = await samleFavorittbare();
    for (const rolle of ROLLER) {
      for (const id of ANBEFALTE[rolle]) expect(alle.has(id), `${rolle}: ${id}`).toBe(true);
    }
    // Laster alle modulene, som de andre testene av favorittbare (tests/unit/register.test.ts).
  }, 30_000);

  it('en rolle som ikke finnes, leses som ingen rolle', () => {
    expect(lesRolle('skoleleder')).toBe('skoleleder');
    expect(lesRolle('rektor')).toBeNull();
    expect(lesRolle(undefined)).toBeNull();
  });

  it('hver rolle har navn på begge målformer', () => {
    for (const rolle of ROLLER) {
      expect(velkomstNb.rolle.roller[rolle]).toBeTruthy();
      expect(velkomstNn.rolle.roller[rolle]).toBeTruthy();
    }
  });
});

describe('overskriften over verktøyene på oversiktene (avgjørelse 109)', () => {
  it('står i entall for én og i flertall for flere av samme type (eier 08.10.2026)', () => {
    expect(verktoyoverskrift({ veivisere: 1 })).toBe('felles.veiviser');
    expect(verktoyoverskrift({ veivisere: 2 })).toBe('felles.veivisere');
    expect(verktoyoverskrift({ kalkulatorer: 1 })).toBe('felles.kalkulator');
    expect(verktoyoverskrift({ kalkulatorer: 2 })).toBe('felles.kalkulatorer');
    expect(verktoyoverskrift({ frister: 1 })).toBe('felles.frister');
  });

  it('heter «Verktøy» når det står flere typer (eier 11.10.2026)', () => {
    expect(verktoyoverskrift({ veivisere: 1, kalkulatorer: 1 })).toBe('felles.verktoy');
    expect(verktoyoverskrift({ veivisere: 1, frister: 1 })).toBe('felles.verktoy');
    expect(verktoyoverskrift({ veivisere: 2, kalkulatorer: 1, frister: 1 })).toBe('felles.verktoy');
    expect(verktoyoverskrift({ veivisere: 0, kalkulatorer: 1 })).toBe('felles.kalkulator');
  });
});
