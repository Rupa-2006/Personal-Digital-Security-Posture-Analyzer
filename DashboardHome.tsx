import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Key, Users, TrendingUp, Eye } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import GlowCard from '@/components/GlowCard';
import SecurityScoreGauge from '@/components/SecurityScoreGauge';
import { useSecurityStore } from '@/lib/store';
import { calculateSecurityScore, evaluateBadges } from '@/lib/security';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

export default function DashboardHome() {
  const { accounts, breaches, securityScore, scoreHistory, setSecurityScore, setBadges, darkWebAlerts } = useSecurityStore();

  useEffect(() => {
    const score = calculateSecurityScore(accounts, breaches.length);
    setSecurityScore(score);
    setBadges(evaluateBadges(score, accounts, breaches.length));
  }, [accounts, breaches]);

  const riskData = {
    labels: ['Password', 'Breaches', 'MFA', 'Reuse', 'Exposure'],
    datasets: [{
      data: [
        accounts.length ? accounts.reduce((s, a) => s + (100 - a.passwordStrength), 0) / accounts.length : 50,
        breaches.length * 20,
        accounts.length ? accounts.filter(a => !a.mfaEnabled).length * 25 : 50,
        accounts.length > 1 ? (accounts.length - new Set(accounts.map(a => a.passwordHash)).size) * 30 : 0,
        darkWebAlerts.length * 15,
      ],
      backgroundColor: [
        'hsl(160, 100%, 50%)',
        'hsl(0, 80%, 55%)',
        'hsl(45, 100%, 55%)',
        'hsl(280, 100%, 65%)',
        'hsl(200, 100%, 50%)',
      ],
      borderWidth: 0,
    }],
  };

  const progressData = {
    labels: scoreHistory.length ? scoreHistory.map(h => h.date) : ['Start'],
    datasets: [{
      label: 'Security Score',
      data: scoreHistory.length ? scoreHistory.map(h => h.score) : [securityScore || 50],
      borderColor: 'hsl(160, 100%, 50%)',
      backgroundColor: 'hsla(160, 100%, 50%, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'hsl(160, 100%, 50%)',
      pointBorderWidth: 0,
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'hsl(220, 15%, 16%)' }, ticks: { color: 'hsl(220, 10%, 55%)' } },
      y: { grid: { color: 'hsl(220, 15%, 16%)' }, ticks: { color: 'hsl(220, 10%, 55%)' }, min: 0, max: 100 },
    },
  };

  const stats = [
    { icon: Users, label: 'Accounts', value: accounts.length, variant: 'default' as const },
    { icon: AlertTriangle, label: 'Breaches', value: breaches.length, variant: breaches.length > 0 ? 'red' as const : 'default' as const },
    { icon: Key, label: 'Weak Passwords', value: accounts.filter(a => a.passwordStrength < 50).length, variant: 'cyan' as const },
    { icon: Eye, label: 'Dark Web Alerts', value: darkWebAlerts.length, variant: 'purple' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground neon-text">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your digital security at a glance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Shield className="w-4 h-4 text-primary" />
          Last scan: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlowCard key={stat.label} variant={stat.variant} delay={i * 0.1}>
            <div className="flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Score + Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <GlowCard delay={0.2}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Security Score</h3>
          <div className="flex justify-center">
            <SecurityScoreGauge score={securityScore} />
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: 'Enable MFA on all accounts', done: accounts.every(a => a.mfaEnabled) && accounts.length > 0 },
              { label: 'Use unique passwords', done: accounts.length > 0 && new Set(accounts.map(a => a.passwordHash)).size === accounts.length },
              { label: 'Check for breaches', done: breaches.length === 0 && accounts.length > 0 },
            ].map((rec) => (
              <div key={rec.label} className="flex items-center gap-2 text-xs">
                <span className={rec.done ? 'text-success' : 'text-warning'}>
                  {rec.done ? '✓' : '○'}
                </span>
                <span className="text-muted-foreground">{rec.label}</span>
              </div>
            ))}
          </div>
        </GlowCard>

        <GlowCard variant="cyan" delay={0.3}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
          <div className="flex justify-center">
            <div className="w-48 h-48">
              <Doughnut data={riskData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: 'hsl(220, 10%, 55%)', font: { size: 10 } } } } }} />
            </div>
          </div>
        </GlowCard>

        <GlowCard variant="purple" delay={0.4}>
          <h3 className="text-sm font-semibold text-foreground mb-4">Score Progress</h3>
          <Line data={progressData} options={chartOptions} />
        </GlowCard>
      </div>

      {/* Recent Alerts */}
      <GlowCard variant="red" delay={0.5}>
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Recent Alerts
        </h3>
        {breaches.length === 0 && darkWebAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts. Run a breach check to scan your email.</p>
        ) : (
          <div className="space-y-2">
            {breaches.map((b) => (
              <motion.div key={b.name} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.dataTypes.join(', ')}</p>
                </div>
                <span className="text-xs font-mono text-destructive">{b.date}</span>
              </motion.div>
            ))}
            {darkWebAlerts.map((a) => (
              <motion.div key={a.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className={`text-xs font-mono ${a.severity === 'critical' ? 'text-destructive' : a.severity === 'high' ? 'text-warning' : 'text-muted-foreground'}`}>{a.severity}</span>
              </motion.div>
            ))}
          </div>
        )}
      </GlowCard>
    </div>
  );
}
