import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '▦' },
  { to: '/admin/applicants', label: 'Applicants', icon: '👥' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/requirements', label: 'Requirements', icon: '🌍' },
  { to: '/admin/templates', label: 'Email Templates', icon: '✉' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
]

export function AdminShell() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      <header className="sticky top-0 z-40 bg-navy-950 text-white border-b border-navy-800">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center">
                <span className="text-gold-400 font-display font-extrabold text-lg">M</span>
              </div>
              <div>
                <div className="font-display font-extrabold text-sm">META ONLINE</div>
                <div className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase">Admin Panel</div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-navy-800" aria-label="Toggle theme">{theme === 'dark' ? '☀' : '☾'}</button>
            <div className="hidden sm:block text-sm text-navy-200">{user?.full_name} · <span className="text-gold-400 capitalize">{user?.role}</span></div>
            <button onClick={() => { signOut(); nav('/') }} className="px-3 py-2 rounded-lg text-sm font-medium text-navy-200 hover:bg-navy-800">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-navy-900 border-r border-navy-100 dark:border-navy-800 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-4 space-y-1">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/admin'}
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
