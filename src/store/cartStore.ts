import { create } from 'zustand'
import { PRODUCTS } from '../lib/constants'

interface CartStore {
  items: Record<string, number>
  add: (productId: string, size: string) => void
  remove: (key: string) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: {},

  add: (productId, size) => {
    const key = `${productId}__${size}`
    set(s => ({ items: { ...s.items, [key]: (s.items[key] ?? 0) + 1 } }))
  },

  remove: (key) => {
    set(s => {
      const next = { ...s.items }
      if (next[key] > 1) next[key]--
      else delete next[key]
      return { items: next }
    })
  },

  clear: () => set({ items: {} }),

  total: () =>
    Object.entries(get().items).reduce((sum, [key, qty]) => {
      const pid = key.split('__')[0]
      const price = PRODUCTS.find(p => p.id === pid)?.price ?? 0
      return sum + price * qty
    }, 0),

  count: () => Object.values(get().items).reduce((s, q) => s + q, 0),
}))
