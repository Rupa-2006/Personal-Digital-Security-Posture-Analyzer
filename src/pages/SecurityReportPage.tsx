import { FileText, Download } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { useSecurityStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

export default function SecurityReportPage() {
  const { userName, securityScore, accounts, breaches, badges } = useSecurityStore();

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;

    // Start a new page when the next line wouldn't fit.
    const line = (text: string, gap = 5) => {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(text, margin, y);
      y += gap;
    };
    const heading = (text: string) => {
      y += 4;
      doc.setFontSize(12); doc.setTextColor(20, 20, 20);
      line(text, 8);
      doc.setFontSize(9); doc.setTextColor(70, 70, 70);
    };

    doc.setFontSize(20); doc.setTextColor(0, 150, 90);
    line('SecureGuard Security Report', 10);
    doc.setFontSize(10); doc.setTextColor(110, 110, 110);
    line(`Generated: ${new Date().toLocaleString()}`, 6);
    line(`Prepared for: ${userName}`, 10);

    doc.setFontSize(14); doc.setTextColor(20, 20, 20);
    line(`Security Score: ${securityScore}/100`, 6);

    const uniquePasswords = new Set(accounts.map(a => a.passwordHash)).size;
    heading('Account Summary');
    line(`Total accounts: ${accounts.length}`);
    line(`MFA enabled: ${accounts.filter(a => a.mfaEnabled).length}/${accounts.length}`);
    line(`Weak passwords: ${accounts.filter(a => a.passwordStrength < 50).length}`);
    line(`Password reuse: ${accounts.length - uniquePasswords} reused`);

    heading('Breached Passwords (Have I Been Pwned)');
    if (breaches.length === 0) line('None of the checked passwords were found in known breaches.');
    else breaches.forEach(b => line(`- ${b.name}: password seen ${b.count.toLocaleString()} times in breaches`));

    heading('Badges Earned');
    const earned = badges.filter(b => b.earned);
    if (earned.length === 0) line('No badges earned yet.');
    else earned.forEach(b => line(`- ${b.name}: ${b.description}`)); // emoji icons don't render in jsPDF's built-in fonts

    heading('Recommendations');
    const recs = [
      breaches.length > 0 ? 'Change every password that was found in a breach, first' : null,
      accounts.some(a => !a.mfaEnabled) ? 'Enable MFA on all accounts (authenticator app over SMS)' : null,
      accounts.some(a => a.passwordStrength < 60) ? 'Strengthen weak passwords' : null,
      accounts.length - uniquePasswords > 0 ? 'Stop reusing passwords' : null,
      'Use a password manager',
      'Review account activity regularly',
    ].filter((r): r is string => r !== null);
    recs.forEach(r => line(`- ${r}`));

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
            <div><span className="text-muted-foreground">Breached passwords:</span> <span className={breaches.length > 0 ? 'text-destructive' : 'text-success'}>{breaches.length}</span></div>
            <div><span className="text-muted-foreground">MFA Coverage:</span> <span className="text-foreground">{accounts.length ? Math.round(accounts.filter(a => a.mfaEnabled).length / accounts.length * 100) : 0}%</span></div>
            <div><span className="text-muted-foreground">Badges:</span> <span className="text-foreground">{badges.filter(b => b.earned).length}/{badges.length}</span></div>
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
