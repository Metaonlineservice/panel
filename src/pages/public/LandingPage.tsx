import { Link } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'

const FEATURES = [
  { icon: '👥', key: 'experts' },
  { icon: '🌍', key: 'global' },
  { icon: '🔒', key: 'secure' },
  { icon: '⚡', key: 'fast' },
]

const STEPS = [
  { n: '01', title: 'Create your account', desc: 'Register in minutes with your personal details and a secure password.' },
  { n: '02', title: 'Submit your application', desc: 'Choose your destination country and visa type, then submit your application.' },
  { n: '03', title: 'Upload documents', desc: 'Securely upload all required documents and track their verification.' },
  { n: '04', title: 'Track & receive', desc: 'Follow real-time status updates and receive your approved visa.' },
]

export function LandingPage() {
  const { t } = useI18n()
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #e9b62a 0, transparent 40%), radial-gradient(circle at 80% 70%, #3a6ba8 0, transparent 40%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 text-xs font-semibold tracking-wide uppercase mb-5">Global Visa Processing</span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">{t('hero.title')}</h1>
            <p className="mt-5 text-lg text-navy-200 max-w-2xl">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold transition shadow-lg">{t('hero.cta')}</Link>
              <Link to="/countries" className="px-6 py-3 rounded-lg border border-navy-600 hover:border-gold-400 text-white font-semibold transition">{t('hero.secondary')}</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-navy-300">
              <div><div className="text-2xl font-display font-bold text-white">150+</div>Countries</div>
              <div><div className="text-2xl font-display font-bold text-white">7</div>Visa types</div>
              <div><div className="text-2xl font-display font-bold text-white">24/7</div>Tracking</div>
              <div><div className="text-2xl font-display font-bold text-white">3</div>Languages</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl text-navy-900 dark:text-white">{t('features.title')}</h2>
          <p className="mt-3 text-navy-500 dark:text-navy-300">A premium experience built for global applicants.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(f => (
            <div key={f.key} className="group p-6 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card hover:shadow-card-hover transition">
              <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">{f.icon}</div>
              <h3 className="font-display font-bold text-navy-900 dark:text-white mb-1.5">{t(`features.${f.key}`)}</h3>
              <p className="text-sm text-navy-500 dark:text-navy-300">{t(`features.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-50 dark:bg-navy-900/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl text-navy-900 dark:text-white">How it works</h2>
            <p className="mt-3 text-navy-500 dark:text-navy-300">Four simple steps from sign-up to approved visa.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(s => (
              <div key={s.n} className="relative p-6 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card">
                <div className="text-gold-400 font-display font-extrabold text-3xl mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-navy-900 dark:text-white mb-1.5">{s.title}</h3>
                <p className="text-sm text-navy-500 dark:text-navy-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 text-white p-10 lg:p-16 text-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #e9b62a 0, transparent 50%)' }} />
          <div className="relative">
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl">{t('cta.title')}</h2>
            <p className="mt-3 text-navy-200 max-w-xl mx-auto">{t('cta.subtitle')}</p>
            <Link to="/signup" className="inline-block mt-7 px-7 py-3 rounded-lg bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold transition shadow-lg">{t('cta.button')}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
