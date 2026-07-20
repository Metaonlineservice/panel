import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'

export function AdminApplicants() {
  const [rows, setRows] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [active, setActive] = useState<any | null>(null)
  const [patch, setPatch] = useState<any>({})

  async function load() {
    setRows(null); setErr('')
    try { setRows(await api.adminListApplicants(q)) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [q])

  function open(a: any) { setActive(a); setPatch({ status: a.status, role: a.role }) }

  async function save() {
    if (!active) return
    try {
      await api.adminUpdateApplicant(active.id, patch)
      setActive(null)
      await load()
    } catch (e: any) { setErr(e.message) }
  }

  if (err && !rows) return <ErrorState message={err} />
  if (!rows) return <LoadingState />

  return (
    <div>
      <PageHeader title="Applicants" subtitle="Manage all applicant accounts." />
      <div className="mb-4 max-w-sm"><Input placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)} /></div>
      {rows.length === 0 ? <EmptyState title="No applicants" /> : (
        <Card><CardBody className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {rows.map(a => (
                  <tr key={a.id} className="cursor-pointer hover:bg-navy-50 dark:hover:bg-navy-800" onClick={() => open(a)}>
                    <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{a.full_name}</td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.email}</td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.country || '—'}</td>
                    <td className="px-4 py-3"><Badge color={a.role === 'admin' ? 'navy' : 'gray'}>{a.role}</Badge></td>
                    <td className="px-4 py-3"><Badge color={a.status === 'suspended' ? 'red' : 'green'}>{a.status || 'active'}</Badge></td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody></Card>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Edit applicant" size="sm">
        {active && (
          <div className="space-y-4">
            <div className="text-sm text-navy-500 dark:text-navy-300">{active.full_name} · {active.email}</div>
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-400 mb-1">Role</label>
              <select value={patch.role} onChange={e => setPatch((p: any) => ({ ...p, role: e.target.value }))} className="w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm">
                <option value="applicant">applicant</option>
                <option value="agent">agent</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-navy-400 mb-1">Status</label>
              <select value={patch.status} onChange={e => setPatch((p: any) => ({ ...p, status: e.target.value }))} className="w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm">
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
