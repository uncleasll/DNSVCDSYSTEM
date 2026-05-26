import { Bell, Database, Shield, Wifi } from 'lucide-react'
import { Header } from '../components/layout/Header'

const settings = [
  { icon: Wifi, title: 'GEN 연동', desc: 'Generator link status and reconnect policy', enabled: true },
  { icon: Bell, title: '기본전환 연동', desc: 'Default transfer signal monitoring', enabled: true },
  { icon: Shield, title: 'Alarm escalation', desc: 'Notify operator when KEY-ALERT is active', enabled: true },
  { icon: Database, title: 'Demo data sync', desc: 'Use local MVP data until HW API is connected', enabled: true },
]

export function Settings() {
  return (
    <>
      <Header section="SETTINGS" />
      <section className="grid h-[calc(100vh-104px)] min-h-0 grid-cols-[minmax(0,1fr)_320px] gap-4 overflow-hidden">
        <div className="overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-black">System settings</h2>
          <div className="grid grid-cols-2 gap-4">
            {settings.map(({ icon: Icon, title, desc, enabled }) => (
              <div key={title} className="rounded-lg border border-slate-200 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-5 w-5" /></div>
                  <div><div className="font-black">{title}</div><div className="text-xs text-slate-500">{desc}</div></div>
                </div>
                <label className="flex items-center justify-between text-sm font-bold">
                  Enabled
                  <input type="checkbox" defaultChecked={enabled} />
                </label>
              </div>
            ))}
          </div>
        </div>
        <aside className="overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-black">MVP readiness</h2>
          {['Dashboard connected', 'Unit overview connected', 'Alarm & Event connected', 'History demo ready', 'Settings demo ready'].map((item) => (
            <div key={item} className="mb-3 flex items-center justify-between text-sm">
              <span>{item}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-600">OK</span>
            </div>
          ))}
        </aside>
      </section>
    </>
  )
}
