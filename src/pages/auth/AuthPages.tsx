import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../context/I18nContext'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

export function LoginPage() {
  const { signIn } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const { role } = await signIn(email, password)
      if (role === 'admin' || role === 'agent') nav('/admin')
      else nav('/dashboard')
    } catch (e: any) {
      setErr(e.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <AuthShell title={t('auth.login')} subtitle="Welcome back. Sign in to continue.">
      <form onSubmit={submit} className="space-y-4">
        {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</div>}
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in…' : t('auth.login')}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-300">
        Don't have an account? <Link to="/signup" className="font-semibold text-navy-700 dark:text-navy-200 hover:text-gold-500">{t('auth.signup')}</Link>
      </p>
      <p className="mt-2 text-center text-xs text-navy-400">
        <Link to="/admin/login" className="hover:text-gold-500">Admin login →</Link>
      </p>
    </AuthShell>
  )
}

export function SignupPage() {
  const { signUp } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', country: '', nationality: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      await signUp({ email: form.email, password: form.password, full_name: form.full_name, phone: form.phone, country: form.country, nationality: form.nationality })
      nav('/dashboard')
    } catch (e: any) {
      setErr(e.message || 'Sign up failed')
    } finally { setLoading(false) }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <AuthShell title={t('auth.signup')} subtitle="Create your applicant account in minutes.">
      <form onSubmit={submit} className="space-y-4">
        {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</div>}
        <Input label="Full name" required value={form.full_name} onChange={set('full_name')} placeholder="Jane Doe" />
        <Input label="Email" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
        <Input label="Password" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 0100" />
          <Input label="Nationality" value={form.nationality} onChange={set('nationality')} placeholder="e.g. Canadian" />
        </div>
        <Input label="Country of residence" value={form.country} onChange={set('country')} placeholder="e.g. Canada" />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account…' : t('auth.signup')}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-300">
        Already have an account? <Link to="/login" className="font-semibold text-navy-700 dark:text-navy-200 hover:text-gold-500">{t('auth.login')}</Link>
      </p>
    </AuthShell>
  )
}

export function AdminLoginPage() {
  const { signIn } = useAuth()
  const { t } = useI18n()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bootstrap, setBootstrap] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      if (mode === 'bootstrap') {
        await api.bootstrapAdmin(bootstrap, email, password)
      }
      const { role } = await signIn(email, password)
      if (role === 'admin' || role === 'agent') nav('/admin')
      else { setErr('This account is not an admin.'); return }
    } catch (e: any) {
      setErr(e.message || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <AuthShell title="Admin Portal" subtitle="Restricted access — administrators and agents only.">
      <div className="flex gap-2 mb-5">
        {(['login', 'bootstrap'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-navy-900 text-white dark:bg-navy-700' : 'bg-navy-50 dark:bg-navy-800 text-navy-600 dark:text-navy-300'}`}>
            {m === 'login' ? 'Sign in' : 'Bootstrap admin'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</div>}
        <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <Input label="Password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        {mode === 'bootstrap' && (
          <Input label="Bootstrap secret" required value={bootstrap} onChange={e => setBootstrap(e.target.value)} placeholder="BOOTSTRAP_ADMIN_SECRET" />
        )}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? t('auth.login') : 'Create admin'}</Button>
      </form>
      <p className="mt-6 text-center text-xs text-navy-400">
        <Link to="/login" className="hover:text-gold-500">← Applicant login</Link>
      </p>
    </AuthShell>
  )
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center">
              <span className="text-gold-400 font-display font-extrabold text-xl">M</span>
            </div>
            <div className="text-center">
              <div className="font-display font-extrabold text-white">META ONLINE SERVICE</div>
              <div className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase">Global Visa Processing</div>
            </div>
          </Link>
          <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-card-hover p-7">
            <h1 className="font-display font-extrabold text-2xl text-navy-900 dark:text-white">{title}</h1>
            <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-300">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
