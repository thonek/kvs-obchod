import { useState } from 'react'
import { KVSLogo } from '../layout/KVSLogo'
import { StatsBar } from './StatsBar'
import { OrderRow } from './OrderRow'
import { InventoryTab } from './InventoryTab'
import { useOrdersStore } from '../../store/ordersStore'

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN as string | undefined

export function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<'orders' | 'inventory'>('orders')
  const orders = useOrdersStore(s => s.orders)

  const handleLogin = () => {
    const correct = ADMIN_PIN ? pin === ADMIN_PIN : pin.length > 0
    if (correct) { setAuthed(true); setError(false) }
    else setError(true)
  }

  if (!authed) return (
    <div className="text-center py-20 px-5">
      <div className="flex justify-center mb-5"><KVSLogo height={56} /></div>
      <div className="text-lg font-black text-gray-800 font-barlow-condensed uppercase tracking-wide">
        Správa skladu
      </div>
      <p className="text-gray-500 mt-2 mb-6 text-sm">Zadejte PIN pro přístup</p>
      <div className="flex gap-2 justify-center">
        <input
          type="password"
          maxLength={6}
          value={pin}
          onChange={e => { setPin(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="• • •"
          className={`w-32 px-3.5 py-2.5 rounded-md border-2 text-center tracking-widest text-xl font-black font-barlow
            ${error ? 'border-red-500' : 'border-gray-200 focus:border-navy-500'}`}
        />
        <button
          onClick={handleLogin}
          className="px-5 py-2.5 bg-navy-700 text-white border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide"
        >
          Vstoupit
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2 font-medium">Nesprávný PIN</p>}
      {!ADMIN_PIN && <p className="text-xs text-gray-400 mt-3">Demo: jakýkoliv PIN</p>}
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h2 className="m-0 text-2xl font-black uppercase tracking-wide font-barlow-condensed text-navy-900">
          Správa
        </h2>
        <button
          onClick={() => { setAuthed(false); setPin('') }}
          className="bg-transparent border border-gray-200 rounded-md px-4 py-2 text-gray-500 cursor-pointer text-xs font-barlow"
        >
          Odhlásit
        </button>
      </div>

      <StatsBar orders={orders} />

      <div className="flex gap-1 mb-5">
        {([
          { key: 'orders' as const,    label: `Objednávky (${orders.length})` },
          { key: 'inventory' as const, label: 'Sklad' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 border-2 rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide transition-colors
              ${tab === t.key ? 'border-navy-600 bg-navy-50 text-navy-700' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        orders.length === 0
          ? <p className="text-center text-gray-400 py-10">Zatím žádné objednávky</p>
          : orders.map(o => <OrderRow key={o.id} order={o} />)
      )}
      {tab === 'inventory' && <InventoryTab />}
    </div>
  )
}
