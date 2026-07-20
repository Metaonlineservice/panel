import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PageHeader, LoadingState, ErrorState } from '../../components/DashboardShell'
import { STATUS_COLORS, STATUS_PROGRESS } from '../../lib/types'

export function OverviewPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState<any[] | null>(null)
  const [pays, setPays] = useState<any[] | null>(null)
  const [docs, setDocs] = useState<any[] | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all([api.listMyApplications(), api.listMyPayments(), api.listMyDocuments()])
      .then(([a, p, d]) => { setApps(a); setPays(p); setDocs(d) })
      .catch(e => setErr(String(e)))
  }, [])

  if (err) return <ErrorState message={err} />
  if (!apps || !pays || !docs) return <LoadingState />

  const active = apps.filter(a => a.status !== 'Approved' && a.status !== 'Rejected').length
  const approved = apps.filter(a => a.status === 'Approved').length
  const pendingDocs = docs.filter(d => d.verification_status === 'Pending' || !d.verification_status).length

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.full_name?.split(' ')[0] || 'Applicant'}`} subtitle="Here's the latest on your visa journey." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Total applications" value={apps.length} accent="navy" />
        <Stat label="Active" value={active} accent="gold" />
        <Stat label="Approved" value={approved} accent="green" />
        <Stat label="Pending documents" value={pendingDocs} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your applications" action={<Link to="/dashboard/applications" className="text-sm font-semibold text-navy-600 dark:text-navy-300 hover:text-gold-500">View all →</Link>} />
          <CardBody>
            {apps.length === 0 ? (
              <div className="text-center py-8 text-sm text-navy-400">No applications yet. <Link to="/dashboard/applications" className="font-semibold text-gold-500">Start one →</Link></div>
            ) : (
              <div className="space-y-3">
                {apps.slice(0, 5).map(a => (
                  <div key={a.application_id} className="flex items-center justify-between p-3 rounded-lg bg-navy-50 dark:bg-navy-800">
                    <div>
                      <div className="font-medium text-navy-900 dark:text-white">{a.visa_country} · {a.visa_type}</div>
                      <div className="text-xs text-navy-500 dark:text-navy-300 mt-0.5">{new Date(a.created_at).toLocaleDateString()}</div>
                    </div>
                    <Badge color={STATUS_COLORS[a.status as keyof typeof STATUS_COLORS] || 'gray'}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <CardBody className="space-y-2">
            <Link to="/dashboard/applications" className="block px-4 py-3 rounded-lg bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition">New application</Link>
            <Link to="/dashboard/documents" className="block px-4 py-3 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-50 dark:hover:bg-navy-800 transition">Upload document</Link>
            <Link to="/dashboard/messages" className="block px-4 py-3 rounded-lg border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-sm font-medium hover:bg-navy-50 dark:hover:bg-navy-800 transition">Message support</Link>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: 'navy' | 'gold' | 'green' | 'amber' }) {
  const colors = {
    navy: 'bg-navy-900 text-white',
    gold: 'bg-gold-400 text-navy-900',
    green: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
  }
  return (
    <div className={`p-5 rounded-2xl ${colors[accent]} shadow-card`}>
      <div className="font-display font-extrabold text-3xl">{value}</div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
    </div>
  )
}
