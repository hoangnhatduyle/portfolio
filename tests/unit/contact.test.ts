import { describe, expect, test } from 'vitest';
import { isHoneypotTripped, validateContact } from '../../src/lib/contact';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'Hi, I would love to chat about your research.',
};

describe('validateContact', () => {
  test('returns no errors for a valid submission', () => {
    expect(validateContact(valid)).toEqual({});
  });

  test('requires a name', () => {
    expect(validateContact({ ...valid, name: '   ' }).name).toBeDefined();
  });

  test.each(['', 'not-an-email', 'a@b', 'a b@c.com'])('rejects invalid email %j', (email) => {
    expect(validateContact({ ...valid, email }).email).toBeDefined();
  });

  test('accepts a normal email with a plus tag and subdomain', () => {
    expect(validateContact({ ...valid, email: 'ada+hi@mail.example.co' }).email).toBeUndefined();
  });

  test('requires a message of at least 10 characters', () => {
    expect(validateContact({ ...valid, message: 'short' }).message).toBeDefined();
    expect(validateContact({ ...valid, message: '0123456789' }).message).toBeUndefined();
  });

  test('caps the message length', () => {
    expect(validateContact({ ...valid, message: 'x'.repeat(5001) }).message).toBeDefined();
  });

  test('reports every invalid field at once', () => {
    expect(Object.keys(validateContact({ name: '', email: '', message: '' })).sort()).toEqual([
      'email',
      'message',
      'name',
    ]);
  });

  test('does not mutate its input', () => {
    const input = Object.freeze({ ...valid });
    expect(() => validateContact(input)).not.toThrow();
  });
});

describe('isHoneypotTripped', () => {
  test('is false for an empty or whitespace field', () => {
    expect(isHoneypotTripped('')).toBe(false);
    expect(isHoneypotTripped('   ')).toBe(false);
    expect(isHoneypotTripped(null)).toBe(false);
  });

  test('is true when a bot filled the hidden field', () => {
    expect(isHoneypotTripped('http://spam.example')).toBe(true);
  });
});
