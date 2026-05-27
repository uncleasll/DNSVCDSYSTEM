import { ThreePanelViewer } from './ThreePanelViewer'

export function ImageViewer({
  activePanelIds = [],
  sequenceId = 0,
  isOperationActive = false,
  onCameraUpdate,
  onSequenceDone,
}: {
  activePanelIds?: number[]
  sequenceId?: number
  isOperationActive?: boolean
  onCameraUpdate?: (position: { x: number; z: number; rotation: number }) => void
  onSequenceDone?: () => void
}) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-xl border-2 border-sky-500/50 bg-slate-950 shadow-[0_0_0_1px_rgba(14,165,233,0.15),0_0_60px_rgba(14,165,233,0.18),inset_0_0_30px_rgba(14,165,233,0.04)]">
      <ThreePanelViewer
        activePanelIds={activePanelIds}
        sequenceId={sequenceId}
        isOperationActive={isOperationActive}
        onCameraUpdate={onCameraUpdate}
        onSequenceDone={onSequenceDone}
      />
    </div>
  )
}
