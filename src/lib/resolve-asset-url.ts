/** Resolve a site-relative asset path against the current page URL (works on http(s) and file://). */
export function resolveAssetUrl(path: string): string {
  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path;
  }
  if (typeof window !== "undefined") {
    try {
      return new URL(path, window.location.href).href;
    } catch {
      /* fall through */
    }
  }
  return path;
}
