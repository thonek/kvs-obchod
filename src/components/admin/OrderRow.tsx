import { useState } from 'react'
import type { Order } from '../../lib/types'
import { fmtPrice, fmtDate } from '../../lib/formatters'
import { useOrdersStore } from '../../store/ordersStore'
import { Badge } from '../ui/Badge'

interface Props { order: Order }

export function OrderRow({ order }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { updateStatus, cancel, syncing } = useOrdersStore()

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-2 overflow-hidden">
      <div
        onClick={() => setExpanded(e => !e)}
        className="flex items-center px-4 py-3.5 cursor-pointer gap-2.5"
      >
        <div className="flex-1">
          <strong className="text-gray-900">{order.surname} {order.name}</strong>
          <span className="ml-2.5"><Badge status={order.status} /></span>
        </div>
        <div className="text-right">
          <div className="font-black text-navy-600 font-barlow-condensed text-base">{fmtPrice(order.total)}</div>
          <div className="text-xs text-gray-400">{fmtDate(order.date)}</div>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 animate-fadeIn">
          {(order.phone || order.email) && (
            <div className="py-2.5 text-xs text-gray-600 flex gap-4 flex-wrap">
              {order.email && <span>✉ {order.email}</span>}
              {order.phone && <span>☎ {order.phone}</span>}
            </div>
          )}
          <table className="w-full border-collapse mt-1">
            <thead>
              <tr>
                {['Položka', 'Vel.', 'Ks', 'Cena'].map((h, i) => (
                  <th key={h} className={`py-1.5 px-2.5 text-xs text-gray-500 border-b border-gray-200 font-bold uppercase tracking-wide ${i === 3 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i}>
                  <td className="py-2 px-2.5 text-sm border-b border-gray-50">{it.name}</td>
                  <td className="py-2 px-2.5 text-sm border-b border-gray-50">{it.size}</td>
                  <td className="py-2 px-2.5 text-sm border-b border-gray-50">{it.qty}</td>
                  <td className="py-2 px-2.5 text-sm border-b border-gray-50 text-right font-bold">{fmtPrice(it.unitPrice * it.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-3.5 flex-wrap">
            {order.status === 'pending' && (
              <button disabled={syncing} onClick={() => updateStatus(order.id, 'paid')}
                className="px-4 py-2 rounded-md border-none font-bold text-xs cursor-pointer font-barlow bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50">
                ✓ Zaplaceno
              </button>
            )}
            {order.status === 'paid' && (
              <button disabled={syncing} onClick={() => updateStatus(order.id, 'delivered')}
                className="px-4 py-2 rounded-md border-none font-bold text-xs cursor-pointer font-barlow bg-navy-100 text-navy-700 hover:bg-navy-200 disabled:opacity-50">
                Vydáno
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button disabled={syncing} onClick={() => cancel(order.id)}
                className="px-4 py-2 rounded-md border-none font-bold text-xs cursor-pointer font-barlow bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50">
                ✕ Zrušit
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
