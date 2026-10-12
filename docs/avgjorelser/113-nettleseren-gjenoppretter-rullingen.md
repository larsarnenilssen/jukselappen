# 113 – Nettleseren gjenoppretter også rullingen

**Kontekst:** Med sidene i bakgrunnen (avgjørelse 111) kom forsiden med en gang med tilbakepilen, men på iPhone var skjermen fortsatt blank både under og etter sveipet tilbake (eier 12.10.2026). Under sveipet viser iOS et bilde av siden det går tilbake til, og etter sveipet står bildet til siden er klar. Appen hadde slått av nettleserens egen gjenoppretting av rullingen (`history.scrollRestoration = 'manual'`), uten at grunnen er skrevet ned. Da får iOS ikke beskjed om at rullingen er gjenopprettet, og venter til en tidsfrist går ut før den viser siden.

**Valg:** `history.scrollRestoration = 'auto'` (`startRuting` i `src/app/ruter.ts`). Nettleseren gjenoppretter rullingen, og appen setter den etterpå som før (`utforScroll`), så de to gir samme sted. Testet i `tests/e2e/navigasjon.spec.ts`.

**Konsekvens:** Bildet fra sveipet skal tas bort så snart siden er klar. Er bildet blankt allerede under sveipet, er det iOS som ikke har tatt vare på det, og det kan ikke appen styre. Om det hjelper, kan bare prøves på en iPhone.
