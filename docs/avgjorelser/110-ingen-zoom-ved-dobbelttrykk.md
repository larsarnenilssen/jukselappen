# 110 – Ingen zoom ved dobbelttrykk

**Kontekst:** Eier opplevde at raske trykk etter hverandre i appen ble tolket som dobbelttrykk, så siden ble forstørret (11.10.2026). Knipezoom skal ikke slås av globalt (WCAG 1.4.4), så `user-scalable=no` og `maximum-scale=1` i viewport er ikke aktuelt.

**Valg:**
- **`touch-action: manipulation` på alle elementer** i `base.css`. Det tar bort zoom ved dobbelttrykk, men lar knipezoom og rulling virke. Det står på alle elementer og ikke bare på `html`, fordi en rullbar boks (f.eks. en bred tabell) ikke får det fra elementene over.
- **Håndtaket i sorterbare lister** beholder sin egen `touch-action: none`.
- **Testen** i `tests/e2e/navigasjon.spec.ts` sjekker verdien, ved siden av testen som sjekker at knipezoom ikke er slått av.

**Konsekvens:** Trykk svarer litt raskere, fordi nettleseren ikke venter på et mulig dobbelttrykk. Den som vil forstørre, bruker knipezoom.
