// Merket for skolen og fylket brukeren har valgt: «Din skole» og «Ditt fylke», i stedfargen. Samme merke overalt der
// appen merker skolen eller fylket ditt (eier 12.10.2026, avgjørelse 119).
import { useTekst } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

export function Stedmerke({ sted }: { sted: 'skole' | 'fylke' }) {
  const { t } = useTekst();
  return (
    <span class="merke merke-sted" data-sted={sted}>
      <Ikon navn="hake" />
      {t(sted === 'skole' ? 'komponenter.sted.dinSkole' : 'komponenter.sted.dittFylke')}
    </span>
  );
}
