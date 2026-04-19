export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type Category = 'clothing' | 'racing' | 'accessories'
export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled'
export type View = 'catalog' | 'order' | 'admin'

export interface Product {
  id: string
  name: string
  price: number
  category: Category
}

export interface OrderItem {
  productId: string
  size: Size
  qty: number
  name: string
  unitPrice: number
}

export interface Order {
  id: string
  name: string
  surname: string
  email: string
  phone: string
  items: OrderItem[]
  total: number
  date: string
  status: OrderStatus
}

export type NewOrder = Omit<Order, 'id' | 'date' | 'status'>

export type Inventory = Record<string, Record<string, number>>
