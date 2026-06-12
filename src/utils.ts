/**
 * Normalizes Instagram URLs by stripping tracking parameters, trailing /embed,
 * converting reels to reel, and ensuring proper subdomain and slash formatting.
 */
export function normalizeInstagramUrl(url: string): string {
  let normalized = url || '';
  normalized = normalized.split('?')[0].split('#')[0]; // Strip tracking query/hash parameters
  normalized = normalized.replace(/(\/embed\/?)+$/, ''); // Strip all existing trailing /embed segments
  normalized = normalized.replace('/reels/', '/reel/'); // Normalize plural /reels/ to singular /reel/ for embed compatibility
  if (normalized.includes('instagram.com') && !normalized.includes('www.instagram.com')) {
    normalized = normalized.replace('instagram.com', 'www.instagram.com');
  }
  if (!normalized.endsWith('/')) normalized += '/';
  return normalized;
}

/**
 * Escapes special HTML characters in user inputs to prevent XSS injection
 * when constructing raw HTML strings.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes URLs to prevent XSS attacks (e.g. javascript:, data:, vbscript:, file: protocols).
 * Returns '#' if the URL is invalid or uses an unsafe protocol.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  // Block unsafe protocols: javascript:, data:, vbscript:, file:
  if (trimmed.match(/^(javascript|data|vbscript|file):/i)) {
    return '#';
  }
  
  // Verify it starts with a safe prefix or is a relative/protocol-relative URL
  const isSafeProtocol = trimmed.match(/^(https?|mailto|tel|sms):/i) || trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('.') || trimmed.startsWith('//');
  if (!isSafeProtocol) {
    return '#';
  }
  
  return trimmed;
}

 
 
 