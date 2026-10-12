# 116 – Appen publiseres etter hver henting av nyhetene

**Kontekst:** Appen viser «Sist oppdatert» ved nyhetene, med tidspunktet fra nyhetsfilen. Appen ble bare publisert når sakene var endret (avgjørelse 098), så tidspunktet var fra den siste hentingen før appen sist ble publisert, ikke fra den siste hentingen. 12.10.2026 viste appen 02.01 hele dagen. Hentingene kl. 08.37 og andre kjøringer uten nye saker kom ikke ut, og publiseringen av testversjonen kl. 06.53 tok med filen fra 02.01. Eier ville ha publisering etter hver henting (eier 12.10.2026).

**Valg:** Arbeidsflyten Nyheter lagrer filen på grenen `nyheter` og publiserer appen etter hver henting, også når sakene er de samme. Hentingen skriver filen hver gang, med nytt tidspunkt (`skrivHvisEndret` med `alltid` i `scripts/hent-nyheter.ts`), så filen er alltid endret og appen publiseres.

**Konsekvens:**
- «Sist oppdatert» er tidspunktet for den siste hentingen, også når den ikke fant nye saker. Statusen for kildene kommer ut med en gang.
- Nyhetene blir ikke ferskere av dette. De kommer ut like fort som før, når GitHub starter hentingen. Hentingen står til hver time, men GitHub starter den sjeldnere (tre ganger 12.10.2026).
- Publiseringen gir ingen melding om ny versjon, fordi meldingen bare kommer med et nytt versjonsnummer (avgjørelse 088). Nyhetsfilen ligger ikke i service workeren (avgjørelse 084), så nye nyheter gir ingen ny nedlasting av appen. Det gjør bare nye data fra `main`, som før.
- Det blir én publisering per henting, med røyktest (avgjørelse 099). Repoet er offentlig, så det koster ikke Actions-minutter. Det blir flere publiseringer som kan møte en publisering av en ny versjon (avgjørelse 098, «Kollisjoner»).

**Endret 12.10.2026:** Den første utgaven publiserte ikke når det ikke kom nye saker, fordi hentingen bare skrev filen når sakene eller statusen var endret. Første kjøring fra cron-job.org kl. 19.48 ble derfor ikke publisert. Nå skrives filen hver gang. Kjøringene startes nå også fra cron-job.org hver time (eier 12.10.2026).
