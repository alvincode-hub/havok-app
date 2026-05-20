export function isLocalHostUrl(value: string) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return ["127.0.0.1", "10.0.2.2", "localhost"].includes(parsed.hostname);
  } catch {
    return false;
  }
}
