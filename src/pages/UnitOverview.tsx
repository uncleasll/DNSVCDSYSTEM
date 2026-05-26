import { Bell, Boxes, CheckCircle, ChevronsRight, PlugZap, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Header } from '../components/layout/Header'
import { demoAlarms, unitRows } from '../data/demo'
import { PANEL_DATA } from '../data/panels'

const distribution = [
  { name: '정상', value: PANEL_DATA.filter((panel) => panel.status === 'normal').length, fill: '#1D75FF' },
  { name: '경고', value: PANEL_DATA.filter((panel) => panel.status === 'warning').length, fill: '#FFB020' },
  { name: '알람', value: PANEL_DATA.filter((panel) => panel.status === 'alert').length, fill: '#FF1717' },
]

export function UnitOverview() {
  const [statusFilter, setStatusFilter] = useState('전체 상태')
  const [areaFilter, setAreaFilter] = useState('전체 구역')
  const [typeFilter, setTypeFilter] = useState('전체 타입')
  const [applied, setApplied] = useState({ status: '전체 상태', area: '전체 구역', type: '전체 타입' })
  const [page, setPage] = useState(1)
  const [showAllAlarms, setShowAllAlarms] = useState(false)
  const filteredRows = useMemo(() => unitRows.filter((row) => {
    const matchesStatus = applied.status === '전체 상태' || row.status === applied.status
    const matchesArea = applied.area === '전체 구역' || row.area === applied.area
    const matchesType = applied.type === '전체 타입' || row.equipmentName.toUpperCase().includes(applied.type)

    return matchesStatus && matchesArea && matchesType
  }), [applied])
  const pageSize = 12
  const maxPage = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const rows = filteredRows.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <Header section="UNIT OVERVIEW" alarmCount={3} />
      <div className="flex h-[calc(100vh-104px)] min-h-0 flex-col gap-4 overflow-hidden">
        <div className="grid grid-cols-5 gap-4">
          <Stat icon={Boxes} label="UNITS" value={String(PANEL_DATA.length)} color="text-blue-600" />
          <Stat icon={CheckCircle} label="정상" value={String(distribution[0].value)} sub={`${((distribution[0].value / PANEL_DATA.length) * 100).toFixed(1)}%`} color="text-emerald-500" />
          <Stat icon={Bell} label="경보" value={String(distribution[1].value + distribution[2].value)} sub={`${(((distribution[1].value + distribution[2].value) / PANEL_DATA.length) * 100).toFixed(1)}%`} color="text-red-500" />
          <Stat icon={PlugZap} label="오늘 작업" value="7" color="text-amber-500" />
          <Stat icon={Zap} label="전력 총합" value="4.16 kV" sub="TOTAL OUTPUT" color="text-sky-500" />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[230px_minmax(520px,1fr)_280px] gap-4 overflow-hidden">
          <aside className="space-y-4 overflow-hidden">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-center text-sm font-bold">UNIT 분포도</h2>
              <div className="h-28">
                <ResponsiveContainer><PieChart><Pie data={distribution} innerRadius={42} outerRadius={58} dataKey="value" stroke="none" /></PieChart></ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm">
                {distribution.map((item) => (
                  <div key={item.name} className="grid grid-cols-[16px_1fr_32px_44px] items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: item.fill }} />
                    <span>{item.name}</span><b>{item.value}</b><span className="text-slate-500">{((item.value / PANEL_DATA.length) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-bold">빠른 필터</h2>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="mb-3 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600">
                <option>전체 상태</option><option>KEY-CLOSED</option><option>KEY-ALERT</option><option>WARNING</option>
              </select>
              <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} className="mb-3 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600">
                <option>전체 구역</option>{Array.from(new Set(unitRows.map((row) => row.area))).map((area) => <option key={area}>{area}</option>)}
              </select>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="mb-3 h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-600">
                <option>전체 타입</option><option>PAF</option><option>MILL</option><option>TR</option><option>IDF</option>
              </select>
              <button type="button" onClick={() => { setApplied({ status: statusFilter, area: areaFilter, type: typeFilter }); setPage(1) }} className="h-10 w-full rounded-lg bg-blue-600 text-sm font-bold text-white">필터 적용</button>
            </section>
          </aside>

          <main className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-black">UNIT 상태 목록</h2>
            <div className="max-h-[calc(100%-76px)] overflow-auto rounded-lg">
              <table className="min-w-[880px] w-full text-left text-xs">
                <thead className="sticky top-0 bg-blue-50 text-slate-700"><tr>{['UNIT ID', '구역', '상태', '전압 (kV)', '전류 (A)', '전력 (kW)', '통신 상태', '작업 상태'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr></thead>
                <tbody>{rows.map((row, index) => <tr key={`${row.unitId}-${index}`} className="border-t border-slate-100"><td className="px-3 py-2 font-bold">{row.unitId}</td><td className="px-3 py-2">{row.area}</td><td className={`px-3 py-2 font-black ${row.status === 'KEY-ALERT' ? 'text-red-600' : row.status === 'WARNING' ? 'text-amber-500' : 'text-sky-600'}`}>{row.status}</td><td className="px-3 py-2">{row.voltage}</td><td className="px-3 py-2">{row.current}</td><td className="px-3 py-2">{row.power}</td><td className="px-3 py-2"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />{row.communication}</td><td className="px-3 py-2">{row.workStatus}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              {Array.from({ length: Math.min(4, maxPage) }, (_, index) => index + 1).map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`h-8 w-8 rounded-md border ${item === page ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200'}`}>{item}</button>)}
              <button type="button" onClick={() => setPage((value) => Math.min(maxPage, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200"><ChevronsRight className="h-4 w-4" /></button>
              <span className="ml-auto text-slate-600">총 {filteredRows.length}개 표시</span>
            </div>
          </main>

          <aside className="min-h-0 overflow-hidden">
            <section className="flex h-full min-h-0 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-black">최근 알람</h2>
                <button type="button" onClick={() => setShowAllAlarms((value) => !value)} className="text-sm font-bold text-blue-600">{showAllAlarms ? 'show less' : 'view all →'}</button>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {(showAllAlarms ? demoAlarms.concat(demoAlarms) : demoAlarms.slice(0, 5)).map((alarm, index) => (
                  <div key={`${alarm.unitId}-${index}`} className="grid grid-cols-[68px_58px_1fr_46px] gap-2 text-[11px]">
                    <b className={alarm.level === 'WARNING' ? 'text-amber-500' : 'text-red-600'}>{alarm.level}</b>
                    <span>{alarm.unitId}</span>
                    <span className="truncate text-slate-600">{alarm.equipment}</span>
                    <span className="text-right text-slate-500">{alarm.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}

function Stat({ icon: Icon, label, value, sub, color }: { icon: typeof Boxes; label: string; value: string; sub?: string; color: string }) {
  return (
    <section className="flex h-24 items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <Icon className={`h-8 w-8 ${color}`} />
      <div><div className="text-sm font-semibold">{label}</div><div className="text-3xl font-black leading-none">{value}</div>{sub && <div className={`mt-1 text-xs font-bold ${color}`}>{sub}</div>}</div>
    </section>
  )
}
