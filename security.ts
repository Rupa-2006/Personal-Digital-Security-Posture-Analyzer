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

// Generate strong password
export function generatePassword(length: number = 16, options = { upper: true, lower: true, numbers: true, symbols: true }): string {
  let chars = '';
  if (options.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.numbers) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  let pw = '';
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

// Phishing detection
export function analyzeUrl(url: string): { risk: 'Safe' | 'Suspicious' | 'Dangerous'; reasons: string[] } {
  const reasons: string[] = [];
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') reasons.push('Not using HTTPS');
    if (u.hostname.split('.').length > 4) reasons.push('Excessive subdomains');
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(u.hostname)) reasons.push('IP address instead of domain');
    if (u.hostname.includes('-') && u.hostname.split('-').length > 3) reasons.push('Suspicious hyphenated domain');
    if (u.pathname.length > 100) reasons.push('Unusually long path');
    if (/@/.test(u.href.split('?')[0])) reasons.push('Contains @ symbol in URL');
    const suspicious = ['login', 'verify', 'secure', 'update', 'confirm', 'account', 'banking'];
    if (suspicious.some(w => u.hostname.includes(w) && !['google', 'microsoft', 'apple', 'amazon'].some(d => u.hostname.includes(d))))
      reasons.push('Suspicious keywords in domain');
    if (/[а-яА-ЯёЁ]/.test(u.hostname)) reasons.push('Contains non-Latin characters (homograph attack)');
  } catch {
    reasons.push('Invalid URL format');
  }
  const risk = reasons.length === 0 ? 'Safe' : reasons.length <= 2 ? 'Suspicious' : 'Dangerous';
  return { risk, reasons };
}

// Simulated breach data
export interface BreachResult {
  name: string;
  date: string;
  dataTypes: string[];
  count: number;
}

export function simulateBreachCheck(email: string): BreachResult[] {
  const hash = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const allBreaches: BreachResult[] = [
    { name: 'SocialMediaCorp', date: '2023-08-15', dataTypes: ['Email', 'Password', 'Username'], count: 14200000 },
    { name: 'RetailChain', date: '2022-03-22', dataTypes: ['Email', 'Phone', 'Address'], count: 8500000 },
    { name: 'GamingPlatform', date: '2024-01-10', dataTypes: ['Email', 'Password', 'IP Address'], count: 3200000 },
    { name: 'FinanceApp', date: '2023-11-05', dataTypes: ['Email', 'SSN', 'Banking Info'], count: 950000 },
    { name: 'CloudStorage', date: '2022-07-18', dataTypes: ['Email', 'Files', 'Password'], count: 22000000 },
    { name: 'HealthTracker', date: '2024-02-28', dataTypes: ['Email', 'Health Data', 'Location'], count: 1800000 },
  ];
  const count = (hash % 4);
  return allBreaches.slice(0, count);
}

// Account and security score
export interface AccountInfo {
  id: string;
  name: string;
  email: string;
  passwordStrength: number;
  mfaEnabled: boolean;
  passwordHash: string;
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

// Brute force simulation
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
      const attempts = Math.floor(totalCombos * progress * (Math.random() * 0.1 + 0.95));
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
    { id: 'clean-record', name: 'Clean Record', description: 'No breaches detected', icon: '✨', earned: breachCount === 0 },
    { id: 'score-90', name: 'Security Elite', description: 'Security score above 90', icon: '🏆', earned: score >= 90 },
    { id: 'score-70', name: 'Security Aware', description: 'Security score above 70', icon: '🎯', earned: score >= 70 },
    { id: 'five-accounts', name: 'Thorough Scanner', description: 'Added 5+ accounts', icon: '📋', earned: accounts.length >= 5 },
  ];
}

// Digital footprint simulation
export function simulateDigitalFootprint(query: string): { source: string; info: string; risk: 'Low' | 'Medium' | 'High' }[] {
  const hash = query.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const results = [
    { source: 'Social Media', info: 'Profile found on 3 platforms', risk: 'Medium' as const },
    { source: 'Data Broker', info: 'Personal info listed on people-search sites', risk: 'High' as const },
    { source: 'Forum Posts', info: 'Email appeared in 2 public forums', risk: 'Low' as const },
    { source: 'Paste Sites', info: 'Credentials found in a paste dump', risk: 'High' as const },
    { source: 'Domain Registration', info: 'WHOIS records expose contact info', risk: 'Medium' as const },
    { source: 'Job Boards', info: 'Resume found on job platforms', risk: 'Low' as const },
  ];
  return results.slice(0, (hash % 4) + 2);
}
