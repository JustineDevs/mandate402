export function isFutureIsoTimestamp(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return false;
  }

  return new Date(parsed).toISOString() === value && parsed > Date.now();
}
