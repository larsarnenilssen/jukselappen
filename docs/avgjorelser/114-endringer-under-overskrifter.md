# 114 – Endringer på nettsider under overskriftene

**Kontekst:** Kildesjekken viser hvilket punkt en endring står under, og hva i appen den kan berøre: innhold og regelverdier som viser til samme punkt (avgjørelse 018). Punktet ble funnet som et nummer foran teksten («5.1», «§ 10-4»). Nettsider som Udirs «Administrere eksamen» har overskrifter i stedet for nummer, og innholdet viser til dem («Særskilt tilrettelegging, Sikker nettleser»). Kontrollsaken 12.10.2026 viste derfor «Punkt 3» for et tilfeldig tall på siden, og ingen «Kan berøre» for ny tekst om sikker nettleser, som gjelder begrepet og forklaringen særskilt tilrettelegging av eksamen (eier 12.10.2026).

**Valg:**
- For sider (`sjekkmetode: side`) hentes overskriftene (h1–h6) i samme del av siden som teksten, med nivået (`trekkUtOverskrifter`). Fingeravtrykket regnes fortsatt bare av teksten, så ingen kilde står som endret av dette.
- En endring får overskriftene den står under, ytterst først og uten sidetittelen, og overskrifter inne i den endrede teksten (`overskrifterVed`). Kontrollsaken viser «Under «Planlegge › Sikker nettleser»» i stedet for punktet.
- «Kan berøre» tar med innhold der en del av punktet (skilt med komma, semikolon eller «og») er lik en overskrift, eller den ene står i den andre (`overskriftTreff`). Nummer treffer som før. Grovt med vilje.

**Konsekvens:** Endringer på Udir-sidene og andre sider med overskrifter viser hva i appen som kan være berørt. Det virker fra neste kildesjekk, for endringer som er nye da. Innhold som viser til en side uten å nevne overskriften i `punkt`, får ikke treff.
