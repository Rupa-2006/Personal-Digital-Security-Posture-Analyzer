import { useState } from 'react';
import { Fingerprint, ExternalLink, CheckSquare, Square } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { Input } from '@/components/ui/input';

// This page does NOT scrape or scan anything itself (that would need paid APIs
// and raises privacy issues). Instead it builds real search links so you can
// audit your own public footprint, plus a checklist to track what you've reviewed.

const q = encodeURIComponent;

function buildSearches(name: string, username: string, email: string) {
  const searches: { label: string; url: string; why: string }[] = [];
  if (name) {
    searches.push({ label: `Google: "${name}"`, url: `https://www.google.com/search?q=${q(`"${name}"`)}`, why: 'What a stranger sees first' });
    searches.push({ label: `Google Images: "${name}"`, url: `https://www.google.com/search?tbm=isch&q=${q(`"${name}"`)}`, why: 'Photos of you that are public' });
    searches.push({ label: `LinkedIn: ${name}`, url: `https://www.linkedin.com/search/results/all/?keywords=${q(name)}`, why: 'Public work and education details' });
  }
  if (username) {
    searches.push({ label: `Google: "${username}"`, url: `https://www.google.com/search?q=${q(`"${username}"`)}`, why: 'Accounts that reuse this username' });
    searches.push({ label: `GitHub: ${username}`, url: `https://github.com/${q(username)}`, why: 'Code, commit emails and profile info' });
    searches.push({ label: `Instagram: ${username}`, url: `https://www.instagram.com/${q(username)}/`, why: 'Is the profile public?' });
  }
  if (email) {
    searches.push({ label: `Google: "${email}"`, url: `https://www.google.com/search?q=${q(`"${email}"`)}`, why: 'Pages that publish your email' });
    searches.push({ label: 'Have I Been Pwned (email)', url: 'https://haveibeenpwned.com/', why: 'Breaches that included this email' });
  }
  return searches;
}

const CHECKLIST = [
  'Social media profiles set to private, or only show what you are happy to share publicly',
  'Phone number and home address are not visible on any public profile',
  'Old, unused accounts deleted',
  'GitHub commits use a no-reply email (Settings → Emails → Keep my email private)',
  'Photos don\'t reveal your location, college ID or documents',
  'Different usernames for personal and professional accounts, if you want them kept apart',
];

export default function DigitalFootprintPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState<boolean[]>(CHECKLIST.map(() => false));

  const searches = buildSearches(name.trim(), username.trim(), email.trim());

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-primary" />
          Digital Footprint Self-Check
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          See yourself the way a stranger would. These links open real searches in a new tab; nothing is sent from this app.
        </p>
      </div>

      <GlowCard>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" />
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground font-mono" />
        </div>
      </GlowCard>

      {searches.length > 0 && (
        <GlowCard variant="cyan">
          <h3 className="text-sm font-semibold text-foreground mb-3">Searches to run</h3>
          <div className="space-y-2">
            {searches.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-colors">
                <div>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.why}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        </GlowCard>
      )}

      <GlowCard>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Privacy checklist ({done.filter(Boolean).length}/{CHECKLIST.length})
        </h3>
        <div className="space-y-2">
          {CHECKLIST.map((item, i) => (
            <button key={item} type="button"
              onClick={() => setDone(d => d.map((v, j) => (j === i ? !v : v)))}
              className="w-full flex items-start gap-3 text-left text-sm text-muted-foreground hover:text-foreground">
              {done[i] ? <CheckSquare className="w-4 h-4 text-success shrink-0 mt-0.5" /> : <Square className="w-4 h-4 shrink-0 mt-0.5" />}
              <span className={done[i] ? 'line-through' : ''}>{item}</span>
            </button>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
