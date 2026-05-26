import { Check, Play, User, Users, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MOCK_KEY_STATUS, MOCK_TEAMS, MOCK_WORKERS } from '../../data/mockData'
import type { Operation } from '../../types'
import { StatusBadge } from '../ui/StatusBadge'
import { ModalShell } from './ModalShell'

type Props = {
  mode: 'start' | 'complete'
  operations?: Operation[]
  onClose: () => void
  onConfirm?: (operationId: number, operator: string, department: string) => void
}

export function OperationModal({ mode, operations = [], onClose, onConfirm }: Props) {
  const isStart = mode === 'start'
  const list = useMemo(() => {
    const progress = operations.filter((operation) => operation.status === '진행중')
    if (progress.length > 0) return progress

    return MOCK_KEY_STATUS.slice(0, isStart ? 7 : 5).map((item, index) => ({
      id: index + 1,
      panelId: index + 1,
      unitId: item.unitId,
      equipName: item.equipName,
      opType: item.status === 'KEY_ALERT' ? 'KEY ALERT' : item.status === 'KEY_OPEN' ? 'KEY OPEN' : 'KEY CLOSED',
      operator: item.operator,
      department: MOCK_TEAMS[index % MOCK_TEAMS.length],
      purpose: 'Inspection',
      status: '진행중',
      notes: '',
      operatedAt: item.timestamp,
    } satisfies Operation))
  }, [isStart, operations])
  const [selected, setSelected] = useState(list[0]?.id ?? 0)
  const [team, setTeam] = useState(MOCK_TEAMS[0])
  const [supervisor, setSupervisor] = useState(MOCK_WORKERS[0])
  const [worker, setWorker] = useState(MOCK_WORKERS[1] ?? MOCK_WORKERS[0])
  const active = list.find((item) => item.id === selected) ?? list[0]

  return (
    <ModalShell onClose={onClose} className="max-w-5xl">
      <div className="shrink-0 border-b border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            {isStart ? <Play className="h-6 w-6" /> : <Check className="h-7 w-7" />}
          </div>
          <div>
            <h2 className="text-2xl font-black">{isStart ? '조작 시작' : '조작 완료'}</h2>
            <div className="text-sm font-bold text-slate-500">{isStart ? 'START' : 'COMPLETE'}</div>
          </div>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_1fr_1fr] gap-6 overflow-hidden p-6">
        <section className="min-h-0">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">{isStart ? '조작 내역' : '진행중 목록'}</h3>
            <span className="text-sm font-bold text-blue-600">{list.length} items</span>
          </div>
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {list.map((item) => (
              <button key={item.id} type="button" onClick={() => setSelected(item.id)} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left shadow-sm ${selected === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <span className={`h-5 w-5 rounded-full border ${selected === item.id ? 'border-4 border-blue-600' : 'border-slate-300'}`} />
                <div className="min-w-0 flex-1">
                  <div className="font-black">{item.unitId}</div>
                  <div className="text-xs font-semibold text-slate-500">{item.equipName}</div>
                </div>
                <StatusBadge status={item.opType.replace(' ', '_') as 'KEY_ALERT'} blink={item.opType === 'KEY ALERT'} />
              </button>
            ))}
          </div>
        </section>
        <section className="border-x border-slate-200 px-6">
          <h3 className="mb-5 font-bold">정보 입력</h3>
          <Select label="팀 선택" value={team} onChange={setTeam} options={MOCK_TEAMS} />
          <Select label="책임자" value={supervisor} onChange={setSupervisor} options={MOCK_WORKERS} />
          <Select label="작업자" value={worker} onChange={setWorker} options={MOCK_WORKERS} />
        </section>
        <section>
          <h3 className="mb-5 font-bold">확인 정보</h3>
          <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
            <Info icon={Users} label="팀" value={team} />
            <Info icon={User} label="책임자" value={supervisor} />
            <Info icon={Wrench} label="작업자" value={worker} />
            <Info icon={Check} label={isStart ? '조작대상' : '대상'} value={active?.unitId ?? '-'} sub={active?.equipName} />
          </div>
        </section>
      </div>
      <div className="flex shrink-0 justify-end border-t border-slate-200 p-5">
        <button type="button" onClick={() => { if (active) onConfirm?.(active.id, worker, team); onClose() }} className="flex h-14 w-64 items-center justify-center gap-3 rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg hover:bg-blue-700">
          {isStart ? <Play className="h-6 w-6" /> : <Check className="h-6 w-6" />}
          {isStart ? '작업 시작' : '완료 처리'}
        </button>
      </div>
    </ModalShell>
  )
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-sm font-bold">{label} <b className="text-red-500">*</b></span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 px-4 text-base font-semibold outline-none focus:border-blue-500">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Info({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 py-4 last:border-b-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div>
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="ml-auto text-right text-base font-black">{value}<div className="text-sm font-semibold text-slate-500">{sub}</div></div>
    </div>
  )
}
