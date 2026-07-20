import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Badge'
import { api } from '../../lib/api'

export function CountryDetailPage() {
  const { country = '' } = useParams()
  const { t } = useI18n()
  const [data, setData] = useState<any[] | null>(null)
  const [err, setErr] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    setData(null); setErr('')
    api.listRequirementsForCountry(decodeURIComponent(country)).then(setData).catch(e => setErr(String(e)))
  }, [country])

  const current = data?.[active]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link to="/countries" className="text-sm text-navy-500 dark:text-navy-300 hover:text-navy-900 dark:hover:text-white">← {t('countries.title')}</Link>
      <h1 className="mt-3 font-display font-extrabold text-4xl text-navy-900 dark:text-white">{decodeURIComponent(country)}</h1>

      {err && <div className="text-red-500 text-sm mt-4">{err}</div>}
      {!data && !err && <div className="flex justify-center py-12"><Spinner /></div>}
      {data && data.length === 0 && <div className="py-12 text-center text-navy-500 dark:text-navy-300">No visa information available for this country yet.</div>}

      {data && data.length > 0 && (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            {data.map((r, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${i === active ? 'bg-navy-900 text-white dark:bg-navy-700' : 'bg-navy-50 dark:bg-navy-800 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:hover:bg-navy-700'}`}>
                {r.visa_type}
              </button>
            ))}
          </div>

          {current && (
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title={`${current.visa_type} Visa`} subtitle={current.country} />
                <CardBody className="space-y-5">
                  <Section title="Documents required" body={current.documents} />
                  <Section title="Eligibility" body={current.eligibility} />
                  <Section title="Steps" body={current.steps} />
                  <Section title="Embassy information" body={current.embassy_information} />
                </CardBody>
              </Card>
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Processing & fees" />
                  <CardBody className="space-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-navy-400">Processing time</div>
                      <div className="text-navy-800 dark:text-white font-medium">{current.processing_time || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-navy-400">Fees</div>
                      <div className="text-navy-800 dark:text-white font-medium">{current.fees || '—'}</div>
                    </div>
                    <Link to="/signup" className="block mt-2 text-center px-4 py-2.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold text-sm transition">Apply now</Link>
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader title="Need help?" />
                  <CardBody>
                    <p className="text-sm text-navy-500 dark:text-navy-300">Our consultants guide you through every step of the {current.visa_type} visa for {current.country}.</p>
                    <Link to="/contact" className="block mt-3 text-sm font-semibold text-navy-700 dark:text-navy-200">Contact us →</Link>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Section({ title, body }: { title: string; body?: string }) {
  if (!body) return null
  return (
    <div>
      <h3 className="font-display font-bold text-navy-900 dark:text-white text-sm uppercase tracking-wide mb-1.5">{title}</h3>
      <p className="text-navy-600 dark:text-navy-300 text-sm whitespace-pre-line">{body}</p>
    </div>
  )
}
