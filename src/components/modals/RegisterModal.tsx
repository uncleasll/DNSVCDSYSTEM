import { QrCode, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MOCK_TEAMS, MOCK_UNITS } from '../../data/mockData'
import { MOCK_REASONS, nowStamp } from '../../data/operations'
import type { Operation } from '../../types'
import { ModalShell } from './ModalShell'

type Props = {
  onClose: () => void
  onSubmit: (operations: Operation[]) => void
}

export function RegisterModal({ onClose, onSubmit }: Props) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState(MOCK_TEAMS[0])
  const [reason, setReason] = useState(MOCK_REASONS[0])
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['UNIT-12B'])

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return MOCK_UNITS.slice(0, 10)
    return MOCK_UNITS.filter((unit) => `${unit.unitId} ${unit.name}`.toLowerCase().includes(term)).slice(0, 12)
  }, [query])

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((ids) => ids.includes(unitId) ? ids.filter((id) => id !== unitId) : [...ids, unitId])
  }

  const submit = () => {
    const operatedAt = nowStamp()
    onSubmit(selectedUnitIds.map((unitId, index) => {
      const unit = MOCK_UNITS.find((item) => item.unitId === unitId) ?? MOCK_UNITS[0]

      return {
        id: Date.now() + index,
        panelId: unit.id,
        unitId: unit.unitId,
        equipName: unit.name,
        opType: 'KEY CLOSED',
        operator: department,
        department,
        purpose: reason,
        status: '진행중',
        notes: '',
        operatedAt,
      }
    }))
  }

  return (
    <ModalShell onClose={onClose} className="max-w-lg">
      <form className="overflow-y-auto p-8" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">조작 등록</h2>
          <div className="mt-1 text-sm font-semibold text-slate-500">REGISTER</div>
          <div className="mx-auto mt-3 h-px w-72 bg-slate-200" />
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold">작업요청부서 <b className="text-red-500">*</b></span>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-500 outline-none focus:border-blue-500">
            {MOCK_TEAMS.map((team) => <option key={team}>{team}</option>)}
          </select>
        </label>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold">작업요청사유 <b className="text-red-500">*</b></span>
          <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-500 outline-none focus:border-blue-500">
            {MOCK_REASONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div>
          <div className="mb-3 text-sm font-semibold">차단기 선택 <b className="text-red-500">*</b></div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-blue-500 font-semibold text-blue-600"><QrCode className="h-5 w-5" />QR 스캔</button>
            <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-400 font-semibold text-slate-700"><Search className="h-5 w-5" />검색</button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Unit ID or equipment name..." className="h-12 w-full rounded-lg border border-slate-400 pl-12 pr-4 outline-none focus:border-blue-500" />
          </div>
          <div className="mt-3 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
            {matches.map((unit) => (
              <button key={unit.id} type="button" onClick={() => toggleUnit(unit.unitId)} className={`rounded-lg border px-3 py-2 text-left text-xs ${selectedUnitIds.includes(unit.unitId) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700'}`}>
                <div className="font-black">{unit.unitId}</div>
                <div className="mt-0.5 break-words text-[10px] font-semibold">{unit.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUnitIds.map((unitId) => <span key={unitId} className="rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">{unitId}</span>)}
          </div>
        </div>
        <button type="submit" disabled={selectedUnitIds.length === 0} className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-lg font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-300">조작 등록</button>
      </form>
    </ModalShell>
  )
}
