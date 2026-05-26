import { Bell, CheckCircle, FileText, History as HistoryIcon, Play, PlusCircle, Zap } from 'lucide-react'
import { useState } from 'react'
import { ImageViewer } from '../components/dashboard/ImageViewer'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StatusPanel } from '../components/dashboard/StatusPanel'
import { UnitList } from '../components/dashboard/UnitList'
import { Header } from '../components/layout/Header'
import { HistoryModal } from '../components/modals/HistoryModal'
import { OperationModal } from '../components/modals/OperationModal'
import { RegisterModal } from '../components/modals/RegisterModal'
import { SuccessModal } from '../components/modals/SuccessModal'
import { ActionButton } from '../components/ui/ActionButton'
import { INITIAL_OPERATIONS, nowStamp } from '../data/operations'
import { getPanelByUnitId } from '../data/panels'
import type { Operation } from '../types'

type Modal = 'register' | 'success' | 'start' | 'complete' | 'history' | null

const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

export function Dashboard() {
  const [modal, setModal] = useState<Modal>(null)
  const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS)
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])

  const submitRegister = (newOperations: Operation[]) => {
    setOperations((items) => [
      ...newOperations,
      ...items.filter((item) => !newOperations.some((operation) => operation.unitId === item.unitId && isProgress(item.status))),
    ])
    setSelectedUnitIds(newOperations.map((operation) => operation.unitId))
    setModal('success')
  }

  const updateOperation = (operationId: number, operator: string, department: string, complete = false) => {
    setOperations((items) => items.map((item) => item.id === operationId
      ? { ...item, operator, department, status: complete ? '완료' : '진행중', operatedAt: nowStamp() }
      : item))
  }

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((ids) => ids.includes(unitId) ? ids.filter((id) => id !== unitId) : [...ids, unitId])
  }

  const activeOperations = operations.filter((operation) => isProgress(operation.status))
  const selectedPanelIds = selectedUnitIds
    .map((unitId) => getPanelByUnitId(unitId)?.id)
    .filter((id): id is number => typeof id === 'number')
  const viewerPanelIds = selectedPanelIds.length > 0 ? selectedPanelIds : activeOperations.map((operation) => operation.panelId)

  return (
    <>
      <Header />
      <div className="grid h-[calc(100vh-104px)] min-h-0 grid-cols-[230px_minmax(560px,1fr)_168px] gap-3 overflow-hidden">
        <UnitList selectedUnitIds={selectedUnitIds} onToggleUnit={toggleUnit} />
        <main className="grid min-h-0 grid-rows-[minmax(180px,1fr)_48px_190px] gap-3">
          <ImageViewer activePanelIds={viewerPanelIds} onSequenceDone={() => setSelectedUnitIds([])} />
          <div className="grid grid-cols-4 items-center rounded-xl border border-slate-200 bg-white shadow-sm">
            {[CheckCircle, Bell, FileText, Zap].map((Icon, index) => (
              <div key={index} className="flex items-center justify-center border-r border-slate-200 last:border-r-0">
                <Icon className={`h-6 w-6 ${['text-emerald-500', 'text-amber-500', 'text-violet-500', 'text-blue-500'][index]}`} />
              </div>
            ))}
          </div>
          <div className="grid min-h-0 grid-cols-2 gap-3">
            <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold">SYSTEM STATUS</h2>
              <div className="flex items-center justify-center">
                <div className="relative h-24 w-24">
                  <svg viewBox="0 0 120 120" className="h-24 w-24 -rotate-90">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#DBEAFE" strokeWidth="14" />
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#2563EB" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 45 * 0.95} ${2 * Math.PI * 45}`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-xl font-bold">95%</div>
                    <div className="text-xs">normal</div>
                  </div>
                </div>
              </div>
            </section>
            <RecentActivity operations={operations} />
          </div>
        </main>
        <aside className="grid min-h-0 grid-rows-[minmax(120px,1fr)_52px_52px_52px_52px] gap-2 overflow-hidden">
          <StatusPanel operations={activeOperations} />
          <ActionButton icon={PlusCircle} label="REGISTER" variant="blue" onClick={() => setModal('register')} />
          <ActionButton icon={Play} label="START" variant="dark" onClick={() => setModal('start')} />
          <ActionButton icon={CheckCircle} label="COMPLETE" variant="green" onClick={() => setModal('complete')} />
          <ActionButton icon={HistoryIcon} label="HISTORY" variant="orange" onClick={() => setModal('history')} />
        </aside>
      </div>
      {modal === 'register' && <RegisterModal onClose={() => setModal(null)} onSubmit={submitRegister} />}
      {modal === 'success' && <SuccessModal onClose={() => setModal(null)} />}
      {modal === 'start' && <OperationModal mode="start" operations={operations} onClose={() => setModal(null)} onConfirm={(id, operator, department) => updateOperation(id, operator, department)} />}
      {modal === 'complete' && <OperationModal mode="complete" operations={operations} onClose={() => setModal(null)} onConfirm={(id, operator, department) => updateOperation(id, operator, department, true)} />}
      {modal === 'history' && <HistoryModal onClose={() => setModal(null)} />}
    </>
  )
}
