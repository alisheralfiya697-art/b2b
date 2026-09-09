/**
 * Helper to ensure URLs are properly formatted with protocol and display cleanly
 */
export function isValidWebUrl(raw?: string): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '#' || trimmed.length < 4) return false;
  // Exclude placeholder or invalid patterns
  if (trimmed.includes('example.com') || trimmed.includes('localhost')) return false;
  // Must contain at least one dot in domain part
  const noProtocol = trimmed.replace(/^https?:\/\//i, '');
  const domainPart = noProtocol.split('/')[0];
  if (!domainPart || !domainPart.includes('.') || domainPart.includes(' ')) return false;
  // Must end with at least a 2-char TLD
  if (!/\.[a-z]{2,}(?::\d+)?$/i.test(domainPart)) return false;
  return true;
}

/**
 * Returns the clean, canonical MAIN root URL of the website (e.g. https://www.dharmashop.com)
 * Strips out messy subpaths, expired query params, or duplicate paths so clicking opens the official homepage.
 */
export function canonicalMainUrl(raw?: string): string {
  if (!raw || !isValidWebUrl(raw)) return '';
  let trimmed = raw.trim();
  let protocol = 'https://';
  if (/^http:\/\//i.test(trimmed)) {
    protocol = 'http://';
  }
  
  const cleanDomain = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^\/+/, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .trim();

  if (!cleanDomain) return '';
  return `${protocol}${cleanDomain}`;
}

export function ensureValidUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '#') return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Cleanly format a domain for display (e.g. www.dharmashop.com)
 */
export function formatDisplayDomain(raw?: string): string {
  if (!raw) return '';
  const clean = raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/\/$/, '');
  
  return clean;
}

