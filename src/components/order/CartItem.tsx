import { PRODUCTS } from '../../lib/constants'
import { fmtPrice } from '../../lib/formatters'
import { useCartStore } from '../../store/cartStore'

interface Props {
  cartKey: string
  qty: number
}

export function CartItem({ cartKey, qty }: Props) {
  const { add, remove } = useCartStore()
  const [pid, sz] = cartKey.split('__')
  const product = PRODUCTS.find(p => p.id === pid)
  if (!product) return null

  return (
    <div className="flex items-center py-3 border-b border-gray-100 gap-2.5 flex-wrap">
      <div className="flex-1 min-w-[120px]">
        <span className="font-bold text-gray-900">{product.name}</span>
        <span className="inline-block bg-navy-50 text-navy-700 rounded px-2 py-0.5 text-xs font-bold ml-2">{sz}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => remove(cartKey)}
          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white cursor-pointer font-black text-base flex items-center justify-center text-gray-700 hover:border-gray-300"
        >−</button>
        <span className="font-black min-w-[20px] text-center">{qty}</span>
        <button
          onClick={() => add(pid, sz)}
          className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white cursor-pointer font-black text-base flex items-center justify-center text-gray-700 hover:border-gray-300"
        >+</button>
      </div>
      <div className="font-black text-navy-600 min-w-[80px] text-right font-barlow-condensed text-base">
        {fmtPrice(product.price * qty)}
      </div>
    </div>
  )
}
