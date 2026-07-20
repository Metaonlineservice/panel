import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'
import { VISA_TYPES } from '../../lib/types'

export function AdminRequirements() {
  const [rows, setRows] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    setRows(null); setErr('')
    try { setRows(await api.adminListRequirements()) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  function newReq() {
    setEditing({ country: '', visa_type: 'Tourist', documents: '', processing_time: '', fees: '', eligibility: '', steps: '', embassy_information: '' })
    setOpen(true)
  }
  function edit(r: any) { setEditing({ ...r }); setOpen(true) }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const exists = rows?.some(r => r.country === editing.country && r.visa_type === editing.visa_type)
      if (exists) await api.adminUpdateRequirement(editing)
      else await api.adminUpsertRequirement(editing)
      setOpen(false)
      await load()
    } catch (e: any) { setErr(e.message) }
    finally { setSaving(false) }
  }

  async function del(country: string, visa_type: string) {
    if (!confirm(`Delete ${country} / ${visa_type}?`)) return
    try { await api.adminDeleteRequirement(country, visa_type); await load() }
    catch (e: any) { setErr(e.message) }
  }

  if (err && !rows) return <ErrorState message={err} />
  if (!rows) return <LoadingState />

  return (
    <div>
      <PageHeader title="Visa Requirements" subtitle="Manage country visa requirements shown publicly." action={<Button onClick={newReq}>+ Add requirement</Button>} />
      {rows.length === 0 ? <EmptyState title="No requirements" body="Add your first visa requirement." /> : (
        <Card><CardBody className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Visa type</th>
                  <th className="text-left px-4 py-3">Processing</th>
                  <th className="text-left px-4 py-3">Fees</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{r.country}</td>
                    <td className="px-4 py-3"><Badge color="gray">{r.visa_type}</Badge></td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{r.processing_time || '—'}</td>
                    <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{r.fees || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => edit(r)} className="text-sm font-semibold text-navy-600 dark:text-navy-300 hover:text-gold-500 mr-3">Edit</button>
                      <button onClick={() => del(r.country, r.visa_type)} className="text-sm font-semibold text-red-500 hover:text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody></Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing?.country ? 'Edit requirement' : 'New requirement'} size="lg">
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Country" required value={editing.country} onChange={e => setEditing((r: any) => ({ ...r, country: e.target.value }))} />
              <div>
                <label className="block text-xs font-semibold uppercase text-navy-400 mb-1">Visa type</label>
                <select value={editing.visa_type} onChange={e => setEditing((r: any) => ({ ...r, visa_type: e.target.value }))} className="w-full rounded-lg border border-navy-200 dark:border-navy-700 bg-white dark:bg-navy-900 px-3 py-2 text-sm">
                  {VISA_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Processing time" value={editing.processing_time} onChange={e => setEditing((r: any) => ({ ...r, processing_time: e.target.value }))} />
              <Input label="Fees" value={editing.fees} onChange={e => setEditing((r: any) => ({ ...r, fees: e.target.value }))} />
            </div>
            <Textarea label="Documents" rows={2} value={editing.documents} onChange={e => setEditing((r: any) => ({ ...r, documents: e.target.value }))} />
            <Textarea label="Eligibility" rows={2} value={editing.eligibility} onChange={e => setEditing((r: any) => ({ ...r, eligibility: e.target.value }))} />
            <Textarea label="Steps" rows={3} value={editing.steps} onChange={e => setEditing((r: any) => ({ ...r, steps: e.target.value }))} />
            <Textarea label="Embassy information" rows={2} value={editing.embassy_information} onChange={e => setEditing((r: any) => ({ ...r, embassy_information: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
