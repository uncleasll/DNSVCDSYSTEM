import { ModalShell } from './ModalShell'
import { MOCK_HISTORY } from '../../data/mockData'
import { StatusBadge } from '../ui/StatusBadge'
import type { Operation } from '../../types'

export function HistoryModal({ operations = [], onClose }: { operations?: Operation[]; onClose: () => void }) {
  const rows = operations.length > 0
    ? operations.map((operation) => ({
      unitId: operation.unitId,
      equipName: operation.equipName || operation.panelName || '',
      status: operation.opType.replace(' ', '_'),
      operator: operation.operator,
      timestamp: operation.operatedAt,
      workStatus: operation.status,
    }))
    : MOCK_HISTORY

  return (
    <ModalShell onClose={onClose} className="max-w-4xl">
      <div className="shrink-0 border-b border-slate-200 p-6">
        <h2 className="text-2xl font-black">이력 조회</h2>
        <div className="text-sm font-bold text-slate-500">이력조회</div>
      </div>
      <div className="min-h-0 flex-1 p-6">
        <div className="mb-5 flex items-center gap-4">
          <select className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold"><option>전체 상태</option></select>
          <input type="date" className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold" />
          <div className="ml-auto text-sm font-bold text-slate-500">{rows.length}건</div>
        </div>
        <div className="max-h-[calc(100vh-280px)] overflow-y-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
              <tr>{['대상기기', '대상기기명', '기상태', '조작자', '일시', '작업상태'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.unitId}-${row.timestamp}`} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-bold text-blue-600">{row.unitId}</td>
                  <td className="px-5 py-3 font-semibold">{row.equipName}</td>
                  <td className={`px-5 py-3 font-black ${row.status === 'KEY_ALERT' ? 'text-red-600' : row.status === 'KEY_OPEN' ? 'text-emerald-600' : 'text-blue-600'}`}>{row.status.replace('_', ' ')}</td>
                  <td className="px-5 py-3 font-semibold">{row.operator}</td>
                  <td className="px-5 py-3 text-slate-500">{row.timestamp.slice(0, 16)}</td>
                  <td className="px-5 py-3"><StatusBadge status={row.workStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-slate-200 p-5">
        <button type="button" onClick={onClose} className="h-12 w-32 rounded-lg bg-blue-600 font-bold text-white">확인</button>
      </div>
    </ModalShell>
  )
}
