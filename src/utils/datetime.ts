export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatListTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  if (isSameDay(date, now)) {
    return formatTime(timestamp);
  }
  const sameYear = date.getFullYear() === now.getFullYear();
  const label = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  return sameYear ? `${label}.` : `${label} ${date.getFullYear()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
