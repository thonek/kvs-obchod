import { KVSLogo } from './KVSLogo'
import { useCartStore } from '../../store/cartStore'
import { useOrdersStore } from '../../store/ordersStore'
import { isOnline } from '../../lib/api'
import type { View } from '../../lib/types'

interface Props {
  view: View
  setView: (v: View) => void
}

export function Header({ view, setView }: Props) {
  const count = useCartStore(s => s.count())
  const syncing = useOrdersStore(s => s.syncing)

  const tabs: { key: View; label: string }[] = [
    { key: 'catalog', label: 'Katalog' },
    { key: 'order',   label: count > 0 ? `Objednávka (${count})` : 'Objednávka' },
    { key: 'admin',   label: 'Správa' },
  ]

  return (
    <header className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white sticky top-0 z-50 shadow-[0_4px_24px_rgba(10,30,61,0.4)]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="flex items-center gap-4 py-3.5">
          <KVSLogo height={46} />
          <div className="flex-1">
            <h1 className="m-0 text-xl font-black uppercase tracking-wide font-barlow-condensed">
              Klubové oblečení
            </h1>
            <p className="m-0 text-xs opacity-50 tracking-wider">Klub vodních sportů Praha</p>
          </div>
          {!isOnline() && (
            <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full opacity-70">demo</span>
          )}
          {syncing && <span className="text-xs text-kvs-red">⟳</span>}
        </div>
        <nav className="flex gap-0.5 border-t border-navy-700">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-5 py-2.5 border-none cursor-pointer text-xs font-bold font-barlow uppercase tracking-wide transition-all duration-150 rounded-t-md
                ${view === t.key
                  ? 'bg-white text-navy-800'
                  : 'bg-transparent text-white/55 hover:text-white/80'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
