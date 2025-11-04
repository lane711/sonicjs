export function formatMilliseconds(ms: number): string {
  if (ms <= 0) return '0 seconds';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  if (hours % 24 > 0) {
    parts.push(`${hours % 24} ${hours % 24 === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes % 60 > 0) {
    parts.push(`${minutes % 60} ${minutes % 60 === 1 ? 'minute' : 'minutes'}`);
  }
  if (seconds % 60 > 0 && parts.length === 0) {
    parts.push(`${seconds % 60} ${seconds % 60 === 1 ? 'second' : 'seconds'}`);
  }

  return parts.join(' and ');
}
