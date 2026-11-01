// Password strength analysis
export interface PasswordAnalysis {
  score: number; // 0-100
  label: 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  details: { criterion: string; met: boolean; points: number }[];
  crackTime: string;
}

export function analyzePassword(password: string): PasswordAnalysis {
  const details = [
    { criterion: 'At least 8 characters', met: password.length >= 8, points: 15 },
    { criterion: 'At least 12 characters', met: password.length >= 12, points: 10 },
    { criterion: 'At least 16 characters', met: password.length >= 16, points: 10 },
    { criterion: 'Contains uppercase letters', met: /[A-Z]/.test(password), points: 15 },
    { criterion: 'Contains lowercase letters', met: /[a-z]/.test(password), points: 10 },
    { criterion: 'Contains numbers', met: /\d/.test(password), points: 15 },
    { criterion: 'Contains special characters', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), points: 15 },
    { criterion: 'No common patterns', met: !/(123|abc|password|qwerty|admin)/i.test(password), points: 10 },
  ];

  const score = Math.min(100, details.reduce((s, d) => s + (d.met ? d.points : 0), 0));
  const label = score < 30 ? 'Weak' : score < 60 ? 'Medium' : score < 85 ? 'Strong' : 'Very Strong';

  const charsetSize = (/[a-z]/.test(password) ? 26 : 0) + (/[A-Z]/.test(password) ? 26 : 0) +
    (/\d/.test(password) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(password) ? 33 : 0);
  const combos = Math.pow(charsetSize || 1, password.length);
  const seconds = combos / 1e10;
  const crackTime = seconds < 1 ? 'Instantly' : seconds < 60 ? `${Math.round(seconds)} seconds` :
    seconds < 3600 ? `${Math.round(seconds / 60)} minutes` : seconds < 86400 ? `${Math.round(seconds / 3600)} hours` :
    seconds < 31536000 ? `${Math.round(seconds / 86400)} days` : seconds < 31536000 * 1000 ? `${Math.round(seconds / 31536000)} years` : 'Millions of years';

  return { score, label, details, crackTime };
}

// ---------------------------------------------------------------------------
// Password generator
// Uses the Web Crypto API (crypto.getRandomValues), which is cryptographically
// secure. Math.random() is NOT safe for passwords: its output can be predicted.
// ---------------------------------------------------------------------------
export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

export type GeneratorOptions = { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean };

/** Uniform random integer in [0, max) without modulo bias (rejection sampling). */
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 2 ** 32) throw new RangeError('max must be 1..2^32');
  const limit = Math.floor(2 ** 32 / max) * max; // values >= limit would bias the result
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

export function generatePassword(
  length: number = 16,
  options: GeneratorOptions = { upper: true, lower: true, numbers: true, symbols: true },
): string {
  const sets = (Object.keys(CHARSETS) as (keyof GeneratorOptions)[])
    .filter((k) => options[k])
    .map((k) => CHARSETS[k]);
  if (sets.length === 0) sets.push(CHARSETS.lower);
  const len = Math.max(length, sets.length);
  const all = sets.join('');

  // One character from every selected set, so the result always meets the rules...
  const chars = sets.map((set) => set[secureRandomInt(set.length)]);
  // ...then fill the rest from the combined set.
  while (chars.length < len) chars.push(all[secureRandomInt(all.length)]);

  // Fisher-Yates shuffle so the guaranteed characters aren't always at the start.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// ---------------------------------------------------------------------------
// Phishing URL heuristics (offline, rule-based)
// ---------------------------------------------------------------------------
const OFFICIAL_DOMAINS: Record<string, string[]> = {
  google: ['google.com', 'google.co.in'],
  microsoft: ['microsoft.com', 'live.com', 'office.com'],
  apple: ['apple.com', 'icloud.com'],
  amazon: ['amazon.com', 'amazon.in'],
  paypal: ['paypal.com'],
  facebook: ['facebook.com'],
  instagram: ['instagram.com'],
  netflix: ['netflix.com'],
  sbi: ['sbi.co.in', 'onlinesbi.sbi'],
  hdfc: ['hdfcbank.com'],
  icici: ['icicibank.com'],
  paytm: ['paytm.com'],
};

const isOnDomain = (host: string, domain: string) => host === domain || host.endsWith('.' + domain);

export function analyzeUrl(url: string): { risk: 'Safe' | 'Suspicious' | 'Dangerous'; reasons: string[] } {
  const reasons: string[] = [];
  let severe = 0; // strong phishing signals count as "Dangerous" on their own
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (u.protocol !== 'https:') reasons.push('Not using HTTPS');
    if (host.split('.').length > 4) reasons.push('Excessive subdomains');
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[')) reasons.push('IP address instead of domain');
    const plainLabels = host.split('.').filter((label) => !label.startsWith('xn--'));
    if (plainLabels.join('.').split('-').length > 3) reasons.push('Suspicious hyphenated domain');
    if (u.pathname.length > 100) reasons.push('Unusually long path');
    if (u.username || u.password) {
      reasons.push('Contains @ (credentials) before the domain — the real site is after the @');
      severe++;
    }
    // The URL parser converts look-alike Unicode letters to punycode ("xn--").
    if (host.split('.').some((label) => label.startsWith('xn--'))) {
      reasons.push('Internationalised (punycode) domain — possible look-alike / homograph attack');
      severe++;
    }
    for (const [brand, domains] of Object.entries(OFFICIAL_DOMAINS)) {
      if (host.includes(brand) && !domains.some((d) => isOnDomain(host, d))) {
        reasons.push(`Uses the name "${brand}" but is not an official ${brand} domain`);
        severe++;
        break;
      }
    }
    const keywords = ['login', 'verify', 'secure', 'update', 'confirm', 'account', 'banking', 'kyc'];
    const isOfficial = Object.values(OFFICIAL_DOMAINS).flat().some((d) => isOnDomain(host, d));
    if (!isOfficial && keywords.some((w) => host.includes(w))) reasons.push('Suspicious keywords in domain');
  } catch {
    reasons.push('Invalid URL format');
  }
  const risk = reasons.length === 0 ? 'Safe' : severe > 0 || reasons.length > 2 ? 'Dangerous' : 'Suspicious';
  return { risk, reasons };
}

// ---------------------------------------------------------------------------
// Real breach check: Have I Been Pwned "Pwned Passwords" range API
// k-anonymity: only the first 5 hex characters of the SHA-1 hash are sent.
// The password itself (and its full hash) never leaves the browser.
// Docs: https://haveibeenpwned.com/API/v3#PwnedPasswords
// ---------------------------------------------------------------------------
export async function sha1Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Parse the API's "SUFFIX:COUNT" lines and return the count for our suffix (0 if absent). */
export function findSuffixCount(body: string, suffix: string): number {
  for (const line of body.split('\n')) {
    const [s, c] = line.trim().split(':');
    if (s && s.toUpperCase() === suffix) return parseInt(c, 10) || 0;
  }
  return 0;
}

/** Returns how many times the password appears in known breaches (0 = not found). */
export async function checkPwnedPassword(password: string, fetchFn: typeof fetch = fetch): Promise<number> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const res = await fetchFn(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }, // padding hides how many results came back
  });
  if (!res.ok) throw new Error(`Breach service returned ${res.status}`);
  return findSuffixCount(await res.text(), hash.slice(5));
}

/** A password that was found in a known breach. */
export interface BreachResult {
  name: string;      // what was checked, e.g. the account name
  date: string;      // when it was checked
  dataTypes: string[];
  count: number;     // times seen in breaches
}

// ---------------------------------------------------------------------------
// Password reuse detection without storing passwords
// HMAC-SHA-256 with a random key that exists only in memory for this session,
// so the stored fingerprints can't be reversed or compared across sessions.
// (The old version used btoa(), which is Base64 encoding — trivially reversible.)
// ---------------------------------------------------------------------------
let sessionKey: Promise<CryptoKey> | null = null;
function getSessionKey(): Promise<CryptoKey> {
  sessionKey ??= crypto.subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return sessionKey;
}

export async function passwordFingerprint(password: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await getSessionKey(), new TextEncoder().encode(password));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Account and security score
export interface AccountInfo {
  id: string;
  name: string;
  email: string;
  passwordStrength: number;
  mfaEnabled: boolean;
  passwordHash: string; // HMAC fingerprint, see passwordFingerprint()
  pwnedCount: number | null; // times seen in breaches; null if the check failed
  lastChanged: string;
}

export function calculateSecurityScore(accounts: AccountInfo[], breachCount: number): number {
  if (accounts.length === 0) return 50;
  const avgStrength = accounts.reduce((s, a) => s + a.passwordStrength, 0) / accounts.length;
  const mfaRate = accounts.filter(a => a.mfaEnabled).length / accounts.length;
  const uniquePasswords = new Set(accounts.map(a => a.passwordHash)).size;
  const reuseRate = 1 - (uniquePasswords / accounts.length);
  const breachPenalty = Math.min(30, breachCount * 10);
  return Math.max(0, Math.min(100, Math.round(
    avgStrength * 0.3 + mfaRate * 100 * 0.25 + (1 - reuseRate) * 100 * 0.2 + (100 - breachPenalty) * 0.25
  )));
}

// Brute force simulation (an estimate, assuming 10 billion guesses per second)
export function simulateBruteForce(password: string, onProgress: (p: number, attempts: number) => void): Promise<{ attempts: number; timeTaken: number }> {
  return new Promise((resolve) => {
    const totalSteps = 50;
    const charsetSize = (/[a-z]/.test(password) ? 26 : 0) + (/[A-Z]/.test(password) ? 26 : 0) +
      (/\d/.test(password) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(password) ? 33 : 0);
    const totalCombos = Math.pow(charsetSize || 26, password.length);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const attempts = Math.floor(totalCombos * progress);
      onProgress(Math.min(progress * 100, 100), attempts);
      if (step >= totalSteps) {
        clearInterval(interval);
        resolve({ attempts: totalCombos, timeTaken: totalCombos / 1e10 });
      }
    }, 80);
  });
}

// Security badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export function evaluateBadges(score: number, accounts: AccountInfo[], breachCount: number): Badge[] {
  const mfaAll = accounts.length > 0 && accounts.every(a => a.mfaEnabled);
  const strongAll = accounts.length > 0 && accounts.every(a => a.passwordStrength >= 80);
  const noReuse = accounts.length > 0 && new Set(accounts.map(a => a.passwordHash)).size === accounts.length;
  return [
    { id: 'first-scan', name: 'First Scan', description: 'Completed your first security scan', icon: '🔍', earned: accounts.length > 0 },
    { id: 'mfa-hero', name: 'MFA Hero', description: 'Enabled MFA on all accounts', icon: '🛡️', earned: mfaAll },
    { id: 'strong-pass', name: 'Strong Passwords', description: 'All passwords rated Strong+', icon: '💪', earned: strongAll },
    { id: 'no-reuse', name: 'Unique Passwords', description: 'No password reuse detected', icon: '🔑', earned: noReuse },
    { id: 'clean-record', name: 'Clean Record', description: 'None of your passwords found in known breaches', icon: '✨', earned: breachCount === 0 },
    { id: 'score-90', name: 'Security Elite', description: 'Security score above 90', icon: '🏆', earned: score >= 90 },
    { id: 'score-70', name: 'Security Aware', description: 'Security score above 70', icon: '🎯', earned: score >= 70 },
    { id: 'five-accounts', name: 'Thorough Scanner', description: 'Added 5+ accounts', icon: '📋', earned: accounts.length >= 5 },
  ];
}
