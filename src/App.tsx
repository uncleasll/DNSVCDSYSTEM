import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AlarmEvent } from './pages/AlarmEvent'
import { Dashboard } from './pages/Dashboard'
import { Equipment } from './pages/Equipment'
import { History } from './pages/History'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { UnitOverview } from './pages/UnitOverview'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'unit-overview', element: <UnitOverview /> },
      { path: 'equipment', element: <Equipment /> },
      { path: 'alarm-event', element: <AlarmEvent /> },
      { path: 'history', element: <History /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
