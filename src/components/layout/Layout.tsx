import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className={`min-h-screen p-4 transition-all ${collapsed ? 'ml-20' : 'ml-56'}`}>
        <Outlet />
      </main>
    </div>
  )
}
