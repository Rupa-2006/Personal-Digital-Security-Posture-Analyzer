import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Eye, EyeOff, Info, ExternalLink } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { checkPwnedPassword } from '@/lib/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Result = { status: 'found'; count: number } | { status: 'clean' } | { status: 'error'; message: string };

export default function BreachLookupPage() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setChecking(true);
    setResult(null);
    try {
      const count = await checkPwnedPassword(password);
      setResult(count > 0 ? { status: 'found', count } : { status: 'clean' });
    } catch (err) {
      setResult({ status: 'error', message: err instanceof Error ? err.message : 'Network error' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Search className="w-6 h-6 text-primary" />
          Breach Check
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check if a password appears in real data breaches (live data from Have I Been Pwned)
        </p>
      </div>

      <GlowCard>
        <form onSubmit={handleCheck} className="flex gap-3">
          <div className="relative flex-1">
            <Input
              type={show ? 'text' : 'password'}
              placeholder="Enter a password to check..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="pr-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono"
            />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button type="submit" disabled={!password || checking} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            {checking ? 'Checking...' : 'Check'}
          </Button>
        </form>
      </GlowCard>

      {result?.status === 'clean' && (
        <GlowCard>
          <div className="flex items-center gap-3 text-success">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Not found in known breaches</p>
              <p className="text-sm text-muted-foreground">That's good, but it still needs to be long and unique to be safe.</p>
            </div>
          </div>
        </GlowCard>
      )}

      {result?.status === 'found' && (
        <GlowCard variant="red">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Found {result.count.toLocaleString()} times in data breaches</p>
              <p className="text-sm text-muted-foreground">
                Attackers try leaked passwords first. Stop using it everywhere and change it now.
              </p>
            </div>
          </div>
        </GlowCard>
      )}

      {result?.status === 'error' && (
        <GlowCard variant="red">
          <p className="text-sm text-destructive">Couldn't reach the breach service ({result.message}). Check your connection and try again.</p>
        </GlowCard>
      )}

      <GlowCard variant="cyan">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-secondary" /> How your password stays private (k-anonymity)
        </h3>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Your browser computes the SHA-1 hash of the password locally.</li>
          <li>Only the <span className="text-foreground">first 5 characters</span> of that hash are sent to the API.</li>
          <li>The API returns every leaked hash starting with those 5 characters (hundreds of them), plus padding.</li>
          <li>Your browser looks for a match itself, so the service never learns your password or its full hash.</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">
          Want to check an <span className="text-foreground">email address</span>? HIBP's email search needs a paid API key, so use the official site:{' '}
          <a href="https://haveibeenpwned.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
            haveibeenpwned.com <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </GlowCard>
    </div>
  );
}
