export function normalizePhoneToChatId(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  return `${digits}@c.us`;
}

export function chatIdToPhone(chatId: string): string {
  return chatId.replace(/@c\.us$/, '');
}

export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }
  if (!digits) {
    return '';
  }
  if (!digits.startsWith('7')) {
    return `+${digits.slice(0, 15)}`;
  }
  const group1 = digits.slice(1, 4);
  const group2 = digits.slice(4, 7);
  const group3 = digits.slice(7, 9);
  const group4 = digits.slice(9, 11);
  let result = '+7';
  if (group1) {
    result += ` (${group1}${group1.length === 3 ? ')' : ''}`;
  }
  if (group2) {
    result += ` ${group2}`;
  }
  if (group3) {
    result += `-${group3}`;
  }
  if (group4) {
    result += `-${group4}`;
  }
  return result;
}
