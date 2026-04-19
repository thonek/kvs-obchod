import type { Product, Size, Inventory } from './types'

export const PRODUCTS: Product[] = [
  { id: 'triko_kratky', name: 'Triko krátký rukáv', price: 550, category: 'clothing' },
  { id: 'triko_dlouhy', name: 'Triko dlouhý rukáv', price: 800, category: 'clothing' },
  { id: 'polo', name: 'Polo triko', price: 800, category: 'clothing' },
  { id: 'mikina', name: 'Mikina s kapucí', price: 950, category: 'clothing' },
  { id: 'vesta', name: 'Vesta modrá', price: 1500, category: 'clothing' },
  { id: 'kratasy_volne', name: 'Volné kraťasy', price: 700, category: 'clothing' },
  { id: 'leginy', name: 'Dlouhé legíny', price: 700, category: 'clothing' },
  { id: 'tilko', name: 'Závodní tílko', price: 750, category: 'racing' },
  { id: 'kratasy_zavodni', name: 'Závodní kraťasy', price: 850, category: 'racing' },
  { id: 'spricdeka', name: 'Špricdeka', price: 1500, category: 'racing' },
  { id: 'cepice_tenka', name: 'Čepice tenká', price: 300, category: 'accessories' },
  { id: 'cepice_tlusta', name: 'Čepice tlustá', price: 350, category: 'accessories' },
  { id: 'celenka', name: 'Čelenka', price: 200, category: 'accessories' },
  { id: 'ksiltovka', name: 'Kšiltovka', price: 150, category: 'accessories' },
]

export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL']

export const CATEGORIES: Record<string, string> = {
  clothing: 'Oblečení',
  racing: 'Závodní',
  accessories: 'Doplňky',
}

export const CATEGORY_ORDER = ['clothing', 'racing', 'accessories'] as const

export const DEFAULT_INVENTORY: Inventory = {
  triko_kratky:    { XS: 0, S: 3,  M: 1,  L: 4,  XL: 1 },
  triko_dlouhy:    { XS: 6, S: 10, M: 2,  L: 4,  XL: 3 },
  kratasy_volne:   { XS: 1, S: 4,  M: 2,  L: 0,  XL: 0 },
  leginy:          { XS: 1, S: 0,  M: 3,  L: 0,  XL: 0 },
  mikina:          { XS: 0, S: 4,  M: 3,  L: 2,  XL: 0 },
  polo:            { XS: 0, S: 15, M: 2,  L: 6,  XL: 0 },
  tilko:           { XS: 6, S: 9,  M: 0,  L: 12, XL: 7 },
  vesta:           { XS: 0, S: 9,  M: 11, L: 12, XL: 3 },
  kratasy_zavodni: { XS: 10, S: 6, M: 0,  L: 2,  XL: 0 },
  spricdeka:       { XS: 0, S: 0,  M: 20, L: 0,  XL: 0 },
  cepice_tenka:    { XS: 0, S: 12, M: 10, L: 5,  XL: 0 },
  cepice_tlusta:   { XS: 0, S: 20, M: 10, L: 12, XL: 0 },
  celenka:         { XS: 0, S: 0,  M: 36, L: 0,  XL: 0 },
  ksiltovka:       { XS: 0, S: 0,  M: 10, L: 0,  XL: 0 },
}
