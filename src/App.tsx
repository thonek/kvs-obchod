import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { Catalog } from './components/catalog/Catalog'
import { OrderPage } from './components/order/OrderPage'
import { AdminPage } from './components/admin/AdminPage'
import { Spinner } from './components/ui/Spinner'
import { SuccessBanner } from './components/ui/SuccessBanner'
import { useInventoryStore } from './store/inventoryStore'
import { useOrdersStore } from './store/ordersStore'
import type { View } from './lib/types'

export default function App() {
  const [view, setView] = useState<View>('catalog')
  const [showSuccess, setShowSuccess] = useState(false)
  const { load: loadInventory, loading } = useInventoryStore()
  const { load: loadOrders } = useOrdersStore()

  useEffect(() => {
    Promise.all([loadInventory(), loadOrders()])
  }, [loadInventory, loadOrders])

  const handleOrderSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
  }

  if (loading) return <Spinner />

  return (
    <div className="font-barlow min-h-screen bg-gray-50 text-gray-800">
      <Header view={view} setView={setView} />
      {showSuccess && <SuccessBanner />}
      <main className="max-w-5xl mx-auto px-5 py-7 pb-16">
        {view === 'catalog' && <Catalog setView={setView} />}
        {view === 'order'   && <OrderPage setView={setView} onSuccess={handleOrderSuccess} />}
        {view === 'admin'   && <AdminPage />}
      </main>
      <Footer />
    </div>
  )
}
