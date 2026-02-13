import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CalendarDays,
  Package,
  DollarSign,
  ArrowRight,
  Zap,
  Layers,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: LayoutDashboard,
    title: 'Real-Time Orders',
    description: 'Track every order from placement to delivery with live status updates across your floor.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Schedule shifts, manage roles, and keep your team coordinated effortlessly.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Menu Builder',
    description: 'Create and update your menu with pricing, categories, and availability toggles.',
  },
  {
    icon: CalendarDays,
    title: 'Reservations',
    description: 'Accept bookings, assign tables, and reduce no-shows with smart scheduling.',
  },
  {
    icon: Package,
    title: 'Inventory Tracking',
    description: 'Monitor stock levels, set alerts for low items, and track supplier orders.',
  },
  {
    icon: DollarSign,
    title: 'Financial Reports',
    description: 'Visualize revenue, expenses, and profits with categorized transaction tracking.',
  },
];

const steps = [
  { number: '01', title: 'Sign Up', description: 'Create your account in seconds — no credit card required.' },
  { number: '02', title: 'Set Up Your Restaurant', description: 'Add your menu, staff members, and table layout.' },
  { number: '03', title: 'Start Managing', description: 'Run everything from one powerful dashboard.' },
];

const stats = [
  { icon: Zap, label: 'Real-time updates' },
  { icon: Layers, label: '7 integrated modules' },
  { icon: Smartphone, label: 'Mobile ready' },
];

export default function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-border/50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/landing" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Floor Manager</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-[90vh] items-center justify-center pt-16">
        {/* glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Your Restaurant,{' '}
            <span className="text-gradient">Fully Under Control</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            The all-in-one management platform that lets you handle orders, staff, inventory, and finances — from a single dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link to="/auth">
                Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#features">See How It Works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl animate-fade-in">
            Everything You Need to <span className="text-gradient">Run Your Floor</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Six powerful modules working together so nothing slips through the cracks.
          </p>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 bg-card/40">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl animate-fade-in">
            Up and Running in <span className="text-gradient">Three Steps</span>
          </h2>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.number}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="font-display text-5xl font-bold text-primary/20">{s.number}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-10 px-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/8 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center animate-fade-in">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to streamline your restaurant?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join Floor Manager today and take control of your operations.
          </p>
          <Button size="xl" className="mt-8" asChild>
            <Link to="/auth">
              Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-primary">
              <ChefHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold">Floor Manager</span>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Floor Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
