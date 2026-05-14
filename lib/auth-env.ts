/**
 * Reads candidate site passwords from the environment (unique, order preserved).
 * Multiple vars (e.g. legacy SITE_* plus VERCEL_*) are all accepted so one stale var
 * does not shadow the password you actually use.
 */
export function normalizeSecret(value: string): string {
  return value.replace(/^\uFEFF/, "").trim();
}

export function getSitePasswordCandidates(): string[] {
  const raw = [
    process.env.SITE_ACCESS_PASSWORD,
    process.env.SITE_BASIC_AUTH_PASSWORD,
    process.env.BASIC_AUTH_PASSWORD,
    process.env.VERCEL_BASIC_AUTH_PASSWORD,
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of raw) {
    if (v === undefined || v === null) {
      continue;
    }
    const t = normalizeSecret(String(v));
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}
