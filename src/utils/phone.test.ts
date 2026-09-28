import { describe, expect, it } from 'vitest';
import { chatIdToPhone, formatPhoneInput, normalizePhoneToChatId } from './phone';

describe('normalizePhoneToChatId', () => {
  it('should convert a plain digits phone number to chatId', () => {
    expect(normalizePhoneToChatId('79991234567')).toBe('79991234567@c.us');
  });

  it('should strip formatting characters before conversion', () => {
    expect(normalizePhoneToChatId('+7 (999) 123-45-67')).toBe('79991234567@c.us');
  });

  it('should return null for a number shorter than 10 digits', () => {
    expect(normalizePhoneToChatId('12345')).toBeNull();
  });

  it('should return null for a number longer than 15 digits', () => {
    expect(normalizePhoneToChatId('1234567890123456')).toBeNull();
  });
});

describe('chatIdToPhone', () => {
  it('should strip the @c.us suffix', () => {
    expect(chatIdToPhone('79991234567@c.us')).toBe('79991234567');
  });
});

describe('formatPhoneInput', () => {
  it('should format a Russian number as +7 (XXX) XXX-XX-XX while typing', () => {
    expect(formatPhoneInput('79536996906')).toBe('+7 (953) 699-69-06');
  });

  it('should normalize a leading 8 to +7', () => {
    expect(formatPhoneInput('89536996906')).toBe('+7 (953) 699-69-06');
  });

  it('should keep the partial mask for an incomplete number', () => {
    expect(formatPhoneInput('7912')).toBe('+7 (912)');
    expect(formatPhoneInput('79')).toBe('+7 (9');
  });

  it('should format a foreign number with a plain plus prefix', () => {
    expect(formatPhoneInput('12125550123')).toBe('+12125550123');
  });

  it('should return an empty string for input without digits', () => {
    expect(formatPhoneInput('+')).toBe('');
  });
});
