import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { simulateBreachCheck } from '@/lib/security';
import { useSecurityStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { BreachResult } from '@/lib/security';

export default function BreachLookupPage() {
  const [email, setEmail] = useState('');
  const [results, setResults] = useState<BreachResult[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const setBreaches = useSecurityStore((s) => s.setBreaches);

  const handleCheck = () => {
    setScanning(true);
    setResults(null);
    setTimeout(() => {
      const breaches = simulateBreachCheck(email);
      setResults(breaches);
      setBreaches(breaches);
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Search className="w-6 h-6 text-primary" />
          Breach Lookup
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Check if your email has been compromised</p>
      </div>

      <GlowCard>
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono"
          />
          <Button onClick={handleCheck} disabled={!email || scanning} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            {scanning ? 'Scanning...' : 'Check'}
          </Button>
        </div>
      </GlowCard>

      {scanning && (
        <GlowCard variant="cyan">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-mono">Scanning breach databases...</span>
          </div>
          <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
          </div>
        </GlowCard>
      )}

      {results !== null && !scanning && (
        <>
          {results.length === 0 ? (
            <GlowCard>
              <div className="flex items-center gap-3 text-success">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">No breaches found!</p>
                  <p className="text-sm text-muted-foreground">Your email wasn't found in any known data breaches.</p>
                </div>
              </div>
            </GlowCard>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-semibold">Found in {results.length} breach{results.length > 1 ? 'es' : ''}</span>
              </div>
              {results.map((b, i) => (
                <GlowCard key={b.name} variant="red" delay={i * 0.1}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-destructive" />
                        <h3 className="font-semibold text-foreground">{b.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Date: {b.date}</p>
                      <p className="text-xs text-muted-foreground">Compromised: {b.dataTypes.join(', ')}</p>
                    </div>
                    <span className="text-xs font-mono text-destructive">{(b.count / 1e6).toFixed(1)}M records</span>
                  </div>
                </GlowCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
