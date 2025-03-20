export function GenerateRandomId(prefix?: string): string {
  return `${prefix ? prefix : 'GUEST'}-${Date.now()}-${Math.floor(
    Math.random() * 100000
  )}`;
}
