import type { OrderStatus } from '../../lib/types'

const CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:   { label: 'Čekající',  className: 'bg-amber-100 text-amber-800' },
  paid:      { label: 'Zaplaceno', className: 'bg-emerald-100 text-emerald-800' },
  delivered: { label: 'Vydáno',    className: 'bg-navy-100 text-navy-600' },
  cancelled: { label: 'Zrušeno',   className: 'bg-red-100 text-red-800' },
}

export function Badge({ status }: { status: OrderStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${className}`}>
      {label}
    </span>
  )
}
