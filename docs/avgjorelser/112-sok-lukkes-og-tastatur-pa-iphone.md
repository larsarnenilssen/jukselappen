# 112 – Søket lukkes ved et treff, og tastaturet åpnes på iPhone

**Kontekst:** Eier prøvde testversjonen på iPhone (12.10.2026). Etter et treff i søket fra toppfeltet viste tilbake søket igjen, ikke siden. Det var valgt slik 05.10.2026. Og når søket ble åpnet, fikk ikke feltet fokus, så tastaturet kom ikke opp.

**Valg:**
- **Et treff lukker søket:** Søket har en egen oppføring i historikken. Følges en lenke i søket, fjernes den oppføringen først (`gaaFraToppsok` i `src/app/ruter.ts`), og lenken blir en ny oppføring etter siden brukeren søkte fra. Tilbake viser siden uten søket, med fokus på overskriften.
- **Tastaturet på iPhone:** iOS åpner tastaturet bare når et felt får fokus i selve trykket. Søket tegnes først etter trykket. Et usynlig felt (`.tastaturfelt`, 16 px så iOS ikke forstørrer) får derfor fokus i trykket, og søkefeltet tar over når det er tegnet (`src/app/tastatur.ts`). Det usynlige feltet fjernes med en gang.
- **Testene** i `tests/e2e/navigasjon.spec.ts` sjekker begge deler. At tastaturet faktisk kommer opp, kan bare prøves på en iPhone.

**Konsekvens:** Søket blir ikke liggende i historikken. Vil brukeren søke på nytt, åpnes søket igjen.
