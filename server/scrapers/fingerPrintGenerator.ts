/**
 * Creates a unique fingerprint string for duplicate detection
 */
export function generateFingerprint(
  title: string,
  employer: string,
  closingDate: string,
): string {
  const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(title)}-${clean(employer)}-${clean(closingDate)}`;
}
