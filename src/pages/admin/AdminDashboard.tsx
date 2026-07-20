import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { PageHeader, LoadingState, ErrorState } from '../../components/DashboardShell'

export function AdminDashboard() {
  const [stats, setStats] = useState<any | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.adminStats().then(setStats).catch(e => setErr(String(e)))
  }, [])

  if (err) return <ErrorState message={err} />
  if (!stats) return <LoadingState />

  const cards = [
    { label: 'Total applicants', value: stats.applicants ?? 0, accent: 'bg-navy-900 text-white' },
    { label: 'Applications', value: stats.applications ?? 0, accent: 'bg-gold-400 text-navy-900' },
    { label: 'Pending review', value: stats.pending ?? 0, accent: 'bg-amber-500 text-white' },
    { label: 'Approved', value: stats.approved ?? 0, accent: 'bg-emerald-500 text-white' },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Platform overview at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className={`p-5 rounded-2xl shadow-card ${c.accent}`}>
            <div className="font-display font-extrabold text-3xl">{c.value}</div>
            <div className="text-sm opacity-90 mt-1">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Quick links" />
          <CardBody className="space-y-2">
            <Link to="/admin/applicants" className="block px-4 py-3 rounded-lg bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-100 dark:hover:bg-navy-700">Manage applicants →</Link>
            <Link to="/admin/applications" className="block px-4 py-3 rounded-lg bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-100 dark:hover:bg-navy-700">Review applications →</Link>
            <Link to="/admin/requirements" className="block px-4 py-3 rounded-lg bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-100 dark:hover:bg-navy-700">Visa requirements →</Link>
            <Link to="/admin/templates" className="block px-4 py-3 rounded-lg bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-100 dark:hover:bg-navy-700">Email templates →</Link>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Export" />
          <CardBody>
            <p className="text-sm text-navy-500 dark:text-navy-300 mb-3">Download a CSV of all applicants and applications.</p>
            <a href={api.adminExportUrl()} target="_blank" rel="noreferrer" className="inline-block px-4 py-2.5 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800">Download CSV</a>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
