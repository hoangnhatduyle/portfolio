/** Scrollspy for the sidebar/drawer links plus the mobile drawer toggle. */

const ANY_MODAL_OPEN = 'dialog[open]';

function sectionsFor(links: readonly HTMLAnchorElement[]): HTMLElement[] {
  const ids = new Set(
    links.map((link) => link.dataset.nav).filter((id): id is string => Boolean(id)),
  );
  return Array.from(ids)
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);
}

function initScrollspy(links: readonly HTMLAnchorElement[]): void {
  const sections = sectionsFor(links);
  if (sections.length === 0 || !('IntersectionObserver' in window)) return;

  const setCurrent = (id: string | null): void => {
    for (const link of links) {
      if (id !== null && link.dataset.nav === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  // A 1%-tall band 35% down the viewport. Sections are contiguous, so exactly one of them
  // (or the hero) overlaps the band at any time; whichever one enters it is the current one.
  // Entries arrive in time order, so the last "entering" entry always wins, even mid smooth-scroll.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      }
    },
    { rootMargin: '-35% 0px -64% 0px', threshold: 0 },
  );
  sections.forEach((section) => observer.observe(section));

  // The hero is not a nav item: entering the band clears the highlight.
  const top = document.getElementById('top');
  if (top) observer.observe(top);

  // On a tall viewport the last section can never reach the band, so at the very bottom of the
  // page it is current by definition.
  const last = sections[sections.length - 1];
  let queued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const atBottom =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        if (atBottom) setCurrent(last.id);
      });
    },
    { passive: true },
  );
}

function initDrawer(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean): void => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu
    .querySelectorAll('[data-menu-link]')
    .forEach((el) => el.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    // Escape belongs to the modal dialog while one is open.
    if (event.key !== 'Escape' || menu.hidden || document.querySelector(ANY_MODAL_OPEN)) return;
    setOpen(false);
    toggle.focus();
  });
}

export function initNav(): void {
  initScrollspy(Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav]')));
  initDrawer();
}
