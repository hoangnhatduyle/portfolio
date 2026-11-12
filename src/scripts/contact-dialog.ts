import { isHoneypotTripped, validateContact, type ContactErrors } from '../lib/contact';

const SUCCESS = 'Thanks! Your message is on its way. I will reply soon.';
const FAILURE = 'Something went wrong sending that. Please try again, or email me directly.';
const FIELDS = ['name', 'email', 'message'] as const;

interface Parts {
  readonly dialog: HTMLDialogElement;
  readonly form: HTMLFormElement;
  readonly status: HTMLElement | null;
  readonly submit: HTMLButtonElement | null;
}

type StatusState = 'success' | 'error' | '';

function findParts(): Parts | null {
  const dialog = document.querySelector<HTMLDialogElement>('[data-contact-dialog]');
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!dialog || !form) return null;
  return {
    dialog,
    form,
    status: form.querySelector<HTMLElement>('[data-form-status]'),
    submit: form.querySelector<HTMLButtonElement>('[data-submit]'),
  };
}

function setStatus(status: HTMLElement | null, text: string, state: StatusState): void {
  if (!status) return;
  status.textContent = text;
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}

function renderErrors(form: HTMLFormElement, errors: ContactErrors): void {
  for (const field of FIELDS) {
    const input = form.elements.namedItem(field) as HTMLInputElement | null;
    const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
    const message = errors[field] ?? '';
    if (slot) slot.textContent = message;
    if (!input) continue;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

/** Where focus should go when the dialog closes: the opener, unless it is hidden (e.g. a closed mobile menu). */
function focusTargetFor(opener: HTMLElement | null): HTMLElement | null {
  if (opener?.isConnected && opener.getClientRects().length > 0) return opener;
  return document.querySelector<HTMLElement>('[data-menu-toggle]');
}

function bindOpenClose({ dialog, form, status }: Parts, onClose: () => void): void {
  let opener: HTMLElement | null = null;
  let pressStartedOnBackdrop = false;

  const open = (from: HTMLElement): void => {
    opener = from;
    setStatus(status, '', '');
    renderErrors(form, {});
    if (!dialog.open) dialog.showModal();
    form.querySelector<HTMLElement>('input[name="name"]')?.focus();
  };

  document.addEventListener('click', (event) => {
    const trigger = (event.target as Element | null)?.closest<HTMLElement>('[data-open-contact]');
    if (!trigger) return;
    event.preventDefault();
    open(trigger);
  });

  // A drag that starts inside the dialog and ends on the backdrop is not a backdrop click.
  dialog.addEventListener('pointerdown', (event) => {
    pressStartedOnBackdrop = event.target === dialog;
  });
  dialog.addEventListener('click', (event) => {
    const target = event.target as Element;
    const onBackdrop = target === dialog && pressStartedOnBackdrop;
    pressStartedOnBackdrop = false;
    if (onBackdrop || target.closest('[data-close-contact]')) dialog.close();
  });
  dialog.addEventListener('close', () => {
    onClose();
    focusTargetFor(opener)?.focus();
  });
}

function bindSubmit({ form, status, submit }: Parts): () => void {
  let inFlight: AbortController | null = null;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const errors = validateContact({
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    });
    renderErrors(form, errors);
    if (Object.keys(errors).length > 0) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    // Bots fill the hidden field: pretend success and send nothing.
    if (isHoneypotTripped(String(data.get('_gotcha') ?? ''))) {
      setStatus(status, SUCCESS, 'success');
      form.reset();
      return;
    }

    inFlight?.abort();
    const controller = new AbortController();
    inFlight = controller;
    if (submit) submit.disabled = true;
    setStatus(status, 'Sending…', '');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
      setStatus(status, SUCCESS, 'success');
      form.reset();
    } catch (error) {
      // Aborted by closing the dialog: say nothing, so a stale result never shows on a reopened form.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus(status, FAILURE, 'error');
    } finally {
      if (inFlight === controller) inFlight = null;
      if (submit) submit.disabled = false;
    }
  });

  return () => inFlight?.abort();
}

export function initContactDialog(): void {
  const parts = findParts();
  if (!parts) return;
  const abortInFlight = bindSubmit(parts);
  bindOpenClose(parts, abortInFlight);
}
