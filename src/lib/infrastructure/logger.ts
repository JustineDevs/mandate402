export type LogLevel = "info" | "warn" | "error";

export function logEvent(
  level: LogLevel,
  event: string,
  metadata: Record<string, string | number | boolean | null | undefined>,
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...metadata,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}
