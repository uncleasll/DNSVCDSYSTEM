import { Bell, CheckCircle, History as HistoryIcon, Play, PlusCircle, Radio, Server, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { clearActivePanels, completeOperations, fetchOperations, setActivePanels } from '../api/operations'
import type { ActivePanel } from '../api/operations'
import { FloorPlan } from '../components/dashboard/FloorPlan'
import { ImageViewer } from '../components/dashboard/ImageViewer'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StatusPanel } from '../components/dashboard/StatusPanel'
import { Header } from '../components/layout/Header'
import { HistoryModal } from '../components/modals/HistoryModal'
import { OperationModal } from '../components/modals/OperationModal'
import { RegisterModal } from '../components/modals/RegisterModal'
import { SuccessModal } from '../components/modals/SuccessModal'
import { ActionButton } from '../components/ui/ActionButton'
import { INITIAL_OPERATIONS } from '../data/operations'
import { KEY_BOX_STATUS } from '../data/keyBoxStatus'
import type { Operation } from '../types'

type Modal = 'register' | 'success' | 'start' | 'complete' | 'history' | 'activity' | null

const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

export function Dashboard() {
  const [modal, setModal] = useState<Modal>(null)
  const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS)
  const [sequencePanelIds, setSequencePanelIds] = useState<number[]>([])
  const [sequenceId, setSequenceId] = useState(0)
  const [activePanels, setActivePanelsState] = useState<ActivePanel[]>([])
  const [cameraPos, setCameraPos] = useState({ x: -6, z: 0, rotation: 0 })
  const [isOperationActive, setIsOperationActive] = useState(false)

  const refreshOperations = useCallback(async () => {
    setOperations(await fetchOperations())
  }, [])

  useEffect(() => {
    void refreshOperations().catch(() => undefined)
  }, [refreshOperations])

  useEffect(() => {
    let lastSerialized = '[]'
    const pollActivePanels = async () => {
      try {
        const response = await fetch('/api/active-panels')
        const data = await response.json()
        if (!Array.isArray(data.panels)) return
        const serialized = JSON.stringify(data.panels)
        if (serialized === lastSerialized) return
        lastSerialized = serialized
        setActivePanelsState(data.panels)
        setSequencePanelIds(data.panels.map((panel: ActivePanel) => panel.id))
        if (data.panels.length > 0) {
          setSequenceId((id) => id + 1)
          setIsOperationActive(true)
        }
      } catch {
        // Local API may still be starting; keep the current UI state.
      }
    }

    void pollActivePanels()
    const interval = window.setInterval(pollActivePanels, 1000)
    return () => window.clearInterval(interval)
  }, [])

  const submitRegister = async () => {
    await refreshOperations()
    setModal('success')
  }

  const startOperations = async (selectedOperations: Operation[]) => {
    const panelIds = selectedOperations.map((operation) => operation.panelId)
    await setActivePanels(selectedOperations.map((operation) => ({
      id: operation.panelId,
      status: 'ON',
      description: operation.unitId,
    })))
    setSequencePanelIds(panelIds)
    setActivePanelsState(selectedOperations.map((operation) => ({
      id: operation.panelId,
      status: 'ON',
      description: operation.unitId,
    })))
    setSequenceId((id) => id + 1)
    setIsOperationActive(true)
    await refreshOperations()
  }

  const finishOperations = async (selectedOperations: Operation[]) => {
    await completeOperations(selectedOperations.map((operation) => operation.id))
    await refreshOperations()
  }

  const activeOperations = operations.filter((operation) => isProgress(operation.status))
  const viewerPanelIds = sequencePanelIds
  const handleSequenceDone = useCallback(() => {
    setSequencePanelIds([])
    setActivePanelsState([])
    void clearActivePanels()
  }, [])

  return (
    <>
      <Header />
      <div className="grid h-[calc(100vh-104px)] min-h-0 grid-cols-[430px_minmax(560px,1fr)_240px] gap-3 overflow-hidden">
        <FloorPlan cameraPos={cameraPos} targetPanelIds={viewerPanelIds} activePanels={activePanels} />
        <main className="grid min-h-0 grid-rows-[minmax(180px,1fr)_238px] gap-3">
          {activePanels.length > 0 && (
            <div className="pointer-events-none absolute left-[450px] right-[260px] top-[118px] z-20 flex flex-col gap-1">
              {activePanels.map((panel) => (
                <div key={panel.id} className="flex max-w-xl items-center gap-2 rounded-md border border-red-800/60 bg-red-950/90 px-2.5 py-1 text-[11px] font-bold text-red-200 shadow-lg">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.25)]" />
                  <span className="font-mono">{panel.description || String(panel.id).padStart(2, '0')}</span>
                  <span className="ml-auto rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] text-emerald-400">{panel.status || 'ON'}</span>
                </div>
              ))}
            </div>
          )}
          <ImageViewer
            activePanelIds={viewerPanelIds}
            sequenceId={sequenceId}
            isOperationActive={isOperationActive}
            onCameraUpdate={setCameraPos}
            onSequenceDone={handleSequenceDone}
          />
          <div className="grid min-h-0 grid-cols-[repeat(4,minmax(132px,1fr))_minmax(260px,1.25fr)] gap-3">
            {[
              { icon: Radio, label: 'GENi 연동', value: 'ON', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: ShieldCheck, label: '키보관함', value: 'ON', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Server, label: '패널', value: '47', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Bell, label: '비정상', value: `${KEY_BOX_STATUS.filter((item) => item.abnormal).length}건`, color: KEY_BOX_STATUS.some((item) => item.abnormal) ? 'text-red-600' : 'text-emerald-600', bg: KEY_BOX_STATUS.some((item) => item.abnormal) ? 'bg-red-50' : 'bg-emerald-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <section key={label} className="min-h-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}><Icon className="h-5 w-5" /></div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                <div className={`mt-1 text-xl font-black ${color}`}>{value}</div>
              </section>
            ))}
            <RecentActivity operations={operations} onViewAll={() => setModal('activity')} />
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
      {modal === 'start' && <OperationModal mode="start" operations={operations} onClose={() => setModal(null)} onConfirm={startOperations} />}
      {modal === 'complete' && <OperationModal mode="complete" operations={operations} onClose={() => setModal(null)} onConfirm={finishOperations} />}
      {modal === 'history' && <HistoryModal operations={operations} onClose={() => setModal(null)} />}
      {modal === 'activity' && <HistoryModal operations={operations} onClose={() => setModal(null)} />}
    </>
  )
}
