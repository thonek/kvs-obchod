import { useState } from 'react'
import type { Product, Size } from '../../lib/types'
import { SIZES } from '../../lib/constants'
import { fmtPrice } from '../../lib/formatters'
import { useCartStore } from '../../store/cartStore'
import { useInventoryStore } from '../../store/inventoryStore'

interface Props {
  product: Product
  isOpen: boolean
  onToggle: () => void
  cartQty: number
}

export function ProductCard({ product, isOpen, onToggle, cartQty }: Props) {
  const [selSize, setSelSize] = useState<Size | null>(null)
  const add = useCartStore(s => s.add)
  const getAvail = useInventoryStore(s => s.getAvail)
  const items = useCartStore(s => s.items)

  const totalAvail = SIZES.reduce((s, sz) => s + Math.max(0, getAvail(product.id, sz)), 0)

  const handleAdd = () => {
    if (!selSize) return
    add(product.id, selSize)
    setSelSize(null)
  }

  return (
    <div
      onClick={() => { onToggle(); setSelSize(null) }}
      className={`bg-white rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-150
        ${isOpen ? 'border-navy-500 shadow-[0_4px_16px_rgba(37,99,196,0.12)]' : 'border-gray-200'}
        ${totalAvail === 0 && !isOpen ? 'opacity-50' : ''}`}
    >
      <div className="p-3.5 px-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-sm font-bold text-gray-900">{product.name}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-black text-navy-600 font-barlow-condensed">
              {fmtPrice(product.price)}
            </span>
            <span className={`text-xs font-semibold ${totalAvail > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {totalAvail > 0 ? `${totalAvail} ks` : 'vyprodáno'}
            </span>
          </div>
        </div>
        {cartQty > 0 && (
          <div className="bg-navy-600 text-white rounded-full px-2.5 py-0.5 text-xs font-black">
            {cartQty}×
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className="px-4 pb-4 border-t border-gray-100 pt-3 animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Velikost</div>
          <div className="flex gap-1.5">
            {SIZES.map(sz => {
              const av = getAvail(product.id, sz)
              const inCartForSize = items[`${product.id}__${sz}`] ?? 0
              const remaining = av - inCartForSize
              const sel = selSize === sz
              return (
                <button
                  key={sz}
                  disabled={remaining <= 0}
                  onClick={() => setSelSize(sel ? null : sz)}
                  className={`flex-1 py-2 px-1 rounded-md border-2 transition-all duration-100 font-barlow
                    ${sel ? 'border-navy-500 bg-navy-50' : remaining <= 0 ? 'border-gray-100 opacity-40' : 'border-gray-200 hover:border-gray-300'}
                    ${remaining <= 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`font-black text-sm ${sel ? 'text-navy-600' : 'text-gray-800'}`}>{sz}</div>
                  <div className={`text-xs font-semibold
                    ${remaining <= 0 ? 'text-gray-400' : remaining < 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {remaining <= 0 ? '—' : `${remaining} ks`}
                  </div>
                </button>
              )
            })}
          </div>
          {selSize && (
            <button
              onClick={handleAdd}
              className="mt-2.5 w-full py-2.5 bg-gradient-to-br from-navy-600 to-navy-500 text-white border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide"
            >
              Přidat · {selSize}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
