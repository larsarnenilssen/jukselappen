# 119 – Stedfargen og ett merke for skolen og fylket ditt

**Kontekst:** Appen merket skolen og fylket brukeren har valgt på tre måter: turkis tekst («Din skole» i skoleregisteret, «Ditt fylke» i Fylkene), et blått merke («Skolen din» i Regelverk og på fylkessiden, lokale verdier) og en blå flate («Hos fylkeskommunen»). Den blå flaten og det blå merket ble også brukt til vanlige merknader og filtre. Ordstillingen var ulik: «Din skole», «Skolen din» og «Min skole». Eier vil ha én farge for det som vises fordi brukeren har valgt fylke eller skole, ett merke og «Din skole» / «Ditt fylke» i alle merker og selvstendige formuleringer (eier 12.10.2026).

**Valg:**
- **Stedfargen** er den dempede turkisen appen allerede brukte for tilbud ved skolen din (avgjørelse 053). Tokenene heter nå `--farge-sted`, `--farge-sted-flate` og `--farge-sted-knapp`. Ingen ny farge kommer inn i appen.
- **Ett merke:** `Stedmerke` («✓ Din skole» / «✓ Ditt fylke», nynorsk «Din skule» / «Ditt fylke») brukes overalt der skolen eller fylket ditt merkes. Valget i Opplæringsløp heter «Din skole» / «Alle».
- **Fargen brukes for:** merket, linjen med valgt sted øverst på forsiden og i Inntak, boksen «Hos fylkeskommunen» når fylket er valgt, `Nivamerke` for fylke og skole, og fylkets og skolens oppføringer i kalenderen. Regelen står i `docs/DESIGN.md` («Stedfargen»).
- **Uten valgt fylke og skole** står linjen øverst på forsiden som før, og «Hos fylkeskommunen» står i den blå flaten med valget av fylke.
- **Filtre** i skoleregisteret og blant opplæringskontorene, og privatskolemerket i Regelverk, er blå (`merke-info`), fordi de ikke kommer av valget av sted.
- I løpende tekst brukes den formen som passer («tilbudene ved skolen din»).

**Konsekvens:** Det som vises fordi brukeren har valgt fylke eller skole, kjennes igjen på én farge og ett merke, og teksten i merket sier det samme uten farge (WCAG 1.4.1). Kontrasten er turkis 700 på turkis 100 i lys visning og turkis 300 på turkis 900 i mørk.
