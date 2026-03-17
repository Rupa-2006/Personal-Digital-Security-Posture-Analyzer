import { create } from 'zustand';
import type { AccountInfo, BreachResult, Badge } from './security';

interface SecurityState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  accounts: AccountInfo[];
  breaches: BreachResult[];
  securityScore: number;
  scoreHistory: { date: string; score: number }[];
  badges: Badge[];
  darkWebAlerts: { id: string; type: string; detail: string; severity: 'low' | 'medium' | 'high' | 'critical' }[];
  login: (name: string, email: string) => void;
  logout: () => void;
  setAccounts: (accounts: AccountInfo[]) => void;
  setBreaches: (breaches: BreachResult[]) => void;
  setSecurityScore: (score: number) => void;
  addScoreHistory: (score: number) => void;
  setBadges: (badges: Badge[]) => void;
  setDarkWebAlerts: (alerts: SecurityState['darkWebAlerts']) => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  isLoggedIn: false,
  userName: '',
  userEmail: '',
  accounts: [],
  breaches: [],
  securityScore: 0,
  scoreHistory: [],
  badges: [],
  darkWebAlerts: [],
  login: (name, email) => set({ isLoggedIn: true, userName: name, userEmail: email }),
  logout: () => set({ isLoggedIn: false, userName: '', userEmail: '', accounts: [], breaches: [], securityScore: 0, scoreHistory: [], badges: [], darkWebAlerts: [] }),
  setAccounts: (accounts) => set({ accounts }),
  setBreaches: (breaches) => set({ breaches }),
  setSecurityScore: (score) => set({ securityScore: score }),
  addScoreHistory: (score) => set((state) => ({
    scoreHistory: [...state.scoreHistory, { date: new Date().toLocaleDateString(), score }]
  })),
  setBadges: (badges) => set({ badges }),
  setDarkWebAlerts: (alerts) => set({ darkWebAlerts: alerts }),
}));
