import { ThreePanelViewer } from './ThreePanelViewer'

export function ImageViewer({ activePanelIds = [], onSequenceDone }: { activePanelIds?: number[]; onSequenceDone?: () => void }) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
      <ThreePanelViewer activePanelIds={activePanelIds} onSequenceDone={onSequenceDone} />
    </div>
  )
}
