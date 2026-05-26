import { MOCK_KEY_STATUS } from '../../data/mockData'
import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
}

export function RecentActivity({ operations = [] }: Props) {
  const items = operations.length > 0
    ? operations.slice(0, 4).map((operation) => ({
      unitId: operation.unitId,
      timestamp: operation.operatedAt,
      status: operation.opType.replace(' ', '_') as 'KEY_ALERT',
    }))
    : MOCK_KEY_STATUS.slice(0, 4)

  return (
    <section className="min-h-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">RECENT ACTIVITY</h2>
        <button type="button" className="text-sm font-semibold text-blue-600">view all →</button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.unitId}-${item.timestamp}`} className="grid grid-cols-[72px_1fr_104px] items-center text-[13px]">
            <span className="text-slate-500">{item.timestamp.slice(11)}</span>
            <span className="font-semibold">{item.unitId}</span>
            <StatusBadge status={item.status} blink={item.status === 'KEY_ALERT'} />
          </div>
        ))}
      </div>
    </section>
  )
}
