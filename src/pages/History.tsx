import { Bell, CheckCircle, Download, Filter, Search, Shield, Users } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { MOCK_HISTORY } from '../data/mockData'

export function History() {
  return (
    <>
      <Header section="이력 조회" />
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex gap-4">
          <select className="h-11 rounded-lg border border-slate-200 px-4 text-sm"><option>전체 상태</option></select>
          <input type="date" className="h-11 rounded-lg border border-slate-200 px-4 text-sm" />
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input placeholder="UNIT ID, 설비명, 조작명 검색" className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm" />
          </div>
          <button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 font-bold text-slate-600"><Filter className="h-4 w-4" />필터 초기화</button>
          <button className="flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 font-bold text-white"><Download className="h-4 w-4" />엑셀 다운로드</button>
        </div>
        <div className="mb-6 grid grid-cols-6 gap-3">
          <StatCard icon={Users} label="전체" value="1,247" sub="건" color="blue" />
          <StatCard icon={Bell} label="KEY ALERT" value="28" sub="건" color="red" />
          <StatCard icon={Shield} label="KEY OPEN" value="156" sub="건" color="green" />
          <StatCard icon={Shield} label="KEY CLOSED" value="892" sub="건" color="blue" />
          <StatCard icon={Bell} label="WARNING" value="98" sub="건" color="orange" />
          <StatCard icon={CheckCircle} label="완료" value="73" sub="건" color="green" />
        </div>
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <div className="rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500"><tr>{['시간', 'UNIT ID', '설비명', '조작명 / 내용', '조작자', '상태', '작업 상태'].map((h) => <th className="px-5 py-4" key={h}>{h}</th>)}</tr></thead>
              <tbody>{MOCK_HISTORY.map((row) => <tr className="border-t border-slate-100" key={`${row.unitId}-${row.timestamp}`}><td className="px-5 py-4">{row.timestamp}</td><td className="px-5 py-4 font-bold text-blue-600">{row.unitId}</td><td className="px-5 py-4 font-semibold">{row.equipName}</td><td className={`px-5 py-4 font-black ${row.status === 'KEY_ALERT' ? 'text-red-600' : row.status === 'KEY_OPEN' ? 'text-emerald-600' : 'text-blue-600'}`}>{row.content}</td><td className="px-5 py-4">{row.operator}</td><td className="px-5 py-4"><StatusBadge status={row.status} /></td><td className="px-5 py-4"><StatusBadge status={row.workStatus} /></td></tr>)}</tbody>
            </table>
            <div className="flex items-center gap-3 border-t border-slate-200 p-4 text-sm"><button className="rounded bg-blue-600 px-4 py-2 font-bold text-white">1</button><button>2</button><button>3</button><button>4</button><span>...</span><button>63</button><span className="ml-auto">총 1,247건 중 1-20 표시</span><select className="rounded-lg border border-slate-200 px-3 py-2"><option>20 / 페이지</option></select></div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="mb-5 font-bold">상세 필터</h3>
              {['UNIT', '설비 타입', '설비명', '조작명', '작업 상태'].map((label) => <label className="mb-4 block text-sm font-semibold" key={label}>{label}<select className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3"><option>전체 선택</option></select></label>)}
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="mb-4 font-bold">기간 빠른 선택</h3>
              <div className="grid grid-cols-2 gap-3">{['오늘', '어제', '최근 7일', '최근 30일', '최근 3개월', '사용자 지정'].map((item) => <button className="rounded-lg border border-slate-200 py-3 text-sm font-bold hover:border-blue-500" key={item}>{item}</button>)}</div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
