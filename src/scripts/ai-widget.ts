/** Floating "Ask my AI" button + large modal chat: lazy iframe, cold-start pre-warm, backdrop/Escape close. */
export function initAiWidget(): void {
  const root = document.querySelector<HTMLElement>('[data-ai-widget]');
  if (!root) return;

  const url = root.dataset.aiSrc ?? '';
  const toggle = root.querySelector<HTMLButtonElement>('[data-ai-toggle]');
  const dialog = root.querySelector<HTMLDialogElement>('[data-ai-dialog]');
  const frame = root.querySelector<HTMLIFrameElement>('[data-ai-frame]');
  const status = root.querySelector<HTMLElement>('[data-ai-status]');
  if (!toggle || !dialog || !frame || !url) return;

  let warmed = false;
  const warm = (): void => {
    if (warmed) return;
    warmed = true;
    // Wakes the sleeping host before the visitor opens the chat. Opaque response is fine.
    fetch(url, { mode: 'no-cors', referrerPolicy: 'no-referrer' }).catch(() => undefined);
  };

  const open = (): void => {
    if (dialog.open) return;
    warm();
    dialog.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('ai-open');
    if (!frame.src) {
      frame.addEventListener('load', () => status?.setAttribute('hidden', ''), { once: true });
      frame.src = url;
    }
    dialog.querySelector<HTMLElement>('[data-ai-close]')?.focus();
  };

  // Escape is handled natively by <dialog>; every way of closing ends up here.
  dialog.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('ai-open');
    toggle.focus();
  });

  toggle.addEventListener('click', open);
  dialog.querySelector('[data-ai-close]')?.addEventListener('click', () => dialog.close());

  // Backdrop click closes, but only when the press also started on the backdrop (not a drag out of the chat).
  let pressStartedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressStartedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    const onBackdrop = event.target === dialog && pressStartedOnBackdrop;
    pressStartedOnBackdrop = false;
    if (onBackdrop) dialog.close();
  });

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest('[data-open-chat]');
    if (!trigger) return;
    event.preventDefault();
    open();
  });

  // Pre-warm on first interaction or after a short idle, whichever comes first.
  const once = { once: true, passive: true } as const;
  window.addEventListener('scroll', warm, once);
  window.addEventListener('pointerdown', warm, once);
  window.setTimeout(warm, 4000);
}
