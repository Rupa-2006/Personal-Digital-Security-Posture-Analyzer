import { FileText, Download } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { useSecurityStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

export default function SecurityReportPage() {
  const { userName, userEmail, securityScore, accounts, breaches, badges, darkWebAlerts } = useSecurityStore();

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(20);
    doc.setTextColor(0, 200, 120);
    doc.text('SecureGuard Security Report', margin, y);
    y += 12;

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`User: ${userName} (${userEmail})`, margin, y);
    y += 12;

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Security Score: ${securityScore}/100`, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text('Account Summary', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.text(`Total accounts: ${accounts.length}`, margin, y); y += 5;
    doc.text(`MFA enabled: ${accounts.filter(a => a.mfaEnabled).length}/${accounts.length}`, margin, y); y += 5;
    doc.text(`Weak passwords: ${accounts.filter(a => a.passwordStrength < 50).length}`, margin, y); y += 5;
    const uniquePasswords = new Set(accounts.map(a => a.passwordHash)).size;
    doc.text(`Password reuse: ${accounts.length - uniquePasswords} reused`, margin, y); y += 10;

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Data Breaches', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    if (breaches.length === 0) {
      doc.text('No breaches found.', margin, y); y += 5;
    } else {
      breaches.forEach(b => {
        doc.text(`• ${b.name} (${b.date}) - ${b.dataTypes.join(', ')}`, margin, y); y += 5;
      });
    }
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Dark Web Alerts', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    if (darkWebAlerts.length === 0) {
      doc.text('No alerts.', margin, y); y += 5;
    } else {
      darkWebAlerts.forEach(a => {
        doc.text(`• [${a.severity.toUpperCase()}] ${a.type}: ${a.detail}`, margin, y); y += 5;
      });
    }
    y += 5;

    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('Badges Earned', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const earned = badges.filter(b => b.earned);
    if (earned.length === 0) {
      doc.text('No badges earned yet.', margin, y);
    } else {
      earned.forEach(b => {
        doc.text(`${b.icon} ${b.name} - ${b.description}`, margin, y); y += 5;
      });
    }
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 200, 120);
    doc.text('Recommendations:', margin, y); y += 7;
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    const recs = [
      accounts.some(a => !a.mfaEnabled) ? 'Enable MFA on all accounts' : null,
      accounts.some(a => a.passwordStrength < 60) ? 'Strengthen weak passwords' : null,
      accounts.length - uniquePasswords > 0 ? 'Stop reusing passwords' : null,
      breaches.length > 0 ? 'Change passwords for breached accounts' : null,
      'Use a password manager',
      'Review account activity regularly',
    ].filter(Boolean);
    recs.forEach(r => { doc.text(`• ${r}`, margin, y); y += 5; });

    doc.save('secureguard-report.pdf');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          Security Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Generate a downloadable PDF report</p>
      </div>

      <GlowCard>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">User:</span> <span className="text-foreground">{userName}</span></div>
            <div><span className="text-muted-foreground">Score:</span> <span className="text-primary font-mono font-bold">{securityScore}/100</span></div>
            <div><span className="text-muted-foreground">Accounts:</span> <span className="text-foreground">{accounts.length}</span></div>
            <div><span className="text-muted-foreground">Breaches:</span> <span className={breaches.length > 0 ? 'text-destructive' : 'text-success'}>{breaches.length}</span></div>
            <div><span className="text-muted-foreground">MFA Coverage:</span> <span className="text-foreground">{accounts.length ? Math.round(accounts.filter(a => a.mfaEnabled).length / accounts.length * 100) : 0}%</span></div>
            <div><span className="text-muted-foreground">Dark Web Alerts:</span> <span className="text-foreground">{darkWebAlerts.length}</span></div>
          </div>
          <Button onClick={generatePDF} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Download PDF Report
          </Button>
        </div>
      </GlowCard>
    </div>
  );
}
