import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { PageHeader, LoadingState, ErrorState } from '../../components/DashboardShell'

export function AdminAnalytics() {
  const [stats, setStats] = useState<any | null>(null)
  const [apps, setApps] = useState<any[]>([])
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([api.adminStats(), api.adminListApplications()])
      .then(([s, a]) => { setStats(s); setApps(a) })
      .catch(e => setErr(String(e)))
  }, [])

  if (err) return <ErrorState message={err} />
  if (!stats) return <LoadingState />

  const byCountry = new Map<string, number>()
  for (const a of apps) byCountry.set(a.visa_country, (byCountry.get(a.visa_country) || 0) + 1)
  const topCountries = Array.from(byCountry.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const max = Math.max(1, ...topCountries.map(c => c[1]))

  const byStatus = new Map<string, number>()
  for (const a of apps) byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1)

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Insights across applications and applicants." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Total applicants</div><div className="font-display font-extrabold text-2xl text-navy-900 dark:text-white mt-1">{stats.applicants ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Total applications</div><div className="font-display font-extrabold text-2xl text-navy-900 dark:text-white mt-1">{stats.applications ?? 0}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Approval rate</div><div className="font-display font-extrabold text-2xl text-emerald-500 mt-1">{stats.applications ? Math.round((stats.approved / stats.applications) * 100) : 0}%</div></CardBody></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top destinations" />
          <CardBody className="space-y-3">
            {topCountries.length === 0 && <div className="text-sm text-navy-400">No data yet.</div>}
            {topCountries.map(([c, n]) => (
              <div key={c}>
                <div className="flex justify-between text-sm mb-1"><span className="text-navy-700 dark:text-navy-200">{c}</span><span className="text-navy-500 dark:text-navy-300">{n}</span></div>
                <div className="h-2 rounded-full bg-navy-100 dark:bg-navy-800"><div className="h-2 rounded-full bg-gold-400" style={{ width: `${(n / max) * 100}%` }} /></div>
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Applications by status" />
          <CardBody className="space-y-3">
            {Array.from(byStatus.entries()).map(([s, n]) => (
              <div key={s} className="flex justify-between text-sm"><span className="text-navy-700 dark:text-navy-200">{s}</span><span className="font-medium text-navy-900 dark:text-white">{n}</span></div>
            ))}
            {byStatus.size === 0 && <div className="text-sm text-navy-400">No data yet.</div>}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
