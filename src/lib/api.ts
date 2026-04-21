import type { Inventory, Order, OrderStatus } from './types'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export const isOnline = () => !!API_URL

async function call<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const r = await fetch(input, init)
  const d = await r.json() as { success: boolean; data: T }
  if (!d.success) throw new Error('API returned success=false')
  return d.data
}

export async function getInventory(): Promise<Inventory> {
  return call<Inventory>(`${API_URL}?action=getInventory`)
}

export async function getOrders(): Promise<Order[]> {
  return call<Order[]>(`${API_URL}?action=getOrders`)
}

export async function submitOrder(order: Order): Promise<void> {
  await call(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'submitOrder', order }),
  })
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await call(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateStatus', orderId, status }),
  })
}

export async function updateInventory(inventory: Inventory): Promise<void> {
  await call(`${API_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateInventory', inventory }),
  })
}
