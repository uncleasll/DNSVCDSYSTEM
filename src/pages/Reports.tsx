import { Bell, CheckCircle, Download, FileDown, Search, Shield, Users } from 'lucide-react'
import { Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { MOCK_HISTORY } from '../data/mockData'

const chartData = Array.from({ length: 13 }, (_, i) => ({ time: `${String(i * 2).padStart(2, '0')}:00`, alert: 12 + i * 2, open: 28 + i * 4, closed: 40 + i * 7, warning: 8 + i, normal: 4 + i / 2 }))

export function Reports() {
  return (
    <>
      <Header section="보고서" />
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex gap-8 border-b border-slate-200 text-sm font-bold text-slate-500">
          {['일일 보고서', '주간 보고서', '월간 보고서', '사용자 정의 보고서'].map((tab, i) => <button className={`pb-4 ${i === 0 ? 'border-b-2 border-blue-600 text-blue-600' : ''}`} key={tab}>{tab}</button>)}
        </div>
        <div className="mb-5 flex gap-4">
          <input type="date" className="h-11 rounded-lg border border-slate-200 px-4" defaultValue="2026-05-19" />
          <select className="h-11 rounded-lg border border-slate-200 px-4"><option>전체 UNIT</option></select>
          <select className="h-11 rounded-lg border border-slate-200 px-4"><option>전체 설비 타입</option></select>
          <select className="h-11 rounded-lg border border-slate-200 px-4"><option>전체 상태</option></select>
          <button className="ml-auto flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-8 font-bold text-white"><Search className="h-4 w-4" />조회</button>
          <button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 font-bold"><Download className="h-4 w-4" />엑셀 다운로드</button>
        </div>
        <div className="mb-5 grid grid-cols-6 gap-3">
          <StatCard icon={Users} label="전체 건수" value="1,247" sub="건" color="blue" />
          <StatCard icon={Bell} label="KEY ALERT" value="28" sub="건" color="red" />
          <StatCard icon={Shield} label="KEY OPEN" value="156" sub="건" color="blue" />
          <StatCard icon={Shield} label="KEY CLOSED" value="892" sub="건" color="blue" />
          <StatCard icon={Bell} label="WARNING" value="98" sub="건" color="orange" />
          <StatCard icon={CheckCircle} label="정상" value="73" sub="건" color="green" />
        </div>
        <div className="grid grid-cols-[1fr_1.2fr_350px] gap-4">
          <div className="rounded-xl border border-slate-200 p-5"><h3 className="mb-4 font-bold">상태 분포</h3><div className="h-56"><ResponsiveContainer><PieChart><Pie data={[{ value: 28, fill: '#EF4444' }, { value: 156, fill: '#3B82F6' }, { value: 892, fill: '#1E40AF' }, { value: 98, fill: '#F59E0B' }, { value: 73, fill: '#10B981' }]} innerRadius={70} outerRadius={95} dataKey="value" /></PieChart></ResponsiveContainer></div></div>
          <div className="rounded-xl border border-slate-200 p-5"><h3 className="mb-4 font-bold">시간대별 발생 현황</h3><div className="h-56"><ResponsiveContainer><LineChart data={chartData}><XAxis dataKey="time" /><YAxis /><Line dataKey="alert" stroke="#EF4444" /><Line dataKey="open" stroke="#3B82F6" /><Line dataKey="closed" stroke="#1E40AF" /><Line dataKey="warning" stroke="#F59E0B" /><Line dataKey="normal" stroke="#10B981" /></LineChart></ResponsiveContainer></div></div>
          <div className="rounded-xl border border-slate-200 p-5"><h3 className="mb-5 font-bold">설비 타입별 현황</h3>{[['Electrical', 512, '41.1%'], ['Mechanical', 364, '29.2%'], ['Instrument', 198, '15.9%'], ['Control', 92, '7.4%'], ['Auxiliary', 81, '6.4%']].map(([name, count, pct]) => <div className="mb-4" key={name}><div className="mb-1 flex justify-between text-sm font-semibold"><span>{name}</span><span>{count} · {pct}</span></div><div className="h-1.5 rounded bg-slate-100"><div className="h-1.5 rounded bg-blue-600" style={{ width: pct }} /></div></div>)}</div>
        </div>
        <div className="mt-5 grid grid-cols-[1fr_300px] gap-4">
          <div className="rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['시간', 'UNIT ID', '설비명', '구역', '타입', '조작명 / 내용', '상태', '작업 상태'].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead><tbody>{MOCK_HISTORY.slice(0, 6).map((row) => <tr className="border-t border-slate-100" key={row.timestamp}><td className="px-4 py-3">{row.timestamp}</td><td className="px-4 py-3 font-bold">{row.unitId}</td><td className="px-4 py-3">{row.equipName}</td><td className="px-4 py-3">MILL</td><td className="px-4 py-3">Electrical</td><td className="px-4 py-3">{row.content}</td><td className="px-4 py-3"><StatusBadge status={row.status} /></td><td className="px-4 py-3"><StatusBadge status={row.workStatus} /></td></tr>)}</tbody></table></div>
          <aside className="rounded-xl border border-slate-200 p-5"><h3 className="mb-4 font-bold">보고서 다운로드</h3>{['PDF', 'Excel', 'CSV', 'Word'].map((x) => <button className="mb-3 flex w-full items-center gap-4 rounded-lg border border-slate-200 p-4 text-left font-bold" key={x}><FileDown className="h-5 w-5 text-blue-600" />{x}<Download className="ml-auto h-4 w-4 text-blue-600" /></button>)}</aside>
        </div>
      </section>
    </>
  )
}
