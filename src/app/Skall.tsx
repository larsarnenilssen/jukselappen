// Appskallet: fast topplinje og ett scrollområde (dokumentet). Bunnmenyen er tatt bort (avgjørelse 056): toppfeltet
// har tilbake, appnavnet (til forsiden), søk og innstillinger, og kildestatus står under Innstillinger.
import { Component, type ComponentType } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { visTekst } from '../core/i18n/tekst.ts';
import { Ikon } from '../components/Ikon.tsx';
import { TilToppen } from '../components/TilToppen.tsx';
import { gaaTilForsidesok, useForsidesokSynlig } from './forsidesok.ts';
import type { SideProps } from '../modules/typer.ts';
import { Feilgrense } from './Feilgrense.tsx';
import { Flyttevarsel } from './Flyttevarsel.tsx';
import { Oppdateringsvarsel } from './Oppdateringsvarsel.tsx';
import { apneToppsok, gaaFraToppsok, gaaTilbake, lukkToppsok, matchRute, settToppsok, usePlassering, useToppsok, utforScroll, type Navigasjon, type Navigasjonstype } from './ruter.ts';
import { SideAktiv } from './sideaktiv.ts';
import { holdTastaturetKlart } from './tastatur.ts';
import { oppdaterStabel, siderIBakgrunnen, type Oppforing } from './sidestabel.ts';
import { Sokeboks } from './Sokeboks.tsx';
import { merkSide } from './tilbakemelding.ts';
import { ruter, type Rute } from './ruteliste.ts';
import { useTekst } from './tilstand.ts';
import { VelkomstLaster } from './velkomst/VelkomstLaster.tsx';

type Sidemodul = { default: ComponentType<SideProps> };
const lastet = new Map<Rute, Sidemodul>();

function finnRute(sti: string): { rute: Rute; parametre: Record<string, string> } | null {
  for (const rute of ruter) {
    const parametre = matchRute(rute.sti, sti);
    if (parametre) return { rute, parametre };
  }
  return null;
}

function IkkeFunnet() {
  const { t } = useTekst();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('ikkeFunnet.tittel')}</h1>
      <p>{t('ikkeFunnet.tekst')}</p>
      {/* Veien videre som rader med ikon og pil, som inngangene på forsiden (fase 8b, docs/DESIGN.md). */}
      <ul class="liste">
        <li>
          <a class="listelenke" href="#/">
            <Ikon navn="hjem" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('ikkeFunnet.tilForsiden')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
        <li>
          <a class="listelenke" href="#/sok">
            <Ikon navn="sok" />
            <span class="listelenke-tekst">
              <span class="listelenke-tittel">{t('ikkeFunnet.sok')}</span>
            </span>
            <Ikon navn="hoyre" class="ikon-liten" />
          </a>
        </li>
      </ul>
    </div>
  );
}

/**
 * Innholdet på siden tegnes bare på nytt når siden får nye props (ny adresse), ikke hver gang skallet tegnes. Sidene i
 * bakgrunnen tegnes da ikke på nytt ved hver navigasjon (avgjørelse 111). Endringer i tilstanden (målform, innstillinger)
 * når sidene som før, fordi de lytter på den selv.
 */
class Sideinnhold extends Component<{ komponent: ComponentType<SideProps>; props: SideProps }> {
  override shouldComponentUpdate(neste: { komponent: ComponentType<SideProps>; props: SideProps }): boolean {
    return neste.komponent !== this.props.komponent || neste.props !== this.props.props;
  }

  override render() {
    const Komponent = this.props.komponent;
    return <Komponent {...this.props.props} />;
  }
}

/**
 * En side i en egen ramme. Sidene brukeren har gått gjennom, står skjult (hidden) i bakgrunnen, så tilbake og fram
 * viser dem med en gang, der brukeren var (avgjørelse 111). `navigasjon` endres ved hver navigasjon til siden, også når
 * bare spørringen endres (f.eks. et nytt steg i en veiviser).
 */
function Side({
  rute,
  props,
  adresse,
  type,
  aktiv,
  navigasjon,
}: {
  rute: Rute;
  props: SideProps;
  adresse: string;
  type: Navigasjonstype;
  aktiv: boolean;
  navigasjon: object | null;
}) {
  const { t } = useTekst();
  const [modul, settModul] = useState<Sidemodul | null>(() => lastet.get(rute) ?? null);
  const [feil, settFeil] = useState(false);
  const [forsok, settForsok] = useState(0);
  const ramme = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ferdig = lastet.get(rute);
    if (ferdig) {
      settModul(ferdig);
      return;
    }
    let gjelder = true;
    settModul(null);
    settFeil(false);
    rute
      .side()
      .then((m) => {
        lastet.set(rute, m);
        if (gjelder) settModul(m);
      })
      .catch(() => gjelder && settFeil(true));
    return () => {
      gjelder = false;
    };
  }, [rute, forsok]);

  // Sidetittelen får fokus når siden vises: første gang (unntatt den første siden i appen) og hver gang den hentes
  // fram fra bakgrunnen. Endres bare spørringen i adressen (f.eks. et nytt steg i en veiviser), er det samme side, og
  // siden styrer fokus selv. Sider som laster data først, får tittelen litt senere. Da venter vi på den.
  // Rullingen settes før siden tegnes (layout-effekt), så en side fra bakgrunnen står der brukeren var med en gang.
  const vist = useRef(false);
  const venter = useRef<MutationObserver | null>(null);
  useEffect(() => () => venter.current?.disconnect(), []);
  useLayoutEffect(() => {
    if (modul && aktiv) utforScroll();
  }, [modul, aktiv, navigasjon]);
  const varAktiv = useRef(false);
  useLayoutEffect(() => {
    const blirVist = aktiv && !!modul && !varAktiv.current;
    varAktiv.current = aktiv && !!modul;
    if (!blirVist) return;
    const forsteGang = !vist.current;
    vist.current = true;
    if (forsteGang && type === 'forste') return;
    const element = ramme.current;
    if (!element) return;
    // Et felt merket data-autofokus (f.eks. søkefeltet på søkesiden) får fokus i stedet for overskriften.
    const tittel = () => element.querySelector<HTMLElement>('[data-autofokus]') ?? element.querySelector<HTMLElement>('h1');
    const h1 = tittel();
    if (h1) {
      h1.focus({ preventScroll: true });
      return;
    }
    venter.current?.disconnect();
    const observator = new MutationObserver(() => {
      const h = tittel();
      if (!h) return;
      h.focus({ preventScroll: true });
      observator.disconnect();
    });
    observator.observe(element, { childList: true, subtree: true });
    venter.current = observator;
    setTimeout(() => observator.disconnect(), 3000);
  }, [modul, aktiv]);

  let innhold;
  if (feil) {
    innhold = (
      <div class="side" role="alert">
        <p>{t('app.lastefeil')}</p>
        <button type="button" class="knapp" onClick={() => settForsok((n) => n + 1)}>
          {t('app.provIgjen')}
        </button>
      </div>
    );
  } else if (!modul) {
    innhold = (
      <p class="side laster" aria-live="polite">
        {t('app.lasterInn')}
      </p>
    );
  } else {
    innhold = <Sideinnhold komponent={modul.default} props={props} />;
  }
  return (
    <div class="sideramme" hidden={!aktiv} ref={ramme}>
      <SideAktiv.Provider value={aktiv}>
        {/* En feil i siden gir en melding i stedet for en blank side, og toppfeltet virker fortsatt (avgjørelse 097). */}
        <Feilgrense adresse={adresse}>{innhold}</Feilgrense>
      </SideAktiv.Provider>
    </div>
  );
}

/** Propsene til en side gjenbrukes så lenge adressen er den samme, så en skjult side ikke tegnes på nytt uten grunn. */
const propsHusket = new Map<string, SideProps>();
function sideProps(o: Oppforing, parametre: Record<string, string>): SideProps {
  const nokkel = `${o.sti}?${o.sporring}`;
  let props = propsHusket.get(nokkel);
  if (!props) {
    props = { parametre, sporring: new URLSearchParams(o.sporring) };
    propsHusket.set(nokkel, props);
    if (propsHusket.size > 50) propsHusket.delete(propsHusket.keys().next().value as string);
  }
  return props;
}

/**
 * Siden som vises, og sidene i bakgrunnen (avgjørelse 111). Hver side hører til et besøk (se sidestabel.ts). Siden som
 * vises, står først i main, så id-er, etiketter og oppslag i dokumentet finner den før de skjulte.
 */
function useSiderIBakgrunnen(plassering: Navigasjon): { oppforing: Oppforing; aktiv: boolean }[] {
  const stabel = useRef<Oppforing[]>([]);
  const aktiv = useRef<Oppforing | null>(null);
  const forrige = useRef<Navigasjon | null>(null);
  if (forrige.current !== plassering || !aktiv.current) {
    const ny = { dybde: plassering.dybde, sti: plassering.sti, sporring: plassering.sporring.toString() };
    const resultat = oppdaterStabel(stabel.current, ny, plassering.type, aktiv.current);
    stabel.current = resultat.stabel;
    aktiv.current = resultat.aktiv;
    forrige.current = plassering;
  }
  const vises = aktiv.current;
  return [{ oppforing: vises, aktiv: true }, ...siderIBakgrunnen(stabel.current, vises).map((oppforing) => ({ oppforing, aktiv: false }))];
}

export function Skall() {
  const { t, malform } = useTekst();
  const plassering = usePlassering();
  const treff = finnRute(plassering.sti);
  const sider = useSiderIBakgrunnen(plassering);
  const erForside = plassering.sti === '/';

  useEffect(() => {
    const side = treff ? visTekst(treff.rute.tittel, malform) : t('ikkeFunnet.tittel');
    document.title = erForside ? app.navn : t('app.tittelMal', { side, app: app.navn });
  }, [treff?.rute, malform, erForside]);

  // Tilbakemeldingen tar med siden brukeren var på (eier 05.10.2026).
  useEffect(() => merkSide(plassering.sti, window.location.href), [plassering]);

  const paaSok = plassering.sti === '/sok';
  // Søket fra toppfeltet åpnes over siden brukeren står på (eier 05.10.2026).
  const sok = useToppsok();
  const sokApent = sok !== null;
  useEffect(() => {
    if (!sokApent) return;
    const tast = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lukkToppsok();
    };
    window.addEventListener('keydown', tast);
    return () => window.removeEventListener('keydown', tast);
  }, [sokApent]);
  const forsidesok = useForsidesokSynlig();
  const paaInnstillinger = plassering.sti === '/innstillinger';

  return (
    <div class="skall">
      <a
        class="hopp"
        href="#innhold"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('innhold')?.focus();
        }}
      >
        {t('app.hoppTilInnhold')}
      </a>
      <header class="topplinje">
        <div class="topplinje-innhold">
          {erForside ? (
            <span class="topplinje-plass" aria-hidden="true" />
          ) : (
            <button type="button" class="ikonknapp" onClick={gaaTilbake} aria-label={t('app.tilbake')}>
              <Ikon navn="tilbake" />
            </button>
          )}
          <a class="appnavn" href="#/">
            <span class="appnavn-tekst">{app.navn}</span>
          </a>
          {/* Søket står på forsiden, så knappen trengs bare på de andre sidene. Plassen holdes, så appnavnet står midt på. */}
          <nav class="topplinje-meny" aria-label={t('app.hovedmeny')}>
            {paaSok || sok !== null || (erForside && forsidesok) ? (
              <span class="topplinje-plass" aria-hidden="true" />
            ) : erForside ? (
              // På forsiden fører knappen tilbake til søkefeltet når brukeren har rullet forbi det.
              <button type="button" class="ikonknapp topplinje-sok" aria-label={t('nav.sok')} title={t('nav.sok')} onClick={gaaTilForsidesok}>
                <Ikon navn="sok" />
              </button>
            ) : (
              <button type="button" class="ikonknapp" aria-label={t('nav.sok')} title={t('nav.sok')} onClick={() => {
                  // Tastaturet åpnes i trykket på iPhone (avgjørelse 112).
                  holdTastaturetKlart();
                  apneToppsok();
                }}>
                <Ikon navn="sok" />
              </button>
            )}
            {paaInnstillinger ? (
              // I Innstillinger er knappen gul og fører tilbake til siden brukeren kom fra, eller til forsiden (eier
              // 09.10.2026).
              <button type="button" class="ikonknapp" aria-pressed="true" aria-label={t('nav.innstillinger')} title={t('nav.innstillingerTilbake')} onClick={gaaTilbake}>
                <Ikon navn="innstillinger" />
              </button>
            ) : (
              <a class="ikonknapp" href="#/innstillinger" aria-label={t('nav.innstillinger')} title={t('nav.innstillinger')}>
                <Ikon navn="innstillinger" />
              </a>
            )}
          </nav>
        </div>
      </header>
      {__TESTVERSJON__ && <p class="testversjon">{t('app.testversjon')}</p>}
      {sok !== null && (
        // Søkefeltet som på forsiden, lagt over siden (eier 05.10.2026). Siden står synlig bak. Et trykk utenfor feltet
        // og treffene, Esc og tilbake lukker søket. Knappen «Lukk søket» er tatt bort (eier 09.10.2026).
        <div
          class="toppsok-lag"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              lukkToppsok();
              return;
            }
            // En lenke i søket lukker søket før den følges, så tilbake viser siden uten søket (avgjørelse 112).
            const lenke = (e.target as Element).closest('a[href^="#"]');
            if (!lenke || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            gaaFraToppsok(lenke.getAttribute('href') ?? '#/');
          }}
        >
          <div class="toppsok forside-topp" role="dialog" aria-modal="true" aria-label={t('nav.sok')}>
            <Sokeboks etikett={t('sok.etikett')} plassholder={t('sok.plassholder')} startverdi={sok} autofokus onEndring={settToppsok} />
          </div>
        </div>
      )}
      {/* Siden står bak søket, men kan ikke nås med tastatur eller skjermleser mens søket er åpent. */}
      <main id="innhold" tabIndex={-1} inert={sok !== null}>
        {/* Siden som vises, først, og sidene i bakgrunnen skjult etter den (avgjørelse 111). */}
        {sider.map(({ oppforing, aktiv }) => {
          const funnet = finnRute(oppforing.sti);
          if (!funnet) {
            return aktiv ? (
              <div key={oppforing.besok} class="sideramme">
                <IkkeFunnet />
              </div>
            ) : null;
          }
          return (
            <Side
              key={oppforing.besok}
              rute={funnet.rute}
              props={sideProps(oppforing, funnet.parametre)}
              adresse={`${oppforing.sti}?${oppforing.sporring}`}
              type={aktiv ? plassering.type : 'historikk'}
              aktiv={aktiv}
              navigasjon={aktiv ? plassering : null}
            />
          );
        })}
      </main>
      {/* «Til toppen» på alle sider, når siden er lang nok og brukeren har rullet ned (avgjørelse 056). */}
      <TilToppen key={plassering.sti} />
      <Oppdateringsvarsel />
      <VelkomstLaster />
      <Flyttevarsel />
    </div>
  );
}
