import { create } from 'zustand';
import type { AccountInfo, BreachResult, Badge } from './security';

// Everything lives in memory only: nothing is saved to localStorage or sent to a
// server, so closing or refreshing the tab clears it. Passwords themselves are
// never stored — only an HMAC fingerprint (see passwordFingerprint()).
interface SecurityState {
  isLoggedIn: boolean;
  userName: string;
  accounts: AccountInfo[];
  breaches: BreachResult[];
  securityScore: number;
  scoreHistory: { date: string; score: number }[];
  badges: Badge[];
  login: (name: string) => void;
  logout: () => void;
  setAccounts: (accounts: AccountInfo[]) => void;
  setBreaches: (breaches: BreachResult[]) => void;
  setSecurityScore: (score: number) => void;
  addScoreHistory: (score: number) => void;
  setBadges: (badges: Badge[]) => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  isLoggedIn: false,
  userName: '',
  accounts: [],
  breaches: [],
  securityScore: 0,
  scoreHistory: [],
  badges: [],
  login: (name) => set({ isLoggedIn: true, userName: name }),
  logout: () => set({ isLoggedIn: false, userName: '', accounts: [], breaches: [], securityScore: 0, scoreHistory: [], badges: [] }),
  setAccounts: (accounts) => set({ accounts }),
  setBreaches: (breaches) => set({ breaches }),
  setSecurityScore: (score) => set({ securityScore: score }),
  addScoreHistory: (score) => set((state) => ({
    scoreHistory: [...state.scoreHistory, { date: new Date().toLocaleTimeString(), score }]
  })),
  setBadges: (badges) => set({ badges }),
}));

/** Breaches derived from accounts whose password was found by the HIBP check. */
export function breachesFromAccounts(accounts: AccountInfo[]): BreachResult[] {
  return accounts
    .filter((a) => (a.pwnedCount ?? 0) > 0)
    .map((a) => ({
      name: a.name,
      date: new Date(a.lastChanged).toLocaleDateString(),
      dataTypes: ['Password'],
      count: a.pwnedCount ?? 0,
    }));
}
