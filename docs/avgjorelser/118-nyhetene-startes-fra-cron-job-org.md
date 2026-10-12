# 118 – Nyhetene startes fra cron-job.org

**Kontekst:** GitHub starter planlagte kjøringer i dette repoet timer for sent eller ikke i det hele tatt. 12.10.2026 kom tre av 24 planlagte hentinger av nyhetene (avgjørelse 084, tillegg 09.10.2026). Eier vil ha nyhetene oppdatert hver time (eier 12.10.2026).

**Valg:**
- **cron-job.org starter Nyheter hver time,** med et kall til GitHub: `POST /repos/larsarnenilssen/jukselappen/actions/workflows/nyheter.yml/dispatches` med `{"ref":"main"}`. Eier har satt opp jobben og nøkkelen. Selve hentingen skjer fortsatt i GitHub Actions, og appen gjør ingen eksterne kall.
- **Nøkkelen** er en fine-grained token for bare dette repoet, med bare «Actions: Read and write». Den som har den, kan starte og stoppe arbeidsflyter, men ikke endre koden eller lese hemmelighetene. Den ligger bare hos cron-job.org og fornyes av eier før den utløper (`DRIFT.md`, «Åpne punkter»).
- **GitHubs egen plan er reserve,** hver tredje time (`47 */3 * * *`). Doble kjøringer venter på hverandre og gjør ingen skade.
- **Prøvekildene** hentes bare i PR-er og når eier starter arbeidsflyten med valget «prove», ikke ved kjøringene fra cron-job.org. Før ble de hentet ved alle kjøringer som ikke var planlagte.

**Konsekvens:** Nyhetene og «Sist oppdatert» er høyst om lag en time gamle, og appen publiseres hver time (avgjørelse 116). Utløper nøkkelen, eller er cron-job.org nede, kommer nyhetene bare med reserveplanen. cron-job.org sender e-post til eier når et kall feiler.
