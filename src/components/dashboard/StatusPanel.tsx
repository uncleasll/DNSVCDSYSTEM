import { MOCK_KEY_STATUS } from '../../data/mockData'
import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
}

export function StatusPanel({ operations = [] }: Props) {
  const liveItems = operations.slice(0, 6).map((operation) => ({
    unitId: operation.unitId,
    status: operation.opType.replace(' ', '_') as 'KEY_ALERT',
  }))
  const items = liveItems.length > 0 ? liveItems : Array.from({ length: 6 }, (_, index) => MOCK_KEY_STATUS[index % MOCK_KEY_STATUS.length])

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-center text-base font-semibold text-slate-950">STATUS</h2>
      <div>
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
