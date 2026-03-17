import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Play, RotateCcw } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { simulateBruteForce } from '@/lib/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function BruteForceSimPage() {
  const [password, setPassword] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{ attempts: number; timeTaken: number } | null>(null);

  const run = async () => {
    if (!password) return;
    setRunning(true);
    setResult(null);
    setProgress(0);
    setAttempts(0);
    const res = await simulateBruteForce(password, (p, a) => {
      setProgress(p);
      setAttempts(a);
    });
    setResult(res);
    setRunning(false);
  };

  const formatTime = (s: number) => {
    if (s < 1) return 'Less than a second';
    if (s < 60) return `${Math.round(s)} seconds`;
    if (s < 3600) return `${Math.round(s / 60)} minutes`;
    if (s < 86400) return `${Math.round(s / 3600)} hours`;
    if (s < 31536000) return `${Math.round(s / 86400)} days`;
    if (s < 31536000 * 1000) return `${Math.round(s / 31536000)} years`;
    return 'Millions of years';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          Brute Force Attack Simulator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">See how long it takes to crack a password</p>
      </div>

      <GlowCard>
        <div className="flex gap-3">
          <Input type="text" placeholder="Enter a password to test..." value={password} onChange={e => setPassword(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" disabled={running} />
          <Button onClick={run} disabled={!password || running} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shrink-0">
            <Play className="w-4 h-4 mr-1" /> Simulate
          </Button>
        </div>
      </GlowCard>

      {(running || result) && (
        <GlowCard variant="red">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono">Progress</span>
              <span className="text-foreground font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full bg-destructive rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Attempts: <span className="text-foreground">{attempts.toLocaleString()}</span>
            </div>
            {result && (
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-sm text-foreground">
                  Total combinations: <span className="font-mono text-primary">{result.attempts.toLocaleString()}</span>
                </p>
                <p className="text-sm text-foreground">
                  Time at 10B/sec: <span className={`font-mono ${result.timeTaken > 31536000 ? 'text-success' : 'text-destructive'}`}>{formatTime(result.timeTaken)}</span>
                </p>
                <Button variant="outline" size="sm" onClick={() => { setResult(null); setProgress(0); }} className="mt-2 border-border text-foreground hover:bg-muted">
                  <RotateCcw className="w-3 h-3 mr-1" /> Reset
                </Button>
              </div>
            )}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
