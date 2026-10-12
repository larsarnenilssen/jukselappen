# 115 – Grunnlaget for endringer flyttes når eier godkjenner

**Kontekst:** Kontrollsaken viser hva som er endret i en kilde siden grunnlaget, bitene i `data/status/kildetekst.json` (avgjørelse 018). Grunnlaget ble bare lagret når kildesjekken så kilden med status «ok». Godkjente eier en endring, og kilden ble endret igjen før neste kildesjekk, sammenlignet kontrollsaken med teksten fra før det eier hadde godkjent. 12.10.2026 viste den endringer i «Administrere eksamen» siden 08.10, selv om eier hadde godkjent kilden 10.10 (eier 12.10.2026).

**Valg:**
- For kilder med status «endret» lagrer kildesjekken også bitene slik teksten er nå, under `siste`, med fingeravtrykket. `siste` lages på nytt hver gang, bare for kildene som er endret.
- Godkjenner eier fingeravtrykket (`/godkjent` i kontrollsaken), blir bitene for det fingeravtrykket grunnlaget (`taISiste`), og godkjenningsjobben lagrer filen sammen med kildestatusen.
- Er kilden endret igjen før godkjenningen, stemmer ikke fingeravtrykket, og grunnlaget står som før.

**Konsekvens:** Neste endring sammenlignes med teksten eier har godkjent. Filen vokser ikke over tid: `siste` har bare de endrede kildene og forsvinner når de er godkjent: om lag 1,5 kB for en vanlig kilde, 8 kB for «Administrere eksamen» og høyst om lag 25 kB for hovedtariffavtalen. Lovteksten fra Lovdata tas inn automatisk og står aldri som «endret». For endringer eier godkjente før dette, gjelder det fra neste godkjenning.
