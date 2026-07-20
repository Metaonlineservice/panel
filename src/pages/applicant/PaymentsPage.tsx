import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PageHeader, LoadingState, ErrorState, EmptyState } from '../../components/DashboardShell'

export function PaymentsPage() {
  const [pays, setPays] = useState<any[] | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.listMyPayments().then(setPays).catch(e => setErr(String(e)))
  }, [])

  if (err) return <ErrorState message={err} />
  if (!pays) return <LoadingState />

  const total = pays.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount || 0), 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle="Your invoices and payment history." />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Total paid</div><div className="font-display font-extrabold text-2xl text-navy-900 dark:text-white mt-1">${total.toFixed(2)}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Invoices</div><div className="font-display font-extrabold text-2xl text-navy-900 dark:text-white mt-1">{pays.length}</div></CardBody></Card>
        <Card><CardBody><div className="text-xs uppercase text-navy-400">Pending</div><div className="font-display font-extrabold text-2xl text-amber-500 mt-1">{pays.filter(p => p.status !== 'Paid').length}</div></CardBody></Card>
      </div>

      {pays.length === 0 ? (
        <EmptyState title="No payments yet" body="Your invoices will appear here once you submit an application." />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-50 dark:bg-navy-800 text-navy-500 dark:text-navy-300 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Invoice</th>
                    <th className="text-left px-4 py-3">Application</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100 dark:divide-navy-800">
                  {pays.map(p => (
                    <tr key={p.payment_id}>
                      <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{p.invoice_number || p.payment_id}</td>
                      <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{p.application_id || '—'}</td>
                      <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{p.amount} {p.currency}</td>
                      <td className="px-4 py-3 text-navy-500 dark:text-navy-300">{p.date ? new Date(p.date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3"><Badge color={p.status === 'Paid' ? 'green' : p.status === 'Refunded' ? 'gray' : 'amber'}>{p.status || 'Pending'}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
