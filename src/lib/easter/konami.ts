export const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'] as const;
export const KONAMI_STR = 'ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA BA konami';
export function isKonamiSequence(keys: string[]): boolean {
  if (keys.length < KONAMI.length) return false;
  const tail = keys.slice(-KONAMI.length);
  return tail.every((k, i) => k === KONAMI[i]);
}
export function useKonami(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  let buffer: string[] = [];
  const handler = (e: KeyboardEvent) => {
    buffer.push(e.code);
    if (buffer.length > KONAMI.length) buffer = buffer.slice(-KONAMI.length);
    if (isKonamiSequence(buffer)) {
      buffer = [];
      callback();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
