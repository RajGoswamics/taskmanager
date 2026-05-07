import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import { LogoMark, Logo } from '@/components/ui/logo';
import TaskMeterAnimation from '@/components/auth/TaskMeterAnimation';
import Testimonial from '@/components/auth/Testimonial';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30 lg:opacity-100" />

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-blue-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 backdrop-blur ring-1 ring-white/20">
            <LogoMark size={26} />
          </span>
          <span className="text-base font-bold tracking-tight">
            taskMeter<span className="text-white/70">.</span>
          </span>
        </Link>

        <div className="relative my-6 flex-1 flex items-center justify-center">
          <TaskMeterAnimation />
        </div>

        <div className="relative">
          <Testimonial />
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <Link to="/" className="lg:hidden inline-flex">
            <Logo size={32} />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-8"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a className="text-xs text-muted-foreground hover:text-foreground" href="#">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-8"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
