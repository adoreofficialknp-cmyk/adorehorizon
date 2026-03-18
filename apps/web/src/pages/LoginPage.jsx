import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated() && currentUser && !successMessage) {
      navigate(isAdmin ? '/admin-portal-secure-access' : '/', { replace: true });
    }
  }, [isAuthenticated, currentUser, isAdmin, navigate, successMessage]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) { setError('Email or phone number is required'); return; }
    if (!password) { setError('Password is required'); return; }

    setLoading(true);
    setError('');

    const result = await login(identifier.trim(), password);
    setLoading(false);

    if (result.success) {
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate(result.isAdmin ? '/admin-portal-secure-access' : '/', { replace: true }), 1200);
    } else {
      setError(result.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-serif text-foreground">Welcome Back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Email or Phone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="email@example.com or 9876543210"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
