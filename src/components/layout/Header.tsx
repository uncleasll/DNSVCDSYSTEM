import { Bell, Calendar, Clock, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  onRegister?: () => void
  title?: string
  section?: string
  alarmCount?: number
  flush?: boolean
}

export function Header({ onRegister, title = '영동 1호기 고압차단기 위치안내시스템', section, alarmCount, flush = false }: Props) {
  const [time, setTime] = useState('13:30:59')

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <header className={`${flush ? 'h-full' : 'mb-3'} grid grid-cols-[minmax(320px,1fr)_132px_164px_auto] items-stretch gap-3`}>
      <div className="flex min-w-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-center shadow-sm">
        <div className="text-[10px] font-black uppercase tracking-wide text-blue-600">YEONGDONG POWER PLANT UNIT 1</div>
        <div className="mt-1 flex min-w-0 items-center justify-center gap-3">
          <h1 className="truncate text-base font-black text-slate-950">{section ?? title}</h1>
          <span className="shrink-0 rounded-full border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold lowercase text-emerald-600">normal</span>
        </div>
      </div>
      {alarmCount !== undefined && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 shadow-sm">
          <Bell className="h-5 w-5" />
          ALARM {alarmCount}
        </div>
      )}
      <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Clock className="h-4 w-4 text-blue-600" />{time}</div>
        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500"><Calendar className="h-3.5 w-3.5 text-blue-600" />2026.05.19</div>
      </div>
      <div className="flex flex-col justify-center gap-1 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold"><span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-blue-600" />GEN 연동</span><span className="text-emerald-600">ON</span></div>
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold"><span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-blue-600" />기본전환 연동</span><span className="text-emerald-600">ON</span></div>
      </div>
      {onRegister && (
        <button type="button" onClick={onRegister} className="h-full min-w-36 rounded-lg bg-blue-600 px-8 text-sm font-black text-white shadow-sm transition hover:bg-blue-700">
          조작등록
        </button>
      )}
    </header>
  )
}
