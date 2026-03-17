import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Search } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { simulateDigitalFootprint } from '@/lib/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DigitalFootprintPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof simulateDigitalFootprint> | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = () => {
    setScanning(true);
    setResults(null);
    setTimeout(() => {
      setResults(simulateDigitalFootprint(query));
      setScanning(false);
    }, 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-primary" />
          Digital Footprint Scanner
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Discover your online exposure</p>
      </div>

      <GlowCard>
        <div className="flex gap-3">
          <Input placeholder="Enter email or username..." value={query} onChange={e => setQuery(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" />
          <Button onClick={scan} disabled={!query || scanning} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Search className="w-4 h-4 mr-1" /> Scan
          </Button>
        </div>
      </GlowCard>

      {scanning && (
        <GlowCard variant="purple">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground font-mono">Scanning the web...</span>
          </div>
        </GlowCard>
      )}

      {results && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlowCard variant={r.risk === 'High' ? 'red' : r.risk === 'Medium' ? 'cyan' : 'default'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.source}</p>
                    <p className="text-xs text-muted-foreground">{r.info}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${r.risk === 'High' ? 'bg-destructive/20 text-destructive' : r.risk === 'Medium' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                    {r.risk}
                  </span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
