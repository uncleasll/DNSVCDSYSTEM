import type { Operation } from '../../types'
import { getKeyBoxStatus } from '../../data/keyBoxStatus'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
}

export function StatusPanel({ operations = [] }: Props) {
  const items = operations.slice(0, 10)

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-700">작업 / 키함 상태</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-blue-600 shadow-sm">{operations.length}건</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_72px_56px] border-b border-slate-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
        <span>대상기기</span>
        <span>키함</span>
        <span className="text-right">작업</span>
      </div>
      <div className="max-h-[calc(100%-58px)] overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs font-semibold text-slate-400">등록/진행중인 작업 없음</div>
        ) : items.map((operation, index) => (
          <div key={operation.id} className={`grid grid-cols-[minmax(0,1fr)_72px_56px] items-center gap-2 border-b border-slate-100 px-3 py-2 text-[10px] last:border-b-0 ${index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}>
            <div className="min-w-0">
              <div className="truncate font-black text-blue-700">{operation.unitId}</div>
              <div className="truncate text-[9px] font-semibold text-slate-500">{operation.panelName || operation.equipName}</div>
            </div>
            <StatusBadge status={getKeyBoxStatus(operation.unitId)?.keyStatus ?? operation.opType} blink={operation.opType === 'KEY ALERT'} />
            <div className="text-right"><StatusBadge status={operation.status} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}
