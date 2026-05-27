import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'

type Props = {
  operations?: Operation[]
}

export function StatusPanel({ operations = [] }: Props) {
  const fallbackItems: Operation[] = [
    { id: 0, panelId: 42, unitId: 'UNIT-12B', equipName: 'ASP-A', panelName: 'ASP-A', opType: 'KEY ALERT', operator: '-', department: '-', purpose: '-', status: '진행중', notes: '', operatedAt: '2026-05-19T14:30:00' },
    { id: -1, panelId: 26, unitId: 'COM-20B', equipName: 'START-UP TR INCOMING', panelName: 'START-UP TR INCOMING', opType: 'KEY OPEN', operator: '-', department: '-', purpose: '-', status: '진행중', notes: '', operatedAt: '2026-05-19T13:00:00' },
    { id: -2, panelId: 12, unitId: 'UNIT-07B', equipName: 'STAGE 2 HAMMER MILL', panelName: 'STAGE 2 HAMMER MILL', opType: 'KEY CLOSED', operator: '-', department: '-', purpose: '-', status: '완료', notes: '', operatedAt: '2026-05-19T11:00:00' },
  ]
  const items = (operations.length > 0 ? operations : fallbackItems).slice(0, 8)

  return (
    <section className="min-h-0 overflow-hidden rounded-xl border-2 border-sky-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-sky-50 px-3 py-2">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600">조작 등록 내역</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-blue-600 shadow-sm">{operations.length}건</span>
      </div>
      <div className="grid grid-cols-[1fr_auto] border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-400">
        <span>기기번호 / 키상태</span>
        <span>상세</span>
      </div>
      <div className="max-h-[calc(100%-58px)] space-y-2 overflow-y-auto p-2">
        {items.map((operation, index) => (
          <div key={operation.id} className={`rounded-lg border border-slate-100 px-2.5 py-2 text-[10px] shadow-sm ${index % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate font-black text-blue-700">{operation.unitId}</div>
                <div className="truncate text-[9px] font-semibold text-slate-500">{operation.panelName || operation.equipName}</div>
              </div>
              <button type="button" className="shrink-0 rounded-md border border-blue-100 bg-blue-50 px-1.5 py-1 text-[9px] font-black text-blue-600">상세</button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={operation.opType} blink={operation.opType === 'KEY ALERT'} />
              <StatusBadge status={operation.status} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
