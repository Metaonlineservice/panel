import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'
import { Spinner } from './ui/Badge'

const NAV = [
  { to: '/dashboard', label: 'Overview', icon: '▦' },
  { to: '/dashboard/applications', label: 'Applications', icon: '📋' },
  { to: '/dashboard/documents', label: 'Documents', icon: '📄' },
  { to: '/dashboard/messages', label: 'Messages', icon: '✉' },
  { to: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { to: '/dashboard/profile', label: 'Profile', icon: '⚙' },
]

export function DashboardShell() {
  const { user, signOut } = useAuth()
  const { t } = useI18n()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<any[]>([])
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  async function loadNotifs() {
    try { setNotifs(await api.listMyNotifications()) } catch { /* ignore */ }
  }
  useEffect(() => { loadNotifs() }, [])
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const unread = notifs.filter(n => !n.read_status || n.read_status === 'false' || n.read_status === false).length

  async function markAll() {
    await api.markAllNotificationsRead()
    await loadNotifs()
  }

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      <header className="sticky top-0 z-40 bg-white dark:bg-navy-900 border-b border-navy-100 dark:border-navy-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-navy-700 dark:text-white" onClick={() => setOpen(o => !o)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
                <span className="text-gold-400 font-display font-extrabold text-lg">M</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-extrabold text-navy-900 dark:text-white text-sm">META ONLINE</div>
                <div className="text-[10px] text-gold-500 font-semibold tracking-widest uppercase">Applicant Portal</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={bellRef}>
              <button onClick={() => { setBellOpen(o => !o); if (!bellOpen) loadNotifs() }} className="relative p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Notifications">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-400 text-navy-900 text-[10px] font-bold flex items-center justify-center">{unread}</span>}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto rounded-xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card-hover z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-navy-100 dark:border-navy-800">
                    <span className="font-display font-bold text-navy-900 dark:text-white text-sm">Notifications</span>
                    {unread > 0 && <button onClick={markAll} className="text-xs text-navy-500 dark:text-navy-300 hover:text-gold-500">Mark all read</button>}
                  </div>
                  {notifs.length === 0 && <div className="px-4 py-8 text-center text-sm text-navy-400">No notifications</div>}
                  {notifs.map(n => (
                    <div key={n.notification_id} className={`px-4 py-3 border-b border-navy-50 dark:border-navy-800 ${n.read_status === 'true' || n.read_status === true ? 'opacity-60' : ''}`}>
                      <div className="text-sm font-medium text-navy-900 dark:text-white">{n.title}</div>
                      <div className="text-xs text-navy-500 dark:text-navy-300 mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggle} className="p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Toggle theme">
              {theme === 'dark' ? '☀' : '☾'}
            </button>
            <div className="hidden sm:block text-sm text-navy-700 dark:text-navy-200 max-w-[10rem] truncate">{user?.full_name}</div>
            <button onClick={() => { signOut(); nav('/') }} className="px-3 py-2 rounded-lg text-sm font-medium text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800">{t('auth.logout')}</button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-navy-900 border-r border-navy-100 dark:border-navy-800 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-4 space-y-1">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/dashboard'}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-navy-900 text-white dark:bg-navy-700' : 'text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'}`}>
                <span className="w-5 text-center">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        {open && <div className="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-navy-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-500 dark:text-navy-300">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function LoadingState() {
  return <div className="flex justify-center py-16"><Spinner /></div>
}

export function ErrorState({ message }: { message: string }) {
  return <div className="text-center py-16 text-red-500">{message}</div>
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3 opacity-50">📭</div>
      <h3 className="font-display font-bold text-navy-900 dark:text-white">{title}</h3>
      {body && <p className="mt-1 text-sm text-navy-500 dark:text-navy-300">{body}</p>}
    </div>
  )
}
