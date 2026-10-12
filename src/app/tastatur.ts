// Tastaturet på iPhone (eier 12.10.2026, avgjørelse 112). iOS åpner tastaturet bare når et felt får fokus i selve
// trykket. Søket i toppfeltet tegnes først etter trykket, så et usynlig felt får fokus i trykket, og søkefeltet tar over
// fokuset når det er tegnet. Tastaturet blir da stående oppe.

let midlertidig: HTMLInputElement | null = null;
let tidsfrist: ReturnType<typeof setTimeout> | undefined;

/** Kalles i trykket som åpner et felt som tegnes etterpå. */
export function holdTastaturetKlart(): void {
  slippTastaturet();
  const felt = document.createElement('input');
  felt.type = 'text';
  felt.className = 'tastaturfelt';
  felt.tabIndex = -1;
  felt.setAttribute('aria-hidden', 'true');
  document.body.appendChild(felt);
  felt.focus({ preventScroll: true });
  midlertidig = felt;
  // Tegnes ikke feltet, fjernes det usynlige feltet likevel.
  tidsfrist = setTimeout(slippTastaturet, 1500);
}

/** Kalles når feltet som skal ha tastaturet, har fått fokus. */
export function slippTastaturet(): void {
  clearTimeout(tidsfrist);
  midlertidig?.remove();
  midlertidig = null;
}
