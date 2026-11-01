import { useState } from 'react';
import { AlertTriangle, CheckCircle, Globe, Shield } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { analyzeUrl } from '@/lib/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PhishingDetectorPage() {
  const [url, setUrl] = useState('');
  // Keep the checked URL together with its result, so the result card can
  // never show an old verdict next to a newly typed link.
  const [result, setResult] = useState<(ReturnType<typeof analyzeUrl> & { checked: string }) | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault(); // lets the Enter key submit the form
    const trimmed = url.trim();
    if (!trimmed) return;
    const u = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
    setResult({ ...analyzeUrl(u), checked: u });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          Phishing Link Detector
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Check if a URL is potentially malicious</p>
      </div>

      <GlowCard>
        <form onSubmit={handleCheck} className="flex gap-3">
          <Input placeholder="Enter a URL to check..." value={url} onChange={e => { setUrl(e.target.value); setResult(null); }} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" />
          <Button type="submit" disabled={!url.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">Analyze</Button>
        </form>
      </GlowCard>

      {result && (
        <GlowCard variant={result.risk === 'Safe' ? 'default' : result.risk === 'Suspicious' ? 'cyan' : 'red'}>
          <div className="flex items-center gap-3 mb-4">
            {result.risk === 'Safe' ? <CheckCircle className="w-6 h-6 text-success" /> :
             result.risk === 'Suspicious' ? <AlertTriangle className="w-6 h-6 text-warning" /> :
             <Shield className="w-6 h-6 text-destructive" />}
            <div>
              <p className={`font-bold text-lg ${result.risk === 'Safe' ? 'text-success' : result.risk === 'Suspicious' ? 'text-warning' : 'text-destructive'}`}>
                {result.risk}
              </p>
              <p className="text-xs text-muted-foreground font-mono break-all">{result.checked}</p>
            </div>
          </div>
          {result.reasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase">Issues found:</p>
              {result.reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-destructive">⚠</span>
                  <span className="text-foreground">{r}</span>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      )}
    </div>
  );
}
