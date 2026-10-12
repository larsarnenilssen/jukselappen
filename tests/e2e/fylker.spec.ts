// Fylkene (fase 6, pakke 4, avgjørelse 061): fylkessiden under «Oppslag», boksen «Hos fylkeskommunen» i veiviserne,
// de lokale forskriftene for fylket og skolen, og skolens regler på skolekortet.
import { expect, test } from '@playwright/test';
import { aapneAlleSteg, erMobil, settLagret, SYNLIG_SIDE } from './hjelp.ts';

const SKOLE = { id: '974557584', navn: 'Fyllingsdalen videregående skole' };
const POENGSTEG = './#/inntak/rett-inntak-soknad?steg=sk-poeng&svar=norsk.ja.nei.nei.under19.vg1.poeng';

test.describe('fylker', () => {
  test('med valgt fylke heter inngangen fortsatt «Fylkene», og fylket står øverst i listen med merket «Ditt fylke»', async ({ page }) => {
    await settLagret(page, { fylke: '46' });
    await page.goto('./');
    // Undertittelen nevner fylket (eier 12.10.2026, avgjørelse 117).
    await expect(page.locator(`${SYNLIG_SIDE} .sted-valgt`)).toHaveClass(/sted-valgt-ja/);
    const inngang = page.getByRole('link', { name: /^Fylkene/ });
    await expect(inngang).toContainText('Vestland og de andre fylkene.');
    await inngang.click();
    await expect(page).toHaveURL(/#\/fylker$/);
    await expect(page.locator(`${SYNLIG_SIDE} h1`)).toHaveText('Fylkene');
    const forste = page.locator(`${SYNLIG_SIDE} .liste > li`).first();
    await expect(forste.locator('.listelenke-tittel')).toHaveText('Vestland fylkeskommune');
    await expect(forste.locator('.merke-sted')).toHaveText('Ditt fylke');
    await expect(page.locator(`${SYNLIG_SIDE} .merke-sted`)).toHaveCount(1);
    await forste.getByRole('link').click();
    await expect(page).toHaveURL(/#\/fylker\/46$/);
    await expect(page.locator(`${SYNLIG_SIDE} h1`)).toHaveText('Vestland fylkeskommune');
  });

  test('uten valgt fylke går inngangen på forsiden til listen over fylkene, uten merket', async ({ page }) => {
    await page.goto('./');
    const inngang = page.getByRole('link', { name: /^Fylkene/ });
    await expect(inngang).toContainText('Fylkets sider, forskrifter og skoler.');
    await inngang.click();
    await expect(page.locator(`${SYNLIG_SIDE} h1`)).toHaveText('Fylkene');
    await expect(page.locator(`${SYNLIG_SIDE} .merke-sted`)).toHaveCount(0);
  });

  test('fylkessiden lenker til fylkets sider og viser fylkets og skolenes forskrifter', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SKOLE });
    await page.goto('./#/fylker/46');
    await expect(page.locator(`${SYNLIG_SIDE} h1`)).toHaveText('Vestland fylkeskommune');
    // Lenkene til fylkets egne sider står lukket til brukeren åpner dem (eier 05.10.2026), og åpnes i en ny fane.
    const hos = page.locator('[data-rubrikk="fylke-lenker"]');
    const hosKnapp = hos.getByRole('button', { name: /Hos fylkeskommunen/ });
    await expect(hosKnapp).toHaveAttribute('aria-expanded', 'false');
    await hosKnapp.click();
    await expect(hos.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('target', '_blank');
    await expect(hos.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('href', /^https:\/\//);
    // Fylkets forskrifter og skolen din står åpent, de andre skolenes regler i en lukket gruppe.
    const lokale = page.locator('[data-rubrikk="fylke-lokale"]');
    await expect(lokale.getByRole('link', { name: /^Skoleregler i Vestland/ })).toBeVisible();
    await expect(lokale.getByRole('link', { name: /Fyllingsdalen videregående skole.*Din skole/ })).toBeVisible();
    const gruppe = lokale.locator('details.fylke-skolegruppe');
    await expect(gruppe).not.toHaveAttribute('open', '');
    await gruppe.locator('summary').click();
    await expect(gruppe.getByRole('link', { name: /Arna vidaregåande skule/ })).toBeVisible();
    await lokale.getByRole('link', { name: /^Skoleregler i Vestland/ }).click();
    await expect(page.locator(`${SYNLIG_SIDE} h1`)).toHaveText('Skoleregler i Vestland');
  });

  test('stedfargen brukes bare når fylke eller skole er valgt (avgjørelse 119)', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator(`${SYNLIG_SIDE} .sted-valgt`)).not.toHaveClass(/sted-valgt-ja/);
    await page.goto(POENGSTEG);
    await aapneAlleSteg(page);
    await expect(page.locator('details.hos-fylket').first()).not.toHaveClass(/hos-fylket-valgt/);
  });

  test('et ukjent fylke gir en melding', async ({ page }) => {
    await page.goto('./#/fylker/99');
    await expect(page.getByText('Fant ikke fylket.', { exact: false })).toBeVisible();
  });

  test('boksen «Hos fylkeskommunen» lenker til temaet hos fylket som er valgt', async ({ page }, info) => {
    await settLagret(page, { fylke: '46' });
    await page.goto(POENGSTEG);
    await aapneAlleSteg(page);
    const boks = page.locator('details.hos-fylket').first();
    // Lukket på mobil, åpen på stor skjerm (eier 05.10.2026).
    if (erMobil(info)) {
      await expect(boks).not.toHaveAttribute('open', '');
      await boks.locator('summary').click();
    } else {
      await expect(boks).toHaveAttribute('open', '');
    }
    await expect(boks.locator('summary')).toContainText('Vestland fylkeskommune');
    // Med valgt fylke står boksen i stedfargen (avgjørelse 119).
    await expect(boks).toHaveClass(/hos-fylket-valgt/);
    await expect(boks.getByRole('link', { name: /Søknad og inntak/ })).toHaveAttribute('href', /vestlandfylke\.no/);
    await boks.getByRole('link', { name: 'Alt om Vestland' }).click();
    await expect(page).toHaveURL(/#\/fylker\/46$/);
  });

  test('uten valgt fylke velges fylket i boksen, uten at innstillingen endres', async ({ page }, info) => {
    await page.goto(POENGSTEG);
    await aapneAlleSteg(page);
    const boks = page.locator('details.hos-fylket').first();
    if (erMobil(info)) await boks.locator('summary').click();
    await expect(boks.locator('summary')).toContainText('Hos fylkeskommunen');
    await boks.getByLabel('Vis siden hos').selectOption('11');
    await expect(boks.getByRole('link', { name: /Søknad og inntak|Videregående opplæring/ })).toHaveAttribute('href', /^https:\/\//);
    await page.goto('./#/fylker');
    await expect(page.locator(`${SYNLIG_SIDE} .liste .listelenke-tittel`).first()).toHaveText('Agder fylkeskommune');
  });

  test('skolekortet lenker til skolens regler', async ({ page }) => {
    await settLagret(page, { fylke: '46', skole: SKOLE });
    await page.goto('./#/opplaeringslop/skoler?fylke=46&q=Fyllingsdalen');
    const kort = page.locator('.skolekort').first();
    await expect(kort.locator('.skolekort-knapp')).toHaveAttribute('aria-expanded', 'true');
    await kort.getByRole('link', { name: 'Skolens regler' }).click();
    await expect(page).toHaveURL(/#\/lov\/fyllingsdalen-videregaende-skole-skoleregler$/);
    await expect(page.getByText('Gjelder bare skolen.', { exact: false })).toBeVisible();
  });
});
