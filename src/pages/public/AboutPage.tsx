import { useI18n } from '../../context/I18nContext'

export function AboutPage() {
  const { t } = useI18n()
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-extrabold text-4xl text-navy-900 dark:text-white">About {t('brand')}</h1>
      <p className="mt-4 text-lg text-navy-600 dark:text-navy-300 max-w-3xl">
        META ONLINE SERVICE is a global visa processing platform connecting applicants from every country with a streamlined, secure, and professional visa journey — from first application to final approval.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          { title: 'Our mission', body: 'Make visa processing transparent, accessible, and fast for applicants worldwide — regardless of nationality or destination.' },
          { title: 'Our approach', body: 'A dedicated team of visa consultants paired with a secure digital platform that keeps you informed at every step.' },
          { title: 'Our coverage', body: 'Visa requirements for 150+ countries across tourist, business, student, work, family, transit, and residency visas.' },
        ].map(c => (
          <div key={c.title} className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card">
            <h3 className="font-display font-bold text-navy-900 dark:text-white mb-2">{c.title}</h3>
            <p className="text-sm text-navy-500 dark:text-navy-300">{c.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { stat: '150+', label: 'Countries supported' },
          { stat: '7', label: 'Visa types' },
          { stat: '24/7', label: 'Application tracking' },
          { stat: '3', label: 'Languages' },
        ].map(s => (
          <div key={s.label} className="p-6 rounded-2xl bg-navy-900 text-white text-center">
            <div className="font-display font-extrabold text-3xl text-gold-400">{s.stat}</div>
            <div className="text-sm text-navy-200 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
