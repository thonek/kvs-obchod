import { useState } from 'react'
import { PRODUCTS, CATEGORIES, CATEGORY_ORDER } from '../../lib/constants'
import { useCartStore } from '../../store/cartStore'
import { ProductCard } from './ProductCard'
import type { View } from '../../lib/types'

interface Props {
  setView: (v: View) => void
}

export function Catalog({ setView }: Props) {
  const [openProduct, setOpenProduct] = useState<string | null>(null)
  const { items, count } = useCartStore()
  const cartCount = count()

  const grouped = PRODUCTS.reduce<Record<string, typeof PRODUCTS>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-6">
        <h2 className="m-0 mb-6 text-2xl font-black uppercase tracking-wide font-barlow-condensed text-navy-900">
          Katalog
        </h2>
        <p className="mt-[-16px] text-gray-500 text-sm">Klikněte na produkt pro výběr velikosti</p>
      </div>

      {CATEGORY_ORDER.map(cat => (
        <div key={cat} className="mb-8">
          <div className="flex items-center gap-2.5 mb-3 pb-2 border-b-[3px] border-navy-800">
            <span className="font-barlow-condensed text-sm font-bold uppercase tracking-widest text-navy-700">
              {CATEGORIES[cat]}
            </span>
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {(grouped[cat] ?? []).map(product => {
              const cartQty = Object.entries(items)
                .filter(([k]) => k.startsWith(product.id + '__'))
                .reduce((s, [, q]) => s + q, 0)
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isOpen={openProduct === product.id}
                  onToggle={() => setOpenProduct(openProduct === product.id ? null : product.id)}
                  cartQty={cartQty}
                />
              )
            })}
          </div>
        </div>
      ))}

      {cartCount > 0 && (
        <div
          onClick={() => setView('order')}
          className="animate-slideUp fixed bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-navy-800 to-navy-600 text-white px-8 py-3.5 rounded-full font-black text-sm cursor-pointer shadow-[0_8px_32px_rgba(10,30,61,0.5)] z-50 font-barlow uppercase tracking-wide border-2 border-kvs-red"
        >
          Zobrazit objednávku · {cartCount} pol.
        </div>
      )}
    </div>
  )
}
