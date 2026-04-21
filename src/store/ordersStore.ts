import { create } from 'zustand'
import type { Order, OrderStatus } from '../lib/types'
import * as api from '../lib/api'
import { useInventoryStore } from './inventoryStore'

const LS_KEY = 'kvs-orders-v4'

function loadLocal(): Order[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Order[]) : []
  } catch { return [] }
}

function saveLocal(orders: Order[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(orders)) } catch { /* ignore */ }
}

interface OrdersStore {
  orders: Order[]
  syncing: boolean
  load: () => Promise<void>
  submit: (order: Order) => Promise<void>
  updateStatus: (id: string, status: OrderStatus) => Promise<void>
  cancel: (id: string) => Promise<void>
}

export const useOrdersStore = create<OrdersStore>((set, get) => ({
  orders: [],
  syncing: false,

  load: async () => {
    if (api.isOnline()) {
      try {
        const orders = await api.getOrders()
        set({ orders })
      } catch {
        set({ orders: loadLocal() })
      }
    } else {
      set({ orders: loadLocal() })
    }
  },

  submit: async (order) => {
    set({ syncing: true })
    if (api.isOnline()) {
      try {
        await api.submitOrder(order)
        const [orders, inv] = await Promise.all([api.getOrders(), api.getInventory()])
        set({ orders })
        useInventoryStore.getState().save(inv)
      } catch {
        // Offline fallback
        const { orders } = get()
        const invState = useInventoryStore.getState()
        const updated = JSON.parse(JSON.stringify(invState.data))
        order.items.forEach(({ productId, size, qty }) => {
          if (updated[productId]?.[size] !== undefined) updated[productId][size] -= qty
        })
        const next = [order, ...orders]
        saveLocal(next)
        set({ orders: next })
        invState.save(updated)
      }
    } else {
      const { orders } = get()
      const invState = useInventoryStore.getState()
      const updated = JSON.parse(JSON.stringify(invState.data))
      order.items.forEach(({ productId, size, qty }) => {
        if (updated[productId]?.[size] !== undefined) updated[productId][size] -= qty
      })
      const next = [order, ...orders]
      saveLocal(next)
      set({ orders: next })
      invState.save(updated)
    }
    set({ syncing: false })
  },

  updateStatus: async (id, status) => {
    set({ syncing: true })
    if (api.isOnline()) {
      try {
        await api.updateOrderStatus(id, status)
        const orders = await api.getOrders()
        set({ orders })
      } catch {
        const next = get().orders.map(o => o.id === id ? { ...o, status } : o)
        saveLocal(next)
        set({ orders: next })
      }
    } else {
      const next = get().orders.map(o => o.id === id ? { ...o, status } : o)
      saveLocal(next)
      set({ orders: next })
    }
    set({ syncing: false })
  },

  cancel: async (id) => {
    set({ syncing: true })
    if (api.isOnline()) {
      try {
        await api.updateOrderStatus(id, 'cancelled')
        const [orders, inv] = await Promise.all([api.getOrders(), api.getInventory()])
        set({ orders })
        useInventoryStore.getState().save(inv)
      } catch {
        const order = get().orders.find(o => o.id === id)
        if (order) {
          const invState = useInventoryStore.getState()
          const updated = JSON.parse(JSON.stringify(invState.data))
          order.items.forEach(({ productId, size, qty }) => {
            if (updated[productId]?.[size] !== undefined) updated[productId][size] += qty
          })
          const next = get().orders.filter(o => o.id !== id)
          saveLocal(next)
          set({ orders: next })
          invState.save(updated)
        }
      }
    } else {
      const order = get().orders.find(o => o.id === id)
      if (order) {
        const invState = useInventoryStore.getState()
        const updated = JSON.parse(JSON.stringify(invState.data))
        order.items.forEach(({ productId, size, qty }) => {
          if (updated[productId]?.[size] !== undefined) updated[productId][size] += qty
        })
        const next = get().orders.filter(o => o.id !== id)
        saveLocal(next)
        set({ orders: next })
        invState.save(updated)
      }
    }
    set({ syncing: false })
  },
}))
