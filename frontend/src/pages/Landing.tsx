import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Github, Zap, Layers, Users2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Logo, LogoMark } from '@/components/ui/logo';

const features = [
  { icon: Layers, title: 'Project Workspaces', desc: 'Organize work into focused projects with their own teams, statuses, and members.' },
  { icon: Users2, title: 'Role-based Access', desc: 'Admins manage everything; members collaborate on what matters with proper permissions.' },
  { icon: Activity, title: 'Realtime Dashboard', desc: 'Track tasks, due dates, and progress with charts that turn data into insight.' },
  { icon: Zap, title: 'Built for Speed', desc: 'Keyboard shortcuts, instant updates, and a UI that feels like Linear out of the box.' },
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo size={30} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="https://github.com" className="flex items-center gap-1 hover:text-foreground transition">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/register">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-16 text-center md:pt-24 md:pb-24">
        <div className="flex justify-center mb-6">
          <LogoMark size={72} withGlow />
        </div>
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          New — role-based dashboards & analytics
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          The way modern teams <br />
          <span className="gradient-text">ship work.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          taskMeter is a fast, opinionated task manager built for product teams. Plan projects, assign tasks,
          and track everything — without the bloat.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="gradient" size="lg" asChild>
            <Link to="/register">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No credit card</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free forever</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Set up in seconds</span>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-blue-500/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/30">
            <div className="flex items-center gap-1.5 border-b border-border bg-card/80 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-muted-foreground">taskmeter.app/dashboard</span>
            </div>
            <div className="grid grid-cols-12 gap-4 p-6">
              <div className="col-span-3 hidden md:block">
                <div className="space-y-2">
                  {['Dashboard', 'Projects', 'Tasks', 'Teams', 'Settings'].map((s, i) => (
                    <div
                      key={s}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                        i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-sm bg-current opacity-50" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: 'Total', v: '142', c: 'text-violet-400' },
                    { l: 'Active', v: '38', c: 'text-blue-400' },
                    { l: 'Done', v: '94', c: 'text-emerald-400' },
                    { l: 'Overdue', v: '4', c: 'text-rose-400' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </div>
                      <div className={`mt-1 text-2xl font-bold ${s.c}`}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    { t: 'Refactor authentication flow', s: 'In Progress', c: 'bg-blue-500/15 text-blue-400' },
                    { t: 'Design onboarding experience', s: 'In Review', c: 'bg-amber-500/15 text-amber-400' },
                    { t: 'Set up analytics dashboard', s: 'Done', c: 'bg-emerald-500/15 text-emerald-400' },
                    { t: 'Migrate database to v2', s: 'Todo', c: 'bg-slate-500/15 text-slate-300' },
                  ].map((t) => (
                    <div
                      key={t.t}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-background/30 px-3 py-2"
                    >
                      <span className="text-sm">{t.t}</span>
                      <span className={`rounded px-2 py-0.5 text-[10px] ${t.c}`}>{t.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 border-t border-border/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything your team needs.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Powerful primitives, thoughtfully designed. Skip the setup, jump straight into shipping.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur card-hover"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/20 to-blue-500/20">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-t border-border/50 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built like a tool you'd <br />actually want to use.
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              Inspired by the best — Linear, Notion, and Asana — taskMeter pairs a clean, dark-first design
              with the speed of a native app and the simplicity of a great spreadsheet.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Authentication with secure JWT-based sessions',
                'Projects, teams, tasks, and comments out of the box',
                'Admin/Member roles with granular permissions',
                'Live dashboard with overdue, status, and trend metrics',
              ].map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Button variant="gradient" asChild>
                <Link to="/register">
                  Create free account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl border border-border bg-card p-1 shadow-xl shadow-black/30">
              <div className="rounded-lg bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-blue-500/20 p-8">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border/60 bg-background/40 p-3 text-xs"
                      style={{ opacity: 0.5 + (i % 3) * 0.15 }}
                    >
                      <div className="h-1.5 w-3/4 rounded bg-current opacity-30" />
                      <div className="mt-2 h-1.5 w-1/2 rounded bg-current opacity-20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span>© {new Date().getFullYear()} taskMeter. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
