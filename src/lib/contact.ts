export interface ContactInput {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 5000;

// Pragmatic check (something@domain.tld, no spaces); the server is the real authority.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Returns a map of field -> message for every invalid field; an empty object means valid. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: { -readonly [K in keyof ContactInput]?: string } = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';
  if (message.length < MESSAGE_MIN) {
    errors.message = `Please write at least ${MESSAGE_MIN} characters.`;
  } else if (message.length > MESSAGE_MAX) {
    errors.message = `Please keep the message under ${MESSAGE_MAX} characters.`;
  }
  return errors;
}

/** The hidden "_gotcha" field must stay empty; humans never see it. */
export function isHoneypotTripped(value: string | null): boolean {
  return value !== null && value.trim().length > 0;
}
