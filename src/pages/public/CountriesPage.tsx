import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { Input, Select } from '../../components/ui/Input'
import { Spinner } from '../../components/ui/Badge'
import { api } from '../../lib/api'

export function CountriesPage() {
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [data, setData] = useState<any[] | null>(null)
  const [err, setErr] = useState('')

  useMemo(() => {
    let active = true
    setData(null); setErr('')
    api.listRequirements().then(d => { if (active) setData(d) }).catch(e => { if (active) setErr(String(e)) })
    return () => { active = false }
  }, [])

  const countries = useMemo(() => {
    const map = new Map<string, any>()
    for (const r of data || []) {
      const c = r.country
      if (!c) continue
      if (!map.has(c)) map.set(c, { country: c, types: [] as string[] })
      const entry = map.get(c)!
      if (!entry.types.includes(r.visa_type)) entry.types.push(r.visa_type)
    }
    let arr = Array.from(map.values())
    if (type) arr = arr.filter(c => c.types.includes(type))
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      arr = arr.filter(c => c.country.toLowerCase().includes(s))
    }
    arr.sort((a, b) => a.country.localeCompare(b.country))
    return arr
  }, [data, q, type])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-extrabold text-4xl text-navy-900 dark:text-white">{t('countries.title')}</h1>
      <p className="mt-3 text-navy-600 dark:text-navy-300 max-w-2xl">{t('countries.subtitle')}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Search countries…" value={q} onChange={e => setQ(e.target.value)} />
        <Select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All visa types</option>
          <option>Tourist</option><option>Business</option><option>Student</option>
          <option>Work</option><option>Family</option><option>Transit</option><option>Residency</option>
        </Select>
      </div>

      <div className="mt-8">
        {err && <div className="text-red-500 text-sm">{err}</div>}
        {!data && !err && <div className="flex justify-center py-12"><Spinner /></div>}
        {data && countries.length === 0 && <div className="text-navy-500 dark:text-navy-300 py-12 text-center">No countries match your search.</div>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map(c => (
            <Link key={c.country} to={`/countries/${encodeURIComponent(c.country)}`}
              className="group p-5 rounded-2xl bg-white dark:bg-navy-900 border border-navy-100 dark:border-navy-800 shadow-card hover:shadow-card-hover transition flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-navy-900 dark:text-white">{c.country}</div>
                <div className="text-xs text-navy-500 dark:text-navy-300 mt-1">{c.types.length} visa type{c.types.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-gold-400 group-hover:translate-x-1 transition">→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
