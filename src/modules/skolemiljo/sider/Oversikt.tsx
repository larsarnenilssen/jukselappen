// Oversikten i Skolemiljø (fase 7): «Retten og reglene» til venstre (kapittel 12 og skolereglene, eier 06.10.2026) og
// veiviseren for aktivitetsplikten til høyre (avgjørelse 109).
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { Inngangsgruppe, Oversiktsdel, verktoyoverskrift } from '../../../components/Oversiktsdel.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { oversiktsid } from '../../favoritter.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { hentInnhold, type Skolemiljoinnhold, UNDERSIDER, veiviserRute } from '../innhold.ts';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Skolemiljoinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('skolemiljo.tittel')} favoritt={oversiktsid('skolemiljo')} />
      <p class="ingress">
        <Begrepstekst tekst={t('skolemiljo.innledning')} />
      </p>
      {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): retten og skolereglene til venstre, veiviseren til høyre
          (eier 08.10.2026). Hver kolonne har én overskrift (avgjørelse 109). */}
      <ToKolonner
        hoved={
          // Retten og pliktene øverst (eier 06.10.2026): kapittel 12. Elevundersøkelsen er egen modul (avgjørelse 087).
          <Oversiktsdel tittel={t('skolemiljo.delRetten')}>
            <Inngangsgruppe>
              <Inngang {...UNDERSIDER.kapittel12} tittel={t('skolemiljo.kapittel12.kort')} tekst={t('skolemiljo.kapittel12.beskrivelse')} />
            </Inngangsgruppe>
            <Inngangsgruppe>
              <Inngang {...UNDERSIDER.skoleregler} tittel={t('skolemiljo.skoleregler.kort')} tekst={t('skolemiljo.skoleregler.beskrivelse')} />
            </Inngangsgruppe>
          </Oversiktsdel>
        }
        side={
          <Oversiktsdel tittel={t(verktoyoverskrift({ veivisere: veivisere.length }))}>
            {innhold === null ? (
              <p class="dempet">{t('app.lasterInn')}</p>
            ) : (
              <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />
            )}
          </Oversiktsdel>
        }
      />
    </div>
  );
}
