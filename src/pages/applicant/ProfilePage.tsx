import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { PageHeader, LoadingState } from '../../components/DashboardShell'

export function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({ full_name: '', phone: '', country: '', nationality: '', passport_number: '', date_of_birth: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (user) setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      country: user.country || '',
      nationality: user.nationality || '',
      passport_number: user.passport_number || '',
      date_of_birth: user.date_of_birth || '',
    })
  }, [user])

  if (!user) return <LoadingState />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      await api.updateMe(form)
      await refreshProfile()
      setMsg('Profile updated successfully.')
    } catch (e: any) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information." />
      <Card>
        <CardHeader title="Personal details" />
        <CardBody>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Full name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            <Input label="Email" value={user.email} disabled />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Country of residence" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
              <Input label="Nationality" value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
            </div>
            <Input label="Passport number" value={form.passport_number} onChange={e => setForm(f => ({ ...f, passport_number: e.target.value }))} />
            {msg && <div className={`text-sm rounded-lg px-3 py-2 ${msg.includes('success') ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}>{msg}</div>}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
