/**
 * Alle niet-lege site-wachtwoorden uit de omgeving (uniek, volgorde behouden).
 * Meerdere vars tegelijk ingesteld (bv. oude SITE_* + VERCEL_*) zorgden ervoor dat
 * alleen de eerste werd gebruikt — dan "klopt" je wachtwoord in een andere var niet.
 */
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
    const t = v?.trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}
