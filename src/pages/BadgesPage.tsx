import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { useSecurityStore } from '@/lib/store';

export default function BadgesPage() {
  const badges = useSecurityStore((s) => s.badges);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Trophy className="w-6 h-6 text-warning" />
          Security Badges
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Earn badges by improving your security posture</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, i) => (
          <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <GlowCard variant={badge.earned ? 'default' : 'cyan'} className={!badge.earned ? 'opacity-50' : ''}>
              <div className="text-center">
                <span className="text-4xl">{badge.icon}</span>
                <h3 className="text-sm font-bold text-foreground mt-2">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                <p className={`text-xs font-mono mt-2 ${badge.earned ? 'text-success' : 'text-muted-foreground'}`}>
                  {badge.earned ? '✓ EARNED' : '🔒 LOCKED'}
                </p>
              </div>
            </GlowCard>
          </motion.div>
        ))}
        {badges.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-8">Add accounts and run scans to earn badges.</p>
        )}
      </div>
    </div>
  );
}
