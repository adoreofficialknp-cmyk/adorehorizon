import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = form;

    if (!email && !phone) { setError('Email or phone number is required'); return; }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    const result = await signup({ name, email: email || undefined, phone: phone || undefined, password });
    setLoading(false);

    if (result.success) {
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/', { replace: true }), 1200);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-lg border border-border space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-serif">Create Account</h2>
            <p className="mt-2 text-muted-foreground">Join ADORE Jewellery</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Your name" value={form.name} onChange={handleChange('name')} disabled={loading} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input type="email" placeholder="email@example.com" value={form.email} onChange={handleChange('email')} disabled={loading} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={handleChange('phone')} disabled={loading} maxLength={10} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange('password')} disabled={loading} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} disabled={loading} />
            </div>

            {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            {success && <div className="flex items-center gap-2 text-green-600 text-sm"><CheckCircle2 className="h-4 w-4 shrink-0" />{success}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create Account'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;
