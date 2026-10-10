export const isClock = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value));
export const clockDraft = value => String(value).replace(/[^\d:]/g, '').slice(0, 5);
export function completeClock(value) {
  const text = String(value);
  const clock = /^\d{4}$/.test(text) ? `${text.slice(0, 2)}:${text.slice(2)}` : text;
  return isClock(clock) ? clock : null;
}
export const phoneDraft = value => String(value).replace(/[^\d+()\s-]/g, '');
export const isWholeNumber = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));
