import { create } from 'zustand'
import type { Inventory } from '../lib/types'
import { DEFAULT_INVENTORY } from '../lib/constants'
import * as api from '../lib/api'

const LS_KEY = 'kvs-inventory-v4'

function loadLocal(): Inventory | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Inventory) : null
  } catch { return null }
}

function saveLocal(inv: Inventory) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(inv)) } catch { /* ignore */ }
}

interface InventoryStore {
  data: Inventory
  loading: boolean
  syncing: boolean
  load: () => Promise<void>
  save: (updated: Inventory) => Promise<void>
  getAvail: (productId: string, size: string) => number
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  data: DEFAULT_INVENTORY,
  loading: true,
  syncing: false,

  load: async () => {
    set({ loading: true })
    if (api.isOnline()) {
      try {
        const inv = await api.getInventory()
        set({ data: inv })
      } catch {
        const local = loadLocal()
        if (local) set({ data: local })
      }
    } else {
      const local = loadLocal()
      if (local) set({ data: local })
    }
    set({ loading: false })
  },

  save: async (updated) => {
    set({ syncing: true })
    if (api.isOnline()) {
      try { await api.updateInventory(updated) } catch { /* best effort */ }
    } else {
      saveLocal(updated)
    }
    set({ data: updated, syncing: false })
  },

  getAvail: (productId, size) => get().data[productId]?.[size] ?? 0,
}))
