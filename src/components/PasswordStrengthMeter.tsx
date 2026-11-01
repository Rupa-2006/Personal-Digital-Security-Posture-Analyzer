import { motion } from 'framer-motion';
import type { PasswordAnalysis } from '@/lib/security';

export default function PasswordStrengthMeter({ analysis }: { analysis: PasswordAnalysis }) {
  const color = analysis.score >= 85 ? 'bg-success' : analysis.score >= 60 ? 'bg-primary' : analysis.score >= 30 ? 'bg-warning' : 'bg-destructive';
  const glowClass = analysis.score >= 85 ? 'neon-border' : analysis.score >= 60 ? 'neon-border' : analysis.score >= 30 ? 'neon-border-red' : 'neon-border-red';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-mono">Strength</span>
        <span className={`text-sm font-bold font-mono ${
          analysis.label === 'Very Strong' ? 'text-success' :
          analysis.label === 'Strong' ? 'text-primary' :
          analysis.label === 'Medium' ? 'text-warning' : 'text-destructive'
        }`}>
          {analysis.label}
        </span>
      </div>
      <div className={`h-2 rounded-full bg-muted overflow-hidden border ${glowClass}`}>
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${analysis.score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        Est. crack time: <span className="text-foreground">{analysis.crackTime}</span>
      </div>
      <div className="space-y-2 mt-4">
        {analysis.details.map((d) => (
          <div key={d.criterion} className="flex items-center gap-2 text-xs">
            <span className={d.met ? 'text-success' : 'text-destructive'}>{d.met ? '✓' : '✗'}</span>
            <span className={d.met ? 'text-foreground' : 'text-muted-foreground'}>{d.criterion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
