import type { Order } from '../../lib/types'
import { fmtPrice } from '../../lib/formatters'

interface Props { orders: Order[] }

export function StatsBar({ orders }: Props) {
  const pending = orders.filter(o => o.status === 'pending').length
  const paid = orders.filter(o => o.status === 'paid').length
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)

  const stats = [
    { label: 'Celkem',    value: orders.length,     color: 'border-navy-600 text-navy-700' },
    { label: 'Čekající', value: pending,            color: 'border-amber-500 text-amber-600' },
    { label: 'Zaplaceno', value: paid,              color: 'border-emerald-500 text-emerald-700' },
    { label: 'Tržby',    value: fmtPrice(revenue),  color: 'border-kvs-red text-kvs-red' },
  ]

  return (
    <div className="grid gap-2.5 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
      {stats.map((s, i) => (
        <div key={i} className={`bg-white rounded-lg px-4 py-3.5 border border-gray-200 border-l-4 ${s.color}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{s.label}</div>
          <div className={`text-xl font-black font-barlow-condensed mt-0.5 ${s.color.split(' ')[1]}`}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}
