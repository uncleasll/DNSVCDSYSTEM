import { AlarmClock, Boxes, Gauge, History, Home, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'DASHBOARD', icon: Home },
  { to: '/unit-overview', label: 'UNIT OVERVIEW', icon: Boxes },
  { to: '/alarm-event', label: 'ALARM & EVENT', icon: AlarmClock },
  { to: '/history', label: 'HISTORY', icon: History },
  { to: '/settings', label: 'SETTINGS', icon: Settings },
]

type Props = {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: Props) {
  return (
    <aside className={`fixed left-0 top-0 z-10 flex h-screen flex-col border-r border-slate-200 bg-white px-4 py-5 text-slate-500 shadow-sm transition-all ${collapsed ? 'w-20' : 'w-56'}`}>
      <button type="button" onClick={onToggle} className="mb-5 flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}>
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>
      <div className={`mb-10 flex h-14 items-center ${collapsed ? 'justify-center' : ''}`}>
        <img
          src="/koen_logo.png"
          alt="KOEN 한국남동발전 KOREA ENERGY"
          className={collapsed ? 'h-8 w-10 object-contain' : 'h-12 w-full object-contain object-left'}
        />
      </div>
      <nav className="space-y-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} title={collapsed ? label : undefined} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition ${collapsed ? 'justify-center px-0' : ''} ${isActive ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'}`}>
            <Icon className="h-5 w-5" />
            <span className={collapsed ? 'hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={`mt-auto rounded-xl border border-slate-200 p-4 text-xs ${collapsed ? 'px-2 text-center' : ''}`}>
        <Gauge className="mb-2 h-6 w-6 text-blue-600" />
        <div className={collapsed ? 'hidden' : ''}>
          <div className="font-bold text-slate-900">24/7 SUPPORT</div>
          <div>Control Center</div>
          <div>055-123-4567</div>
        </div>
      </div>
      <div className={`mt-8 text-xs text-slate-500 ${collapsed ? 'hidden' : ''}`}>© 2026 KOEN<br />All rights reserved.</div>
    </aside>
  )
}
