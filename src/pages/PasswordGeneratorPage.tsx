import { useState, useCallback } from 'react';
import { Copy, RefreshCw, Zap } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { generatePassword, analyzePassword } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ upper: true, lower: true, numbers: true, symbols: true });
  const [password, setPassword] = useState(() => generatePassword(16, options));

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard!');
  };

  const analysis = analyzePassword(password);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          Password Generator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generate strong, random passwords</p>
      </div>

      <GlowCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border font-mono text-lg text-foreground break-all select-all">
            {password}
          </div>
          <Button variant="outline" size="icon" onClick={copyToClipboard} className="border-border text-foreground hover:bg-muted shrink-0">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={regenerate} className="border-border text-foreground hover:bg-muted shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Length</span>
              <span className="font-mono text-foreground">{length}</span>
            </div>
            <input type="range" min={8} max={64} value={length} onChange={e => { setLength(+e.target.value); setPassword(generatePassword(+e.target.value, options)); }} className="w-full accent-primary" />
          </div>
          <div className="flex flex-wrap gap-4">
            {([['upper', 'Uppercase'], ['lower', 'Lowercase'], ['numbers', 'Numbers'], ['symbols', 'Symbols']] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={options[key]} onChange={e => { const o = { ...options, [key]: e.target.checked }; setOptions(o); setPassword(generatePassword(length, o)); }} className="accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </div>
      </GlowCard>

      <GlowCard variant="cyan" delay={0.1}>
        <PasswordStrengthMeter analysis={analysis} />
      </GlowCard>
    </div>
  );
}
