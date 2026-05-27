import { MOCK_KEY_STATUS } from '../../data/mockData'
import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
  onViewAll?: () => void
}

export function RecentActivity({ operations = [], onViewAll }: Props) {
  const items = operations.length > 0
    ? [...operations].sort((a, b) => b.operatedAt.localeCompare(a.operatedAt)).slice(0, 4).map((operation) => ({
      unitId: operation.unitId,
      timestamp: operation.operatedAt,
      status: operation.opType.replace(' ', '_') as 'KEY_ALERT',
    }))
    : MOCK_KEY_STATUS.slice(0, 4)

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">RECENT ACTIVITY</h2>
        <button type="button" onClick={onViewAll} className="text-xs font-semibold text-blue-600 hover:underline">view all -&gt;</button>
      </div>
      <div className="max-h-[138px] space-y-1.5 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={`${item.unitId}-${item.timestamp}`} className="grid grid-cols-[62px_minmax(64px,1fr)_96px] items-center gap-2 text-[12px]">
            <span className="text-slate-500">{item.timestamp.includes('T') ? item.timestamp.slice(11, 19) : item.timestamp.slice(11)}</span>
            <span className="font-semibold">{item.unitId}</span>
            <StatusBadge status={item.status} blink={item.status === 'KEY_ALERT'} />
          </div>
        ))}
      </div>
    </section>
  )
}
