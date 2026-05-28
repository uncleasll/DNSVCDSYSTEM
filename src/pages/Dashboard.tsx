import { Bell, CheckCircle, History as HistoryIcon, Play, PlusCircle, Radio, Server, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import type { Operation } from '../types'

type Modal = 'register' | 'success' | 'start' | 'complete' | 'history' | 'activity' | null

const isProgress = (status: string) => status === '진행중' || status === 'м§„н–‰м¤‘'

export function Dashboard() {
  const [modal, setModal] = useState<Modal>(null)
  const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS)
  const [sequencePanelIds, setSequencePanelIds] = useState<number[]>([])
  const [sequenceId, setSequenceId] = useState(0)
  const [activePanels, setActivePanelsState] = useState<ActivePanel[]>([])
  const [isOperationActive, setIsOperationActive] = useState(false)
  const lastActivePanelsSerializedRef = useRef('[]')

  const refreshOperations = useCallback(async () => {
    setOperations(await fetchOperations())
  }, [])

  useEffect(() => {
    void refreshOperations().catch(() => undefined)
  }, [refreshOperations])

  useEffect(() => {
    const pollActivePanels = async () => {
      try {
        const response = await fetch('/api/active-panels')
        const data = await response.json()
        if (!Array.isArray(data.panels)) return
        const serialized = JSON.stringify(data.panels)
        if (serialized === lastActivePanelsSerializedRef.current) return
        lastActivePanelsSerializedRef.current = serialized
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

  const submitRegister = async (_operations: Operation[]) => {
  await refreshOperations()
  setModal('success')
}

  const startOperations = async (selectedOperations: Operation[]) => {
    const panelIds = selectedOperations.map((operation) => operation.panelId)
    const panels = selectedOperations.map((operation) => ({
      id: operation.panelId,
      status: 'ON',
      description: operation.unitId,
    }))

    await setActivePanels(panels)
    lastActivePanelsSerializedRef.current = JSON.stringify(panels)
    setSequencePanelIds(panelIds)
    setActivePanelsState(panels)
    setSequenceId((id) => id + 1)
    setIsOperationActive(true)
    await refreshOperations()
  }

  const finishOperations = async (selectedOperations: Operation[]) => {
    await completeOperations(selectedOperations.map((operation) => operation.id))
    await clearActivePanels()
    lastActivePanelsSerializedRef.current = '[]'
    setSequencePanelIds([])
    setActivePanelsState([])
    await refreshOperations()
  }

  const activeOperations = operations.filter((operation) => isProgress(operation.status))
  const alertCount = activePanels.length + operations.filter((operation) => operation.opType === 'KEY ALERT' && isProgress(operation.status)).length
  const viewerPanelIds = sequencePanelIds
  const handleSequenceDone = useCallback(() => {
    setSequencePanelIds([])
    setActivePanelsState([])
    lastActivePanelsSerializedRef.current = '[]'
    void clearActivePanels()
  }, [])

  return (
    <>
      <div className="grid h-[calc(100vh-32px)] min-h-0 grid-cols-[minmax(320px,360px)_minmax(0,1fr)_200px] grid-rows-[82px_minmax(0,1fr)] gap-3 overflow-hidden">
        <div className="row-span-2 min-h-0">
          <FloorPlan targetPanelIds={viewerPanelIds} />
        </div>
        <div className="col-span-2 min-w-0">
          <Header flush />
        </div>
        <main className="grid min-h-0 min-w-0 grid-rows-[minmax(180px,1fr)_238px] gap-3">
          {activePanels.length > 0 && (
            <div className="pointer-events-none absolute left-[380px] right-[220px] top-[118px] z-20 flex flex-col gap-1">
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
            onSequenceDone={handleSequenceDone}
          />
          <div className="grid min-h-0 min-w-0 grid-cols-[230px_minmax(0,1fr)] gap-3">
            <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600">통신정보</h2>
              </div>
              <div className="grid gap-1.5 p-2.5">
                {[
                  { icon: Radio, label: 'GENi 연동', value: 'ON', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: ShieldCheck, label: '키보관함 연동', value: 'ON', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Bell, label: '알람', value: alertCount > 0 ? `${alertCount}건` : '없음', color: alertCount > 0 ? 'text-red-600' : 'text-emerald-600', bg: alertCount > 0 ? 'bg-red-50' : 'bg-emerald-50' },
                  { icon: Server, label: '패널', value: '47', color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}><Icon className="h-3.5 w-3.5" /></div>
                    <span className="min-w-0 truncate text-[11px] font-bold text-slate-600">{label}</span>
                    <span className={`ml-auto text-xs font-black ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="grid min-h-0 min-w-0 grid-cols-[minmax(190px,0.85fr)_minmax(220px,1.15fr)] gap-3">
              <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-600">시스템 상태</h2>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-600">정상가동</span>
                </div>
                <div className="grid h-[calc(100%-37px)] items-center gap-3 p-3">
                  <div className="space-y-2 text-xs font-bold">
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">월간</span><span className="text-violet-600">{operations.length}건</span></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">진행중</span><span className="text-blue-600">{activeOperations.length}건</span></div>
                    <div className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-slate-500">알람</span><span className="text-red-600">{alertCount}건</span></div>
                  </div>
                </div>
              </section>
              <RecentActivity operations={operations} onViewAll={() => setModal('activity')} />
            </div>
          </div>
        </main>
        <aside className="grid min-h-0 min-w-0 grid-rows-[minmax(120px,1fr)_52px_52px_52px_52px] gap-2 overflow-hidden">
          <StatusPanel operations={activeOperations} />
          <ActionButton icon={PlusCircle} label="조작등록" variant="blue" onClick={() => setModal('register')} />
          <ActionButton icon={Play} label="조작시작" variant="dark" onClick={() => setModal('start')} />
          <ActionButton icon={CheckCircle} label="조작완료" variant="green" onClick={() => setModal('complete')} />
          <ActionButton icon={HistoryIcon} label="이력조회" variant="orange" onClick={() => setModal('history')} />
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
