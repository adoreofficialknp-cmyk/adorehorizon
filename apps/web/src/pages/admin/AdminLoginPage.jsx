import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin, isAuthenticated, isAdmin, initialLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialLoading && isAuthenticated() && isAdmin) {
      navigate('/admin-portal-secure-access', { replace: true });
    }
  }, [isAuthenticated, isAdmin, initialLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Email and password are required'); return; }

    setLoading(true);
    setError('');
    const result = await adminLogin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin-portal-secure-access', { replace: true });
    } else {
      setError(result.error || 'Invalid credentials or insufficient permissions');
    }
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <ShieldCheck className="h-12 w-12 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold font-serif">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">ADORE Jewellery — Secure Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@adorejewellery.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In as Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
