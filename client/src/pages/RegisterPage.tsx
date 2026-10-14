import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Activity, ArrowUpRight, Check, Lock, Mail, User, ShieldCheck, FlaskConical, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui/primitives';
import { CursorGlow } from '@/components/ui/CursorGlow';

const roles = [
  { value: 'technician', label: 'Technician', desc: 'Run & update samples', icon: FlaskConical },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access', icon: Eye },
  { value: 'admin', label: 'Admin', desc: 'Full control', icon: ShieldCheck },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('technician');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, role);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-surface-950 lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <CursorGlow intensity="strong" />
      <section className="auth-hero relative z-10 isolate flex min-h-[230px] flex-col justify-between overflow-hidden border-b border-white/[0.06] px-6 py-6 sm:px-10 sm:py-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-10 xl:px-16">
        <div className="pattern-dots pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="pointer-events-none absolute -left-36 top-1/4 -z-10 h-[420px] w-[420px] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[360px] w-[360px] rounded-full bg-cyan-400/10 blur-[110px]" />
        <Link to="/register" className="relative z-10 inline-flex w-fit items-center gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-primary-500"><span className="glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white"><Activity className="h-5 w-5" /></span><span><span className="block font-heading text-sm font-bold tracking-tight text-surface-50">LabCentral</span><span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-surface-400">Laboratory workspace</span></span></Link>

        <div className="relative z-10 my-7 max-w-xl lg:my-0 lg:-translate-y-5">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-300/15 bg-primary-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-200"><ShieldCheck className="h-3.5 w-3.5" />One workspace. Shared progress.</div>
          <h1 className="font-heading text-[30px] font-semibold leading-[1.12] tracking-tight text-surface-50 sm:text-4xl lg:text-[48px] xl:text-[54px]">Bring your lab’s<br /><span className="bg-gradient-to-r from-primary-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">work into focus.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-surface-300 sm:text-base sm:leading-7">Create a secure workspace for sample intake, assignments, review, and traceable team notes.</p>
          <div className="mt-7 hidden max-w-md space-y-2.5 sm:block lg:mt-10"><div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-surface-900/55 px-3.5 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-status-in-progress-bg text-status-in-progress"><Check className="h-3.5 w-3.5" /></span><span className="text-xs text-surface-300">Track samples from intake to completion</span></div><div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-surface-900/55 px-3.5 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-status-completed-bg text-status-completed"><Check className="h-3.5 w-3.5" /></span><span className="text-xs text-surface-300">Keep decisions and updates auditable</span></div></div>
        </div>
        <div className="relative z-10 hidden items-center gap-5 text-[10px] text-surface-500 lg:flex"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary-300" />Role-based workspace</span><span className="h-1 w-1 rounded-full bg-surface-600" /><span>Built for laboratory teams</span></div>
      </section>

      <section className="relative z-10 flex min-h-[calc(100vh-230px)] items-center justify-center px-5 py-8 sm:px-10 lg:min-h-screen lg:px-10 lg:py-10 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="w-full max-w-[420px]">
          <div className="mb-6 lg:mb-7"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-300">Get started</p><h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-surface-50">Create your account</h2><p className="mt-2 text-sm text-surface-400">Set up your access to the LIMS workspace.</p></div>
          {error && <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.16 }} role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-status-rejected/20 bg-status-rejected-bg px-3.5 py-3 text-xs leading-5 text-status-rejected"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><label htmlFor="register-name" className="text-xs font-semibold text-surface-300">Full name</label><div className="relative"><User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" /><Input id="register-name" type="text" value={name} onChange={(event) => setName(event.target.value)} className="ui-input-with-icon" placeholder="Jane Doe" autoComplete="name" required minLength={2} /></div></div>
            <div className="space-y-2"><label htmlFor="register-email" className="text-xs font-semibold text-surface-300">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" /><Input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="ui-input-with-icon" placeholder="you@example.com" autoComplete="email" required /></div></div>
            <div className="space-y-2"><label htmlFor="register-password" className="text-xs font-semibold text-surface-300">Password</label><div className="relative"><Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-500" /><Input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="ui-input-with-icon" placeholder="At least 6 characters" autoComplete="new-password" required minLength={6} /></div></div>

            <fieldset className="space-y-2.5 pt-1"><legend className="text-xs font-semibold text-surface-300">Workspace role</legend><div className="grid grid-cols-3 gap-2">{roles.map((item) => { const Icon = item.icon; const isSelected = role === item.value; return <button key={item.value} type="button" aria-pressed={isSelected} onClick={() => setRole(item.value)} className={`flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-center transition duration-150 focus-visible:ring-2 focus-visible:ring-primary-500 ${isSelected ? 'border-primary-400/30 bg-primary-500/[0.1] text-primary-200 shadow-[0_0_18px_rgba(45,91,255,0.08)]' : 'border-white/[0.07] bg-surface-900/50 text-surface-400 hover:border-surface-600 hover:text-surface-200'}`}><Icon className="h-4 w-4" /><span className="text-[11px] font-semibold">{item.label}</span><span className="text-[9px] leading-3 text-surface-500">{item.desc}</span></button>; })}</div></fieldset>

            <Button type="submit" disabled={isLoading} className="mt-2 w-full">{isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</> : <>Create account<ArrowUpRight className="h-4 w-4" /></>}</Button>
          </form>
          <p className="mt-5 text-center text-xs text-surface-400">Already have an account? <Link to="/login" className="font-semibold text-primary-300 underline-offset-4 transition hover:text-cyan-300 hover:underline">Sign in</Link></p>
          <div className="mt-6 border-t border-white/[0.06] pt-4 text-center text-[10px] text-surface-500">Your laboratory workspace, organized from day one.</div>
        </motion.div>
      </section>
    </div>
  );
}
