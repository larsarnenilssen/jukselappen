# 111 – Sidene i bakgrunnen

**Kontekst:** Eier så at tilbake med sveip på mobil, særlig til forsiden, ga en tom skjerm før siden kom (11.10.2026). Appen tegnet siden på nytt ved tilbake: først øverst, så et hopp til et sted som ikke stemte mens innholdet lastet, og til slutt riktig sted. Forsiden er tyngst å tegne. Eier valgte at alle sidene i en rett linje skal stå klare i bakgrunnen, høyst fem (11.10.2026).

**Valg:**
- **Hver side står i en ramme** (`.sideramme`) i `main`. Sidene brukeren har gått gjennom, står skjult (`hidden`) etter siden som vises. Tilbake og fram viser den riktige siden og setter rullingen før siden tegnes (layout-effekt). Ingenting tegnes på nytt.
- **Hvilke sider** (`src/app/sidestabel.ts`, enhetstestet): de nærmeste i historikken, høyst fem i tillegg til siden som vises, én per sti. En ny side fra midten av linjen fjerner sidene foran, som nettleserens historikk. Stegene i en veiviser er samme side, fordi bare spørringen endres.
- **Siden som vises, står først** i `main`, så id-er, etiketter (`for`, `aria-labelledby`) og oppslag i dokumentet finner den før de skjulte. CSS som ser på innholdet i `main` (`main:has(…)`), ser bare på rammen som vises.
- **Skjulte sider tegnes ikke på nytt** ved navigasjon (`Sideinnhold` med `shouldComponentUpdate`). Endringer i tilstanden når dem som før.
- **Sider som lytter på vinduet** bruker `useSideAktiv()`: forsiden måler sidekolonnen og følger søkefeltet bare når den vises. «Til toppen» flytter fokus til overskriften på siden som vises.
- **Fokus** flyttes til overskriften på siden når den vises, også når den hentes fram fra bakgrunnen.
- **Testene:** `tests/e2e/navigasjon.spec.ts` sjekker at tilbake og fram viser samme side der brukeren var, og at høyst fem sider står i bakgrunnen. Ende-til-ende-testene ser etter innhold i siden som vises (`SYNLIG_SIDE` i `tests/e2e/hjelp.ts`).

**Konsekvens:** Tilbake og fram er like raskt som å bytte fane. Sidene i bakgrunnen bruker minne, derfor taket på fem. En ny side eller komponent som lytter på hele vinduet eller slår opp i dokumentet, må ta hensyn til at siden kan stå skjult.
