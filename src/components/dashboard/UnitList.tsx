import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MOCK_UNITS } from '../../data/mockData'

type Props = {
  selectedUnitIds?: string[]
  onToggleUnit?: (unitId: string) => void
}

export function UnitList({ selectedUnitIds = [], onToggleUnit }: Props) {
  const [query, setQuery] = useState('')
  const units = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return MOCK_UNITS
    return MOCK_UNITS.filter((unit) => `${unit.id} ${unit.unitId} ${unit.name}`.toLowerCase().includes(term))
  }, [query])

  return (
    <section className="flex h-[calc(100vh-104px)] min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="UNIT / equipment search" className="h-9 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-xs outline-none focus:border-blue-500" />
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1">
        {units.map((unit) => {
          const selected = selectedUnitIds.includes(unit.unitId)

          return (
            <button key={unit.id} type="button" onClick={() => onToggleUnit?.(unit.unitId)} title={`${unit.unitId} · ${unit.name}`} className={`min-h-[52px] rounded-md border px-2 py-1.5 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50/40 ${selected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white'}`}>
              <div className="grid grid-cols-[20px_minmax(0,1fr)] gap-1.5">
                <span className="pt-0.5 text-center text-sm font-black leading-none text-blue-700">{unit.id}</span>
                <div className="min-w-0 overflow-hidden leading-tight">
                  <div className="break-words text-[10px] font-black leading-[1.1] text-slate-950">{unit.unitId}</div>
                  <div className="mt-0.5 break-words text-[8px] font-bold uppercase leading-[1.15] text-slate-500">{unit.name}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <button type="button" className="mt-3 h-9 rounded-lg border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-50">view all units</button>
    </section>
  )
}
