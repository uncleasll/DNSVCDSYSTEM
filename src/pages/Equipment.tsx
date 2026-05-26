import { AlertTriangle, CheckCircle, Cuboid, Settings, Wrench } from 'lucide-react'
import { Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { MOCK_EQUIPMENT } from '../data/mockData'

export function Equipment() {
  return (
    <>
      <Header section="EQUIPMENT" />
      <div className="mb-6 grid grid-cols-5 gap-4">
        <StatCard icon={Cuboid} label="전체 설비" value="247" sub="EQUIPMENTS" color="blue" />
        <StatCard icon={CheckCircle} label="정상" value="198" sub="80.2%" color="green" />
        <StatCard icon={AlertTriangle} label="경보" value="21" sub="8.5%" color="orange" />
        <StatCard icon={AlertTriangle} label="알람" value="8" sub="3.2%" color="red" />
        <StatCard icon={Wrench} label="정지" value="20" sub="8.1%" color="slate" />
      </div>
      <div className="grid grid-cols-[220px_1fr_300px] gap-4">
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-5 font-bold">설비 카테고리</h3>{['Electrical 86', 'Mechanical 72', 'Instrument 45', 'Control 23', 'Auxiliary 21'].map((x) => <div className="flex justify-between py-3 text-sm font-semibold" key={x}><span>{x.split(' ')[0]}</span><span>{x.split(' ')[1]}</span></div>)}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-5 font-bold">상태 필터</h3>{['전체', '정상', '경보', '알람', '정지', '점검'].map((x, i) => <label className="mb-4 flex items-center gap-3 text-sm font-semibold" key={x}><input type="checkbox" defaultChecked={i === 0} />{x}</label>)}<button className="mt-3 h-10 w-full rounded-lg border border-blue-500 font-bold text-blue-600">필터 적용</button></div>
        </aside>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex gap-3"><input placeholder="설비명, 코드 검색" className="h-11 flex-1 rounded-lg border border-slate-200 px-4" /><select className="rounded-lg border border-slate-200 px-4"><option>전체 구역</option></select><select className="rounded-lg border border-slate-200 px-4"><option>전체 타입</option></select><select className="rounded-lg border border-slate-200 px-4"><option>전체 상태</option></select></div>
          <h3 className="mb-4 font-bold">설비 목록 (247)</h3>
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{['설비 ID', '설비명', '구역', '타입', '상태', '전압 (kV)', '용량', '최근 업데이트'].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr></thead><tbody>{MOCK_EQUIPMENT.map((row) => <tr className="border-t border-slate-100" key={row.id}><td className="px-4 py-4 font-bold">{row.id}</td><td className="px-4 py-4">{row.name}</td><td className="px-4 py-4">{row.area}</td><td className="px-4 py-4">{row.type}</td><td className="px-4 py-4"><StatusBadge status={row.status} /></td><td className="px-4 py-4">{row.voltage}</td><td className="px-4 py-4">{row.capacity}</td><td className="px-4 py-4">{row.updatedAt}</td></tr>)}</tbody></table>
        </section>
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-bold">설비 상세 정보</h3><div className="flex gap-4"><div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100"><Settings /></div><div><div className="text-xl font-black">MTR-06B</div><div className="font-semibold text-slate-500">Vertical Mill D</div></div></div>{['상태 정상', '구역 MILL', '타입 Mechanical', '전압 4.16 kV', '용량 450 kW'].map((x) => <div className="mt-3 flex justify-between text-sm" key={x}><span>{x.split(' ')[0]}</span><b>{x.slice(x.indexOf(' ') + 1)}</b></div>)}</div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-3 font-bold">상태 분포</h3><div className="h-44"><ResponsiveContainer><PieChart><Pie data={[{ name: '정상', value: 198, fill: '#10B981' }, { name: '경보', value: 21, fill: '#F59E0B' }, { name: '알람', value: 8, fill: '#EF4444' }, { name: '정지', value: 20, fill: '#94A3B8' }]} innerRadius={50} outerRadius={75} dataKey="value" /></PieChart></ResponsiveContainer></div></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="mb-4 font-bold">예방정비 현황</h3><div className="grid grid-cols-2 gap-3"><div className="rounded-lg bg-blue-50 p-4 text-center font-bold">12 건</div><div className="rounded-lg bg-red-50 p-4 text-center font-bold">2 건</div></div></div>
        </aside>
      </div>
    </>
  )
}
