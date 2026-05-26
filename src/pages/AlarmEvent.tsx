import { AlertTriangle, Bell, CheckCircle, Filter, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Header } from '../components/layout/Header'
import { StatCard } from '../components/ui/StatCard'
import { demoAlarms } from '../data/demo'

export function AlarmEvent() {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('All severity')
  const [status, setStatus] = useState('All status')
  const [applied, setApplied] = useState({ query: '', severity: 'All severity', status: 'All status' })
  const rows = useMemo(() => demoAlarms.concat(demoAlarms, demoAlarms).filter((alarm) => {
    const term = applied.query.trim().toLowerCase()
    const matchesText = !term || `${alarm.level} ${alarm.unitId} ${alarm.equipment} ${alarm.area} ${alarm.message} ${alarm.status}`.toLowerCase().includes(term)
    const matchesSeverity = applied.severity === 'All severity' || alarm.level === applied.severity
    const matchesStatus = applied.status === 'All status' || alarm.status === applied.status

    return matchesText && matchesSeverity && matchesStatus
  }), [applied])

  return (
    <>
      <Header section="ALARM & EVENT" alarmCount={3} />
      <div className="grid h-[calc(100vh-104px)] min-h-0 grid-rows-[96px_56px_minmax(0,1fr)] gap-4 overflow-hidden">
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={Bell} label="Active Alarm" value="3" sub="unresolved" color="red" />
          <StatCard icon={AlertTriangle} label="Warning" value="2" sub="checking" color="orange" />
          <StatCard icon={CheckCircle} label="Resolved" value="18" sub="today" color="green" />
          <StatCard icon={Bell} label="Total Event" value="47" sub="24h" color="blue" />
        </div>
        <section className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500" placeholder="Search alarm, unit, equipment..." />
          </div>
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All severity</option><option>KEY-ALERT</option><option>WARNING</option><option>ALARM</option></select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 px-3 text-sm"><option>All status</option><option>Unresolved</option><option>Checking</option><option>Resolved</option></select>
          <button type="button" onClick={() => setApplied({ query, severity, status })} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white"><Filter className="h-4 w-4" />Apply</button>
        </section>
        <section className="grid min-h-0 grid-cols-[1fr_320px] gap-4 overflow-hidden">
          <div className="overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>{['Time', 'Severity', 'Unit', 'Equipment', 'Area', 'Message', 'Status'].map((head) => <th key={head} className="px-5 py-4">{head}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((alarm, index) => (
                  <tr key={`${alarm.unitId}-${index}`} className="border-t border-slate-100 hover:bg-blue-50/40">
                    <td className="px-5 py-4 font-mono text-xs">{alarm.time}</td>
                    <td className={`px-5 py-4 font-black ${alarm.level === 'WARNING' ? 'text-amber-500' : 'text-red-600'}`}>{alarm.level}</td>
                    <td className="px-5 py-4 font-bold text-blue-600">{alarm.unitId}</td>
                    <td className="px-5 py-4">{alarm.equipment}</td>
                    <td className="px-5 py-4">{alarm.area}</td>
                    <td className="px-5 py-4">{alarm.message}</td>
                    <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{alarm.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="space-y-4 overflow-hidden">
            <section className="rounded-lg border border-red-100 bg-red-50 p-5 text-red-700 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-black"><Bell className="h-5 w-5" />Priority Queue</h2>
              {demoAlarms.slice(0, 3).map((alarm) => (
                <button key={alarm.unitId} onClick={() => { setQuery(alarm.unitId); setApplied({ query: alarm.unitId, severity: 'All severity', status: 'All status' }) }} className="mb-3 w-full rounded-lg border border-red-100 bg-white p-3 text-left shadow-sm">
                  <div className="font-black">{alarm.unitId}</div>
                  <div className="text-xs">{alarm.message}</div>
                </button>
              ))}
            </section>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-black">Response Checklist</h2>
              {['Operator notified', 'Key-box signal confirmed', 'Field team assigned', 'History logged'].map((item, index) => (
                <label key={item} className="mb-3 flex items-center gap-3 text-sm font-semibold"><input type="checkbox" defaultChecked={index < 2} />{item}</label>
              ))}
            </section>
          </aside>
        </section>
      </div>
    </>
  )
}
