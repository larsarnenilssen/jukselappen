// Oversikten i Vurdering: delene som kort, som i Inntak og Opplæringstilbud (fase 6, mockup godkjent av eier
// 04.10.2026). Kalkulatoren for fraværsgrensen står til høyre under veiviseren (eier 08.10.2026). Eksamen og klage er egen modul
// (avgjørelse 078).
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, UNDERSIDER, veiviserRute, type Vurderingsinnhold } from '../innhold.ts';
import { Inngang } from './Inngang.tsx';
import { Kalkulatorinngang } from '../../../components/Kalkulatorinngang.tsx';
import { Inngangsgruppe, Oversiktsdel, verktoyoverskrift } from '../../../components/Oversiktsdel.tsx';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Vurderingsinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('vurdering.tittel')} favoritt={oversiktsid('vurdering')} />
      <p class="ingress">
        <Begrepstekst tekst={t('vurdering.innledning')} />
      </p>
      {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): sidene i modulen til venstre, veiviseren og kalkulatoren
          til høyre (eier 08.10.2026). Hver kolonne har én overskrift (avgjørelse 109). */}
      <ToKolonner
        hoved={
          <Oversiktsdel tittel={t('vurdering.delRegler')}>
            <Inngangsgruppe>
              <Inngang {...UNDERSIDER.underveisSlutt} tittel={t('vurdering.underveisSlutt.kort')} tekst={t('vurdering.underveisSlutt.beskrivelse')} />
            </Inngangsgruppe>
            <Inngangsgruppe>
              <Inngang {...UNDERSIDER.orden} tittel={t('vurdering.orden.kort')} tekst={t('vurdering.orden.beskrivelse')} />
            </Inngangsgruppe>
          </Oversiktsdel>
        }
        side={
          <Oversiktsdel tittel={t(verktoyoverskrift({ veivisere: veivisere.length, kalkulatorer: 1 }))}>
            <Inngangsgruppe>
              {innhold === null ? <p class="dempet">{t('app.lasterInn')}</p> : <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />}
            </Inngangsgruppe>
            <Inngangsgruppe>
              <Kalkulatorinngang
                href={`#${UNDERSIDER.fravaer.rute}`}
                ikon={UNDERSIDER.fravaer.ikon}
                tittel={t('vurdering.fravaer.kort')}
                inn={[t('vurdering.fravaer.faget'), t('vurdering.fravaer.okter')]}
                ut={t('vurdering.fravaer.resultat.tittel')}
              />
            </Inngangsgruppe>
          </Oversiktsdel>
        }
      />
    </div>
  );
}
