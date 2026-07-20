import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'
import { STATUS_COLORS, VISA_STATUSES } from '../../lib/types'

export function AdminApplications() {
  const [rows, setRows] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [active, setActive] = useState<any | null>(null)
  const [form, setForm] = useState({ status: '', note: '', assigned_agent: '', priority: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setRows(null); setErr('')
    try { setRows(await api.adminListApplications(q)) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [q])

  function open(a: any) { setActive(a); setForm({ status: a.status, note: '', assigned_agent: a.assigned_agent || '', priority: a.priority || '' }) }

  async function save() {
    if (!active) return
    setSaving(true)
    try {
      await api.adminUpdateApplicationStatus(active.application_id, form)
      setActive(null)
      await load()
    } catch (e: any) { setErr(e.message) }
    finally { setSaving(false) }
  }

  if (err && !rows) return <ErrorState message={err} />
  if (!rows) return <LoadingState />

  return (
    <div>
      <PageHeader title="Applications" subtitle="Review and update visa applications." />
      <div className="mb-4 max-w-sm"><Input placeholder="Search by country, applicant, or ID…" value={q} onChange={e => setQ(e.target.value)} /></div>
      {rows.length === 0 ? <EmptyState title="No applications" /> : (
        <Card><CardBody className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Applicant</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Priority</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {rows.map(a => (
                  <tr key={a.application_id} className="cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800" onClick={() => open(a)}>
                    <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{a.applicant_name || a.applicant_id}</td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.visa_country}</td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.visa_type}</td>
                    <td className="px-4 py-3">{a.priority && a.priority !== 'Normal' && <Badge color="amber">{a.priority}</Badge>}</td>
                    <td className="px-4 py-3"><Badge color={STATUS_COLORS[a.status as keyof typeof STATUS_COLORS] || 'gray'}>{a.status}</Badge></td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody></Card>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Update application" size="md">
        {active && (
          <div className="space-y-4">
            <div className="text-sm text-navy-500 dark:text-navy-300">{active.visa_country} · {active.visa_type} · {active.application_id}</div>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {VISA_STATUSES.map(s => <option key={s}>{s}</option>)}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Assigned agent" value={form.assigned_agent} onChange={e => setForm(f => ({ ...f, assigned_agent: e.target.value }))} placeholder="Agent name" />
              <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option>Normal</option><option>High</option><option>Urgent</option>
              </Select>
            </div>
            <Textarea label="Note (added to history)" rows={3} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
