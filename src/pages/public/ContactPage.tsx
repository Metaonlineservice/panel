import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../context/I18nContext'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ContactPage() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-display font-extrabold text-4xl text-navy-900 dark:text-white">{t('nav.contact')}</h1>
      <p className="mt-3 text-navy-600 dark:text-navy-300">Questions about your visa journey? Our team responds within one business day.</p>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-navy-400">Email</div>
            <div className="text-navy-800 dark:text-white font-medium">support@metaonlineservice.com</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-navy-400">Phone</div>
            <div className="text-navy-800 dark:text-white font-medium">+1 (800) 555-0142</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-navy-400">Hours</div>
            <div className="text-navy-800 dark:text-white font-medium">Mon–Fri, 9am–6pm GMT</div>
          </div>
        </div>
        <div className="md:col-span-2">
          {sent ? (
            <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-display font-bold text-emerald-800 dark:text-emerald-200">Message sent</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">We'll get back to you shortly.</p>
              <Link to="/" className="inline-block mt-4 text-sm font-semibold text-navy-700 dark:text-navy-200">Back to home</Link>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" required placeholder="Jane Doe" />
                <Input label="Email" type="email" required placeholder="jane@example.com" />
              </div>
              <Select label="Topic">
                <option>General inquiry</option>
                <option>Application support</option>
                <option>Partnership</option>
                <option>Other</option>
              </Select>
              <Textarea label="Message" rows={5} required placeholder="How can we help?" />
              <Button type="submit" className="w-full">Send message</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
