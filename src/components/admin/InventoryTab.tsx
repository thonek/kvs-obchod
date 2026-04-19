import { useState } from 'react'
import { PRODUCTS, SIZES } from '../../lib/constants'
import { useInventoryStore } from '../../store/inventoryStore'
import type { Inventory } from '../../lib/types'

export function InventoryTab() {
  const { data, save } = useInventoryStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Inventory | null>(null)

  const startEdit = () => { setDraft(JSON.parse(JSON.stringify(data))); setEditing(true) }
  const cancelEdit = () => { setEditing(false); setDraft(null) }
  const saveEdit = async () => {
    if (draft) { await save(draft); setEditing(false); setDraft(null) }
  }

  const inv = editing && draft ? draft : data

  return (
    <div>
      <div className="flex justify-end mb-3.5 gap-2">
        {editing ? (
          <>
            <button onClick={saveEdit} className="px-5 py-2.5 bg-emerald-600 text-white border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide">
              Uložit
            </button>
            <button onClick={cancelEdit} className="px-5 py-2.5 bg-gray-200 text-gray-700 border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide">
              Zrušit
            </button>
          </>
        ) : (
          <button onClick={startEdit} className="px-5 py-2.5 bg-navy-600 text-white border-none rounded-md font-bold text-xs cursor-pointer font-barlow uppercase tracking-wide">
            Upravit sklad
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="py-2.5 px-3 text-xs font-bold text-gray-500 border-b-2 border-gray-200 uppercase tracking-wide text-left">Produkt</th>
              {SIZES.map(sz => (
                <th key={sz} className="py-2.5 px-3 text-xs font-bold text-gray-500 border-b-2 border-gray-200 uppercase tracking-wide text-center">{sz}</th>
              ))}
              <th className="py-2.5 px-3 text-xs font-bold text-gray-500 border-b-2 border-gray-200 uppercase tracking-wide text-center">Σ</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(pr => {
              const row = inv[pr.id] ?? {}
              const tot = SIZES.reduce((s, sz) => s + (row[sz] ?? 0), 0)
              return (
                <tr key={pr.id}>
                  <td className="py-2.5 px-3 text-xs font-semibold border-b border-gray-100 whitespace-nowrap">{pr.name}</td>
                  {SIZES.map(sz => {
                    const v = row[sz] ?? 0
                    return (
                      <td key={sz} className={`py-2 px-2.5 text-center font-bold text-sm border-b border-gray-100
                        ${v <= 0 ? 'bg-red-50 text-red-600' : v < 3 ? 'bg-amber-50 text-amber-600' : 'text-gray-800'}`}>
                        {editing && draft ? (
                          <input
                            type="number"
                            value={draft[pr.id]?.[sz] ?? 0}
                            onChange={e => {
                              const next = { ...draft }
                              next[pr.id] = { ...next[pr.id], [sz]: parseInt(e.target.value) || 0 }
                              setDraft(next)
                            }}
                            className="w-12 p-1 border-2 border-navy-200 rounded text-center text-sm font-bold font-barlow"
                          />
                        ) : v}
                      </td>
                    )
                  })}
                  <td className="py-2 px-2.5 text-center font-black text-sm border-b border-gray-100 text-navy-800">{tot}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
