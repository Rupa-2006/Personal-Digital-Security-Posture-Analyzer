import { useState } from 'react';
import { AlertTriangle, CheckCircle, Globe, Shield } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { analyzeUrl } from '@/lib/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PhishingDetectorPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeUrl> | null>(null);

  const handleCheck = () => {
    if (!url) return;
    let u = url;
    if (!u.startsWith('http')) u = 'https://' + u;
    setResult(analyzeUrl(u));
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
        <div className="flex gap-3">
          <Input placeholder="Enter a URL to check..." value={url} onChange={e => setUrl(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" />
          <Button onClick={handleCheck} disabled={!url} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">Analyze</Button>
        </div>
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
              <p className="text-xs text-muted-foreground font-mono">{url}</p>
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
