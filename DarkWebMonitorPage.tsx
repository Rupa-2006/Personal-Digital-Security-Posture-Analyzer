import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { useSecurityStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

export default function DarkWebMonitorPage() {
  const { userEmail, darkWebAlerts, setDarkWebAlerts } = useSecurityStore();
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      const hash = userEmail.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const allAlerts = [
        { id: '1', type: 'Credential Leak', detail: 'Email and password combo found on dark web forum', severity: 'critical' as const },
        { id: '2', type: 'Data Dump', detail: 'Personal information found in a paste site', severity: 'high' as const },
        { id: '3', type: 'Account Listing', detail: 'Account details found on a marketplace', severity: 'medium' as const },
        { id: '4', type: 'Mention', detail: 'Email referenced in a security discussion', severity: 'low' as const },
      ];
      setDarkWebAlerts(allAlerts.slice(0, (hash % 3) + 1));
      setScanning(false);
    }, 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Eye className="w-6 h-6 text-accent" />
          Dark Web Monitoring
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Simulated dark web scan for demo purposes</p>
      </div>

      <GlowCard variant="purple">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Monitoring: <span className="font-mono text-primary">{userEmail || 'Not set'}</span></p>
            <p className="text-xs text-muted-foreground mt-1">Scans dark web forums, paste sites, and marketplaces</p>
          </div>
          <Button onClick={runScan} disabled={scanning} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {scanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </div>
        {scanning && (
          <div className="mt-4">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-accent rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">Scanning hidden services...</p>
          </div>
        )}
      </GlowCard>

      {darkWebAlerts.length > 0 && !scanning && (
        <div className="space-y-3">
          {darkWebAlerts.map((alert, i) => (
            <motion.div key={alert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
              <GlowCard variant={alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'red' : 'cyan'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-destructive' : alert.severity === 'high' ? 'text-warning' : 'text-secondary'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.type}</p>
                      <p className="text-xs text-muted-foreground">{alert.detail}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${
                    alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' :
                    alert.severity === 'high' ? 'bg-warning/20 text-warning' :
                    alert.severity === 'medium' ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
                  }`}>{alert.severity}</span>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}

      {darkWebAlerts.length === 0 && !scanning && (
        <GlowCard>
          <p className="text-sm text-muted-foreground text-center py-4">Click "Run Scan" to check for dark web exposure.</p>
        </GlowCard>
      )}
    </div>
  );
}
