import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import { Logo, LogoMark } from '@/components/ui/logo';
import TaskMeterAnimation from '@/components/auth/TaskMeterAnimation';
import Testimonial from '@/components/auth/Testimonial';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created — welcome to taskMeter!');
      navigate('/app');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-30 lg:opacity-100" />

      <div className="flex items-center justify-center p-6 md:p-10 order-2 lg:order-1">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <Link to="/" className="lg:hidden inline-flex">
            <Logo size={32} />
          </Link>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Get your team shipping in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <UserIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Ada Lovelace"
                  className="pl-8"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  className="pl-8"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            By signing up, you agree to our terms and privacy policy.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-fuchsia-600 to-violet-600 lg:flex lg:flex-col lg:justify-between lg:p-12 order-1 lg:order-2">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />

        <Link to="/" className="relative ml-auto flex items-center gap-2.5 text-white">
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
    </div>
  );
}
