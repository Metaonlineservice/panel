import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'

export function DocumentsPage() {
  const [docs, setDocs] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ document_name: '', file_url: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setDocs(null); setErr('')
    try { setDocs(await api.listMyDocuments()) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.addDocument(form)
      setOpen(false)
      setForm({ document_name: '', file_url: '' })
      await load()
    } catch (e: any) { setErr(e.message) }
    finally { setSubmitting(false) }
  }

  if (err && !docs) return <ErrorState message={err} />
  if (!docs) return <LoadingState />

  return (
    <div>
      <PageHeader title="My Documents" subtitle="Upload and track verification of your documents." action={<Button onClick={() => setOpen(true)}>+ Upload document</Button>} />

      {docs.length === 0 ? (
        <EmptyState title="No documents uploaded" body="Upload your first document to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map(d => (
            <Card key={d.document_id}>
              <CardBody>
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-navy-900 dark:text-white truncate">{d.document_name}</div>
                  <Badge color={d.verification_status === 'Verified' ? 'green' : d.verification_status === 'Rejected' ? 'red' : 'amber'}>{d.verification_status || 'Pending'}</Badge>
                </div>
                <div className="text-xs text-navy-500 dark:text-navy-300 mt-2">Uploaded {new Date(d.uploaded_at).toLocaleDateString()}</div>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm font-semibold text-navy-600 dark:text-navy-300 hover:text-gold-500">View file →</a>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Upload document" size="md">
        <form onSubmit={submit} className="space-y-4">
          {err && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{err}</div>}
          <Input label="Document name" required value={form.document_name} onChange={e => setForm(f => ({ ...f, document_name: e.target.value }))} placeholder="e.g. Passport scan" />
          <Input label="File URL (Google Drive link)" required value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://drive.google.com/…" />
          <p className="text-xs text-navy-400">Upload your file to Google Drive, make it viewable, and paste the link here.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Uploading…' : 'Upload'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
