import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Github, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useSecurityStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const login = useSecurityStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(name || email.split('@')[0], email);
      navigate('/dashboard');
    }
  };

  const handleOAuth = (provider: string) => {
    login(`${provider} User`, `user@${provider.toLowerCase()}.com`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(160 100% 50%), transparent)', top: '-10%', left: '-10%' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, hsl(280 100% 65%), transparent)', bottom: '-5%', right: '-5%' }}
        animate={{ scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-primary/30 mb-4 pulse-neon"
            style={{ background: 'hsl(220 18% 10% / 0.8)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground neon-text">SecureGuard</h1>
          <p className="text-muted-foreground text-sm mt-1">Digital Security Posture Analyzer</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-xl border neon-border p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              className="border-border bg-muted/50 hover:bg-muted text-foreground"
              onClick={() => handleOAuth('Google')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              className="border-border bg-muted/50 hover:bg-muted text-foreground"
              onClick={() => handleOAuth('GitHub')}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-mono">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 font-mono">
          🔒 Your data never leaves your browser
        </p>
      </motion.div>
    </div>
  );
}
