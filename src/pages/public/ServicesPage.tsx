const SERVICES = [
  { icon: '🧳', title: 'Tourist Visa', desc: 'Short-stay visas for tourism, family visits, and leisure travel worldwide.' },
  { icon: '💼', title: 'Business Visa', desc: 'Visas for meetings, conferences, negotiations, and short business trips.' },
  { icon: '🎓', title: 'Student Visa', desc: 'Study abroad with full support for admissions documentation and permits.' },
  { icon: '🏗', title: 'Work Visa', desc: 'Employment-based visas and skilled worker permits for international careers.' },
  { icon: '👨‍👩‍👧', title: 'Family Visa', desc: 'Spousal, dependent, and family reunion visas with personalized guidance.' },
  { icon: '✈', title: 'Transit Visa', desc: 'Short-term transit visas for layovers and connecting flights.' },
  { icon: '🏡', title: 'Residency Visa', desc: 'Long-term residency, investor, and golden visa programs.' },
  { icon: '📊', title: 'Application Tracking', desc: 'Real-time status updates, document checklists, and agent messaging.' },
]

export function ServicesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display font-extrabold text-4xl text-navy-900 dark:text-white">Our Services</h1>
        <p className="mt-3 text-navy-600 dark:text-navy-300 max-w-2xl mx-auto">End-to-end visa processing services for every destination and visa category.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(s => (
          <div key={s.title} className="group p-6 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card hover:shadow-card-hover transition">
            <div className="w-12 h-12 rounded-xl bg-navy-50 dark:bg-navy-800 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">{s.icon}</div>
            <h3 className="font-display font-bold text-navy-900 dark:text-white mb-1.5">{s.title}</h3>
            <p className="text-sm text-navy-500 dark:text-navy-300">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
