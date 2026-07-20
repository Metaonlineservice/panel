import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'
import { STATUS_COLORS, VISA_TYPES } from '../../lib/types'

export function ApplicationsPage() {
  const [apps, setApps] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ visa_country: '', visa_type: 'Tourist', priority: 'Normal', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setApps(null); setErr('')
    try { setApps(await api.listMyApplications()) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createApplication(form)
      setOpen(false)
      setForm({ visa_country: '', visa_type: 'Tourist', priority: 'Normal', notes: '' })
      await load()
    } catch (e: any) { setErr(e.message) }
    finally { setSubmitting(false) }
  }

  if (err && !apps) return <ErrorState message={err} />
  if (!apps) return <LoadingState />

  return (
    <div>
      <PageHeader title="My Applications" subtitle="Submit and track your visa applications." action={<Button onClick={() => setOpen(true)}>+ New application</Button>} />

      {apps.length === 0 ? (
        <EmptyState title="No applications yet" body="Start your first visa application in just a minute." />
      ) : (
        <div className="space-y-4">
          {apps.map(a => (
            <Card key={a.application_id}>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-navy-900 dark:text-white">{a.visa_country}</h3>
                      <Badge color="gray">{a.visa_type}</Badge>
                      {a.priority && a.priority !== 'Normal' && <Badge color="amber">{a.priority}</Badge>}
                    </div>
                    <div className="text-xs text-navy-500 dark:text-navy-300 mt-1">ID: {a.application_id} · Submitted {new Date(a.created_at).toLocaleDateString()}</div>
                    {a.notes && <p className="text-sm text-navy-600 dark:text-navy-300 mt-2">{a.notes}</p>}
                  </div>
                  <Badge color={STATUS_COLORS[a.status as keyof typeof STATUS_COLORS] || 'gray'}>{a.status}</Badge>
                </div>
                <div className="mt-4">
                  <Progress status={a.status} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New visa application" size="md">
        <form onSubmit={submit} className="space-y-4">
          {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</div>}
          <Input label="Destination country" required value={form.visa_country} onChange={e => setForm(f => ({ ...f, visa_country: e.target.value }))} placeholder="e.g. Canada" />
          <Select label="Visa type" value={form.visa_type} onChange={e => setForm(f => ({ ...f, visa_type: e.target.value }))}>
            {VISA_TYPES.map(v => <option key={v}>{v}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option>Normal</option><option>High</option><option>Urgent</option>
          </Select>
          <Textarea label="Notes (optional)" rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any details our team should know" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit application'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Progress({ status }: { status: string }) {
  const steps = ['Submitted', 'Under Review', 'In Progress', 'Approved']
  const idx = steps.indexOf(status)
  if (status === 'Rejected') return <div className="text-sm text-red-500 font-medium">Application rejected — please contact support.</div>
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={`h-1.5 rounded-full ${i <= idx ? 'bg-gold-400' : 'bg-navy-100 dark:bg-navy-800'}`} />
          <div className={`text-[10px] mt-1 ${i <= idx ? 'text-navy-700 dark:text-navy-200 font-medium' : 'text-navy-400'}`}>{s}</div>
        </div>
      ))}
    </div>
  )
}
