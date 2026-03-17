import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Key, Search, AlertTriangle, Lock, Globe, Fingerprint, MessageSquare, FileText, Zap, Trophy, Eye, LogOut } from 'lucide-react';
import { useSecurityStore } from '@/lib/store';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/password-analyzer', label: 'Password Analyzer', icon: Key },
  { path: '/dashboard/breach-lookup', label: 'Breach Lookup', icon: Search },
  { path: '/dashboard/accounts', label: 'Account Manager', icon: Lock },
  { path: '/dashboard/phishing', label: 'Phishing Detector', icon: AlertTriangle },
  { path: '/dashboard/password-gen', label: 'Password Generator', icon: Zap },
  { path: '/dashboard/brute-force', label: 'Attack Simulator', icon: Globe },
  { path: '/dashboard/footprint', label: 'Digital Footprint', icon: Fingerprint },
  { path: '/dashboard/dark-web', label: 'Dark Web Monitor', icon: Eye },
  { path: '/dashboard/badges', label: 'Badges', icon: Trophy },
  { path: '/dashboard/ai-advisor', label: 'AI Advisor', icon: MessageSquare },
  { path: '/dashboard/report', label: 'Security Report', icon: FileText },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useSecurityStore((s) => s.logout);
  const userName = useSecurityStore((s) => s.userName);

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-card/50 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg border border-primary/30 flex items-center justify-center pulse-neon">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground neon-text">SecureGuard</h1>
          <p className="text-xs text-muted-foreground">Security Analyzer</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-foreground truncate max-w-[120px]">{userName}</span>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
