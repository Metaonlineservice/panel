import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'

export function MessagesPage() {
  const [msgs, setMsgs] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  async function load() {
    setMsgs(null); setErr('')
    try { setMsgs(await api.listMyMessages()) } catch (e: any) { setErr(e.message) }
  }
  useEffect(() => { load() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!form.message.trim()) return
    setSending(true)
    try {
      await api.sendMessage({ subject: form.subject || 'Message', message: form.message })
      setForm({ subject: '', message: '' })
      await load()
    } catch (e: any) { setErr(e.message) }
    finally { setSending(false) }
  }

  if (err && !msgs) return <ErrorState message={err} />
  if (!msgs) return <LoadingState />

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Messages" subtitle="Chat with our visa support team." />
      <Card>
        <CardBody className="flex flex-col h-[60vh]">
          <div className="flex-1 overflow-auto space-y-3 pr-1">
            {msgs.length === 0 && <EmptyState title="No messages yet" body="Send your first message below." />}
            {msgs.map(m => (
              <div key={m.message_id} className={`flex ${m.sender_role === 'applicant' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${m.sender_role === 'applicant' ? 'bg-navy-900 text-white rounded-br-sm' : 'bg-navy-50 dark:bg-navy-800 text-navy-900 dark:text-white rounded-bl-sm'}`}>
                  {m.subject && m.sender_role !== 'applicant' && <div className="text-xs font-semibold text-gold-400 mb-0.5">{m.subject}</div>}
                  <div className="text-sm whitespace-pre-line">{m.message}</div>
                  <div className={`text-[10px] mt-1 ${m.sender_role === 'applicant' ? 'text-navy-300' : 'text-navy-400'}`}>{new Date(m.date).toLocaleString()}</div>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="mt-4 pt-4 border-t border-navy-100 dark:border-navy-800 space-y-3">
            <Input placeholder="Subject (optional)" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            <div className="flex gap-2">
              <Textarea placeholder="Type your message…" rows={2} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="flex-1" />
              <Button type="submit" disabled={sending} className="self-end">{sending ? '…' : 'Send'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
