import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
}

export function StatusPanel({ operations = [] }: Props) {
  const liveItems = operations.map((operation) => ({
    unitId: operation.unitId,
    status: operation.opType.replace(' ', '_') as 'KEY_ALERT',
  }))
  const defaultItems = [
    { unitId: 'UNIT-12B', status: 'KEY_CLOSED' as const },
    { unitId: 'UNIT-02A', status: 'KEY_CLOSED' as const },
    { unitId: 'COM-19B', status: 'KEY_CLOSED' as const },
  ]
  const items = liveItems.length > 0 ? liveItems : defaultItems

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-center text-base font-semibold text-slate-950">STATUS</h2>
      <div className={items.length > 5 ? 'max-h-[220px] overflow-y-auto pr-1' : ''}>
        {items.map((item, index) => (
          <div key={`${item.unitId}-${index}`} className="flex items-center justify-between border-b border-slate-200 py-2 text-[11px] font-bold last:border-b-0">
            <span>{item.unitId}</span>
            <StatusBadge status={item.status} blink={item.status === 'KEY_ALERT'} />
          </div>
        ))}
      </div>
    </section>
  )
}
