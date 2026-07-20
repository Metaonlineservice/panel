import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import type { Lang } from '../context/I18nContext'

export function PublicNavbar() {
  const { t, lang, setLang } = useI18n()
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services') },
    { to: '/countries', label: t('nav.countries') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-navy-100 dark:border-navy-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
            <span className="text-gold-400 font-display font-extrabold text-lg">M</span>
          </div>
          <div className="leading-tight">
            <div className="font-display font-extrabold text-navy-900 dark:text-white text-sm tracking-wide">META ONLINE</div>
            <div className="text-[10px] text-gold-500 font-semibold tracking-widest uppercase">Service</div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}
              className={({ isActive }) => `px-3.5 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'text-navy-900 dark:text-white bg-navy-50 dark:bg-navy-800' : 'text-navy-600 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white'}`}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <select value={lang} onChange={e => setLang(e.target.value as Lang)}
            className="text-sm bg-transparent border border-navy-200 dark:border-navy-700 rounded-lg px-2 py-1.5 text-navy-700 dark:text-navy-200">
            <option value="en">EN</option>
            <option value="fa">FA</option>
            <option value="ar">AR</option>
          </select>
          <button onClick={toggle} className="p-2 rounded-lg text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800">{t('nav.login')}</Link>
          <Link to="/signup" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gold-400 hover:bg-gold-500 text-navy-900">{t('auth.signup')}</Link>
        </div>

        <button className="lg:hidden p-2 text-navy-700 dark:text-white" onClick={() => setOpen(o => !o)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-950 px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800">{l.label}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200">{t('nav.login')}</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2 rounded-lg bg-gold-400 text-navy-900 font-semibold">{t('auth.signup')}</Link>
          </div>
          <button onClick={() => { nav('/admin/login') }} className="block w-full text-left px-3 py-2 text-xs text-navy-500 dark:text-navy-400">{t('nav.admin')} →</button>
        </div>
      )}
    </header>
  )
}

export function PublicFooter() {
  const { t } = useI18n()
  return (
    <footer className="bg-navy-950 text-navy-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center">
              <span className="text-gold-400 font-display font-extrabold text-lg">M</span>
            </div>
            <div>
              <div className="font-display font-extrabold text-white">META ONLINE SERVICE</div>
              <div className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase">Global Visa Processing</div>
            </div>
          </div>
          <p className="text-sm text-navy-300 max-w-md">{t('tagline')}. A professional platform for applicants worldwide.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-gold-400">{t('nav.about')}</Link></li>
            <li><Link to="/services" className="hover:text-gold-400">{t('nav.services')}</Link></li>
            <li><Link to="/countries" className="hover:text-gold-400">{t('nav.countries')}</Link></li>
            <li><Link to="/contact" className="hover:text-gold-400">{t('nav.contact')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="hover:text-gold-400">{t('nav.login')}</Link></li>
            <li><Link to="/signup" className="hover:text-gold-400">{t('auth.signup')}</Link></li>
            <li><Link to="/admin/login" className="hover:text-gold-400">{t('nav.admin')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-sm text-navy-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} META ONLINE SERVICE. {t('footer.rights')}</span>
          <span>support@metaonlineservice.com</span>
        </div>
      </div>
    </footer>
  )
}
