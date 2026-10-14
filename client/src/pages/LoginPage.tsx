import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Activity, ArrowUpRight, Check, Lock, Mail, ShieldCheck, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui/primitives';
import { CursorGlow } from '@/components/ui/CursorGlow';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-surface-950 lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <CursorGlow intensity="strong" />
      <section className="auth-hero relative z-10 isolate flex min-h-[260px] flex-col justify-between overflow-hidden border-b border-white/[0.06] px-6 py-6 sm:px-10 sm:py-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-10 xl:px-16">
        <div className="pattern-dots pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="pointer-events-none absolute -left-36 top-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[110px]" />
        <Link to="/login" className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-primary-500">
          <span className="glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white"><Activity className="h-5 w-5" /></span>
          <span><span className="block font-heading text-sm font-bold tracking-tight text-surface-50">LabCentral</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-surface-400">Laboratory workspace</span></span>
        </Link>

        <div className="relative z-10 my-8 max-w-xl lg:my-0 lg:-translate-y-5">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-300/15 bg-primary-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-200"><Sparkles className="h-3.5 w-3.5" />A clearer view of every sample</div>
          <h1 className="font-heading text-[32px] font-semibold leading-[1.12] tracking-tight text-surface-50 sm:text-4xl lg:text-[48px] xl:text-[56px]">Precision workflows.<br /><span className="bg-gradient-to-r from-primary-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">Clear answers.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-surface-300 sm:text-base sm:leading-7">Keep samples, people, and progress connected across your laboratory—in one calm, focused workspace.</p>

          <div className="mt-7 hidden max-w-md rounded-2xl border border-white/[0.08] bg-surface-900/60 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:block lg:mt-10">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-status-in-progress shadow-[0_0_12px_rgba(112,167,255,0.45)]" /><span className="text-xs font-semibold text-surface-200">Workflow overview</span></div><span className="text-[10px] text-surface-500">Live workspace</span></div>
            <div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-xl bg-surface-850/80 p-3"><p className="text-[9px] uppercase tracking-wide text-surface-500">Received</p><p className="mt-2 font-heading text-lg font-semibold text-surface-100 tabular-nums">01</p></div><div className="rounded-xl border border-primary-400/10 bg-primary-500/[0.06] p-3"><p className="text-[9px] uppercase tracking-wide text-surface-500">In progress</p><p className="mt-2 font-heading text-lg font-semibold text-primary-200 tabular-nums">02</p></div><div className="rounded-xl bg-surface-850/80 p-3"><p className="text-[9px] uppercase tracking-wide text-surface-500">Completed</p><p className="mt-2 font-heading text-lg font-semibold text-status-completed tabular-nums">03</p></div></div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-surface-500"><Check className="h-3.5 w-3.5 text-status-completed" />Traceable updates, from intake through review.</div>
          </div>
        </div>

        <div className="relative z-10 hidden items-center gap-5 text-[10px] text-surface-500 lg:flex"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary-300" />Role-based workspace</span><span className="h-1 w-1 rounded-full bg-surface-600" /><span>Built for laboratory teams</span></div>
      </section>

      <section className="relative z-10 flex min-h-[calc(100vh-260px)] flex-col items-center justify-center px-5 py-10 sm:px-10 lg:min-h-screen lg:px-10 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white"><Activity className="h-4 w-4" /></span><p className="mt-4 font-heading text-2xl font-semibold text-surface-50">Welcome back</p><p className="mt-1 text-xs text-surface-400">Sign in to your LIMS workspace.</p></div>
          <div className="mb-7 hidden lg:block"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-300">Welcome back</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-surface-50">Sign in to your workspace</h2><p className="mt-2 text-sm text-surface-400">Enter your account details to continue.</p></div>

          {error && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }} role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-status-rejected/20 bg-status-rejected-bg px-3.5 py-3 text-xs leading-5 text-status-rejected"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2"><label htmlFor="login-email" className="text-xs font-semibold text-surface-300">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" /><Input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="ui-input-with-icon" placeholder="you@example.com" autoComplete="email" required /></div></div>
            <div className="space-y-2"><label htmlFor="login-password" className="text-xs font-semibold text-surface-300">Password</label><div className="relative"><Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" /><Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="ui-input-with-icon" placeholder="Enter your password" autoComplete="current-password" required minLength={6} /></div></div>
            <Button type="submit" disabled={isLoading} className="mt-2 w-full">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : <>Sign in<ArrowUpRight className="h-4 w-4" /></>}</Button>
          </form>

          <p className="mt-6 text-center text-xs text-surface-400">Don’t have an account? <Link to="/register" className="font-semibold text-primary-300 underline-offset-4 transition hover:text-cyan-300 hover:underline">Create one</Link></p>
        </motion.div>
        <p className="mt-8 text-center text-[11px] text-surface-500">Made by <span className="font-medium text-surface-400">Nameet Khandre</span></p>
      </section>
    </div>
  );
}
