import { Bell, CheckCircle, Download, Filter, Search, Shield, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { MOCK_HISTORY } from '../data/mockData'

export function History() {
  const [status, setStatus] = useState('전체 상태')
  const [date, setDate] = useState('')
  const [query, setQuery] = useState('')
  const rows = useMemo(() => MOCK_HISTORY.concat(MOCK_HISTORY).filter((row) => {
    const term = query.trim().toLowerCase()
    const matchesText = !term || `${row.unitId} ${row.equipName} ${row.content} ${row.operator}`.toLowerCase().includes(term)
    const matchesStatus = status === '전체 상태' || row.status === status
    const matchesDate = !date || row.timestamp.startsWith(date)

    return matchesText && matchesStatus && matchesDate
  }), [date, query, status])

  const reset = () => {
    setStatus('전체 상태')
    setDate('')
    setQuery('')
  }

  const exportCsv = () => {
    const header = ['time', 'unitId', 'equipment', 'content', 'operator', 'keyStatus', 'workStatus']
    const body = rows.map((row) => [row.timestamp, row.unitId, row.equipName, row.content, row.operator, row.status, row.workStatus].join(','))
    const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'koen-history.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  const setRelativeDate = (days: number) => {
    const value = new Date()
    value.setDate(value.getDate() - days)
    setDate(value.toISOString().slice(0, 10))
  }

  return (
    <>
      <Header section="이력 조회" />
      <section className="flex h-[calc(100vh-104px)] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-3">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-200 px-4 text-sm"><option>전체 상태</option><option>KEY_ALERT</option><option>KEY_OPEN</option><option>KEY_CLOSED</option></select>
          <input value={date} onChange={(event) => setDate(event.target.value)} type="date" className="h-11 rounded-lg border border-slate-200 px-4 text-sm" />
          <div className="relative min-w-64 flex-1">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="UNIT ID, 설비명, 조작내용 검색" className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm" />
          </div>
          <button type="button" onClick={reset} className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 font-bold text-slate-600"><Filter className="h-4 w-4" />필터 초기화</button>
          <button type="button" onClick={exportCsv} className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-bold text-white"><Download className="h-4 w-4" />Excel</button>
        </div>
        <div className="mb-4 grid grid-cols-6 gap-3">
          <StatCard icon={Users} label="전체" value={String(rows.length)} sub="건" color="blue" />
          <StatCard icon={Bell} label="KEY ALERT" value={String(rows.filter((row) => row.status === 'KEY_ALERT').length)} sub="건" color="red" />
          <StatCard icon={Shield} label="KEY OPEN" value={String(rows.filter((row) => row.status === 'KEY_OPEN').length)} sub="건" color="green" />
          <StatCard icon={Shield} label="KEY CLOSED" value={String(rows.filter((row) => row.status === 'KEY_CLOSED').length)} sub="건" color="blue" />
          <StatCard icon={Bell} label="WARNING" value="0" sub="건" color="orange" />
          <StatCard icon={CheckCircle} label="완료" value={String(rows.filter((row) => row.workStatus.includes('완료') || row.workStatus.includes('м™')).length)} sub="건" color="green" />
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_260px] gap-4 overflow-hidden">
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>{['시간', 'UNIT ID', '설비명', '조작내용', '조작자', '키상태', '작업상태'].map((head) => <th className="px-5 py-4" key={head}>{head}</th>)}</tr>
              </thead>
              <tbody>{rows.map((row, index) => <tr className="border-t border-slate-100" key={`${row.unitId}-${row.timestamp}-${index}`}><td className="px-5 py-4">{row.timestamp}</td><td className="px-5 py-4 font-bold text-blue-600">{row.unitId}</td><td className="px-5 py-4 font-semibold">{row.equipName}</td><td className={`px-5 py-4 font-black ${row.status === 'KEY_ALERT' ? 'text-red-600' : row.status === 'KEY_OPEN' ? 'text-emerald-600' : 'text-blue-600'}`}>{row.content}</td><td className="px-5 py-4">{row.operator}</td><td className="px-5 py-4"><StatusBadge status={row.status} /></td><td className="px-5 py-4"><StatusBadge status={row.workStatus} /></td></tr>)}</tbody>
            </table>
          </div>
          <aside className="space-y-4 overflow-auto">
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="mb-5 font-bold">상세 필터</h3>
              {['UNIT', '설비 타입', '설비명', '조작내용', '작업 상태'].map((label) => <label className="mb-4 block text-sm font-semibold" key={label}>{label}<select className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3"><option>전체 선택</option></select></label>)}
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="mb-4 font-bold">기간 선택</h3>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRelativeDate(0)} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">오늘</button>
                <button type="button" onClick={() => setRelativeDate(1)} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">어제</button>
                <button type="button" onClick={() => setDate('2026-05-19')} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">최근 7일</button>
                <button type="button" onClick={() => setDate('2026-05-01')} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">최근 30일</button>
                <button type="button" onClick={() => setDate('2026-03-01')} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">최근 3개월</button>
                <button type="button" onClick={() => setDate('')} className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500">사용자 지정</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
