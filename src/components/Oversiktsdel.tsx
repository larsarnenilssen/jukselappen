// Kolonnene på oversiktene i modulene (eier 11.10.2026, avgjørelse 109): hver kolonne har én overskrift med strek
// over, også når det bare står ett kort under. Overskriften sier hva som står i kolonnen. Kortene under står som én
// liste, uten egne overskrifter (avgjørelse 100). Står det flere grupper med kort, f.eks. veiviserne og kalkulatoren,
// står hver i en `Inngangsgruppe`.
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import type { Tekstnokkel } from '../core/i18n/tekst.ts';

export function Oversiktsdel({ tittel, children }: { tittel: string; children: ComponentChildren }) {
  const id = useId();
  return (
    <section class="lop-del" aria-labelledby={id}>
      <h2 class="liten-overskrift" id={id}>
        {tittel}
      </h2>
      {children}
    </section>
  );
}

/** En gruppe kort i en kolonne. Flere grupper etter hverandre står som én liste (avgjørelse 100). */
export function Inngangsgruppe({ children }: { children: ComponentChildren }) {
  return <div class="lop-del-enkel">{children}</div>;
}

/** Hvor mange innganger av hver type verktøy som står i kolonnen. */
export interface Verktoyantall {
  veivisere?: number;
  kalkulatorer?: number;
  frister?: number;
}

/**
 * Overskriften over verktøyene på en oversikt (eier 11.10.2026, avgjørelse 109): «Verktøy» når det står flere typer,
 * ellers navnet på typen, i entall eller flertall etter hvor mange det er. Fristene står i én inngang til kalenderen og
 * heter alltid «Frister».
 */
export function verktoyoverskrift({ veivisere = 0, kalkulatorer = 0, frister = 0 }: Verktoyantall): Tekstnokkel {
  const typer = [veivisere, kalkulatorer, frister].filter((n) => n > 0).length;
  if (typer > 1) return 'felles.verktoy';
  if (kalkulatorer > 0) return kalkulatorer === 1 ? 'felles.kalkulator' : 'felles.kalkulatorer';
  if (frister > 0) return 'felles.frister';
  return veivisere === 1 ? 'felles.veiviser' : 'felles.veivisere';
}
