import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AI_RESPONSES: Record<string, string> = {
  password: "**Strong Password Tips:**\n\n1. Use at least 16 characters\n2. Mix uppercase, lowercase, numbers, and symbols\n3. Never reuse passwords across accounts\n4. Use a password manager like Bitwarden or 1Password\n5. Avoid dictionary words and personal info",
  mfa: "**Multi-Factor Authentication (MFA):**\n\nMFA adds a critical extra layer. Even if your password is stolen, attackers can't access your account without the second factor.\n\n- Use authenticator apps (not SMS)\n- Hardware keys like YubiKey offer the best protection\n- Enable MFA on email first, then financial accounts",
  phishing: "**Phishing Protection:**\n\n1. Always verify the sender's email address\n2. Hover over links before clicking\n3. Never enter credentials on unfamiliar sites\n4. Look for HTTPS and valid certificates\n5. Be suspicious of urgency in messages\n6. When in doubt, go directly to the official website",
  breach: "**After a Data Breach:**\n\n1. Change affected passwords immediately\n2. Enable MFA on compromised accounts\n3. Monitor financial statements\n4. Consider a credit freeze\n5. Watch for phishing attempts using leaked data\n6. Use unique passwords to limit damage",
  vpn: "**VPN Recommendations:**\n\nA VPN encrypts your internet traffic. Use one on public WiFi.\n\n- Choose a no-log provider\n- Look for WireGuard protocol support\n- Avoid free VPNs (they often sell data)\n- Good options: Mullvad, ProtonVPN, IVPN",
  default: "I'm your AI Security Advisor! I can help with:\n\n- 🔑 Password security best practices\n- 🛡️ Multi-factor authentication\n- 🎣 Phishing prevention\n- 💧 Data breach response\n- 🌐 VPN and network security\n- 🔒 General cybersecurity tips\n\nWhat would you like to know?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('password') || lower.includes('strong')) return AI_RESPONSES.password;
  if (lower.includes('mfa') || lower.includes('2fa') || lower.includes('two-factor') || lower.includes('multi')) return AI_RESPONSES.mfa;
  if (lower.includes('phish') || lower.includes('scam') || lower.includes('suspicious')) return AI_RESPONSES.phishing;
  if (lower.includes('breach') || lower.includes('leak') || lower.includes('hack')) return AI_RESPONSES.breach;
  if (lower.includes('vpn') || lower.includes('network') || lower.includes('wifi')) return AI_RESPONSES.vpn;
  return "Great question! Here are some general tips:\n\n1. Keep all software updated\n2. Use strong, unique passwords\n3. Enable MFA everywhere\n4. Be cautious with email links\n5. Regularly review account activity\n\nFeel free to ask about specific topics like passwords, MFA, phishing, or breaches!";
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: AI_RESPONSES.default },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: getAIResponse(userMsg.content) }]);
      setTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground neon-text flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          AI Security Advisor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Ask cybersecurity questions and get expert advice</p>
      </div>

      <GlowCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary/20 text-foreground border border-primary/20'
                  : 'bg-muted/50 text-foreground border border-border'
              }`}>
                <pre className="whitespace-pre-wrap font-sans text-sm">{msg.content}</pre>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted/50 border border-border rounded-lg px-4 py-3">
                <span className="text-muted-foreground text-sm animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t border-border">
          <Input
            placeholder="Ask a security question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button onClick={send} disabled={!input.trim() || typing} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </GlowCard>
    </div>
  );
}
