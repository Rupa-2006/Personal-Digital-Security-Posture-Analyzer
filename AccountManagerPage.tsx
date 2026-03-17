import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Shield, AlertTriangle, Lock } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { analyzePassword, calculateSecurityScore, evaluateBadges } from '@/lib/security';
import { useSecurityStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { AccountInfo } from '@/lib/security';

export default function AccountManagerPage() {
  const { accounts, setAccounts, breaches, setSecurityScore, addScoreHistory, setBadges } = useSecurityStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfa, setMfa] = useState(false);

  const addAccount = () => {
    if (!name || !email || !password) return;
    const analysis = analyzePassword(password);
    const newAccount: AccountInfo = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordStrength: analysis.score,
      mfaEnabled: mfa,
      passwordHash: btoa(password).slice(0, 12),
      lastChanged: new Date().toISOString(),
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    const score = calculateSecurityScore(updated, breaches.length);
    setSecurityScore(score);
    addScoreHistory(score);
    setBadges(evaluateBadges(score, updated, breaches.length));
    setName('');
    setEmail('');
    setPassword('');
    setMfa(false);
  };

  const removeAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    const score = calculateSecurityScore(updated, breaches.length);
    setSecurityScore(score);
    setBadges(evaluateBadges(score, updated, breaches.length));
  };

  const toggleMfa = (id: string) => {
    const updated = accounts.map(a => a.id === id ? { ...a, mfaEnabled: !a.mfaEnabled } : a);
    setAccounts(updated);
    const score = calculateSecurityScore(updated, breaches.length);
    setSecurityScore(score);
    addScoreHistory(score);
    setBadges(evaluateBadges(score, updated, breaches.length));
  };

  // Detect reuse
  const passwordGroups = accounts.reduce<Record<string, string[]>>((acc, a) => {
    (acc[a.passwordHash] = acc[a.passwordHash] || []).push(a.name);
    return acc;
  }, {});
  const reusedGroups = Object.entries(passwordGroups).filter(([, names]: [string, string[]]) => names.length > 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Lock className="w-6 h-6 text-primary" />
          Account Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Add accounts to analyze password reuse and MFA coverage</p>
      </div>

      {/* Add Account Form */}
      <GlowCard>
        <h3 className="text-sm font-semibold text-foreground mb-4">Add Account</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Account name (e.g., Gmail)" value={name} onChange={e => setName(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={mfa} onChange={e => setMfa(e.target.checked)} className="accent-primary" />
              MFA Enabled
            </label>
            <Button onClick={addAccount} disabled={!name || !email || !password} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>
      </GlowCard>

      {/* Reuse Warning */}
      {reusedGroups.length > 0 && (
        <GlowCard variant="red">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">Password Reuse Detected!</h3>
          </div>
          {reusedGroups.map(([, names]: [string, string[]]) => (
            <p key={(names as string[]).join(',')} className="text-xs text-muted-foreground">
              Shared password: <span className="text-foreground">{(names as string[]).join(', ')}</span>
            </p>
          ))}
        </GlowCard>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((acc, i) => (
          <motion.div key={acc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <GlowCard variant={acc.passwordStrength < 50 ? 'red' : acc.mfaEnabled ? 'default' : 'cyan'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    acc.passwordStrength >= 80 ? 'bg-success/20 text-success' : acc.passwordStrength >= 50 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {acc.passwordStrength}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{acc.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{acc.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleMfa(acc.id)} className={`text-xs px-2 py-1 rounded border ${acc.mfaEnabled ? 'border-success/30 text-success bg-success/10' : 'border-warning/30 text-warning bg-warning/10'}`}>
                    <Shield className="w-3 h-3 inline mr-1" />
                    {acc.mfaEnabled ? 'MFA ON' : 'MFA OFF'}
                  </button>
                  <button onClick={() => removeAccount(acc.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        ))}
        {accounts.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No accounts added yet. Add your first account above.</p>
        )}
      </div>
    </div>
  );
}
