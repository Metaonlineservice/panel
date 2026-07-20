import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { PageHeader, LoadingState, ErrorState } from '../../components/DashboardShell'

export function AdminTemplates() {
  const [rows, setRows] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [active, setActive] = useState<any | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    setRows(null); setErr('')
    try { setRows(await api.adminListTemplates()) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])

  function open(t: any) { setActive(t); setSubject(t.subject || ''); setBody(t.html_body || ''); setMsg('') }

  async function save() {
    if (!active) return
    setSaving(true); setMsg('')
    try {
      await api.adminUpdateTemplate(active.name, subject, body)
      setMsg('Template saved.')
      await load()
    } catch (e: any) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  if (err && !rows) return <ErrorState message={err} />
  if (!rows) return <LoadingState />

  return (
    <div>
      <PageHeader title="Email Templates" subtitle="Customize the automated email templates." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Templates" />
          <CardBody className="p-0">
            <div className="divide-y divide-navy-100 dark:divide-navy-800">
              {rows.map(t => (
                <button key={t.template_id || t.name} onClick={() => open(t)} className={`w-full text-left px-4 py-3 text-sm hover:bg-navy-50 dark:hover:bg-navy-800 ${active?.name === t.name ? 'bg-navy-50 dark:bg-navy-800 font-medium' : ''}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title={active ? active.name : 'Select a template'} />
          <CardBody>
            {active ? (
              <div className="space-y-4">
                <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold uppercase text-navy-400 mb-1">HTML body</label>
                  <Textarea rows={14} value={body} onChange={e => setBody(e.target.value)} className="font-mono text-xs" />
                  <p className="text-xs text-navy-400 mt-1">Variables: {'{{full_name}}'}, {'{{email}}'}, {'{{visa_country}}'}, {'{{visa_type}}'}, {'{{status}}'}, etc.</p>
                </div>
                {msg && <div className={`text-sm rounded-lg px-3 py-2 ${msg.includes('saved') ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>{msg}</div>}
                <div className="flex justify-end"><Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save template'}</Button></div>
              </div>
            ) : <div className="text-sm text-navy-400 text-center py-8">Select a template to edit.</div>}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
