import { useState } from 'react';
import { Eye, EyeOff, Key } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { analyzePassword } from '@/lib/security';
import { Input } from '@/components/ui/input';

export default function PasswordAnalyzerPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const analysis = analyzePassword(password);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Key className="w-6 h-6 text-primary" />
          Password Strength Analyzer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Test how secure your passwords are</p>
      </div>

      <GlowCard>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter a password to analyze..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-12 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono text-lg h-12"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </GlowCard>

      {password && (
        <GlowCard variant={analysis.score >= 85 ? 'default' : analysis.score >= 50 ? 'cyan' : 'red'} delay={0.1}>
          <PasswordStrengthMeter analysis={analysis} />
        </GlowCard>
      )}
    </div>
  );
}
