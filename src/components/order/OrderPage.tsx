import { PRODUCTS } from '../../lib/constants'
import { fmtPrice } from '../../lib/formatters'
import { useCartStore } from '../../store/cartStore'
import { useOrdersStore } from '../../store/ordersStore'
import { CartItem } from './CartItem'
import { OrderForm, type OrderFormValues } from './OrderForm'
import type { Order, View } from '../../lib/types'

interface Props {
  setView: (v: View) => void
  onSuccess: () => void
}

export function OrderPage({ setView, onSuccess }: Props) {
  const { items, clear, total } = useCartStore()
  const { submit, syncing } = useOrdersStore()
  const cartTotal = total()

  const entries = Object.entries(items)

  if (entries.length === 0) return (
    <div className="text-center py-20 px-5">
      <div className="text-lg font-black text-gray-800 font-barlow-condensed uppercase tracking-wide">
        Objednávka je prázdná
      </div>
      <p className="text-gray-500 mt-2 mb-6 text-sm">Přidejte si oblečení z katalogu</p>
      <button
        onClick={() => setView('catalog')}
        className="px-5 py-2.5 bg-navy-700 text-white border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide"
      >
        Přejít do katalogu
      </button>
    </div>
  )

  const handleSubmit = async (values: OrderFormValues) => {
    const orderItems = entries.map(([key, qty]) => {
      const [pid, sz] = key.split('__')
      const product = PRODUCTS.find(p => p.id === pid)!
      return { productId: pid, size: sz as Order['items'][0]['size'], qty, name: product.name, unitPrice: product.price }
    })

    const order: Order = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ...values,
      phone: values.phone ?? '',
      items: orderItems,
      total: cartTotal,
      date: new Date().toISOString(),
      status: 'pending',
    }

    await submit(order)
    clear()
    onSuccess()
    setView('catalog')
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="m-0 mb-6 text-2xl font-black uppercase tracking-wide font-barlow-condensed text-navy-900">
        Objednávka
      </h2>

      <div className="bg-white rounded-lg p-5 mb-4 border border-gray-200">
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Položky</span>
          <button
            onClick={clear}
            className="bg-transparent border-none text-red-600 cursor-pointer text-xs font-semibold font-barlow"
          >
            Vyprázdnit
          </button>
        </div>
        {entries.map(([key, qty]) => (
          <CartItem key={key} cartKey={key} qty={qty} />
        ))}
        <div className="flex justify-between items-center pt-3.5 mt-2 border-t-[3px] border-navy-800">
          <span className="font-black text-sm uppercase tracking-wide text-gray-700">Celkem</span>
          <span className="font-black text-2xl text-navy-700 font-barlow-condensed">
            {fmtPrice(cartTotal)}
          </span>
        </div>
      </div>

      <OrderForm
        onSubmit={handleSubmit}
        submitting={syncing}
        submitLabel={syncing ? 'Odesílání...' : `Odeslat objednávku — ${fmtPrice(cartTotal)}`}
      />
    </div>
  )
}
