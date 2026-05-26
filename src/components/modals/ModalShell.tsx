import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClose: () => void
  className?: string
  showClose?: boolean
}

export function ModalShell({ children, onClose, className = 'max-w-lg', showClose = true }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6">
      <div className={`relative flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${className}`}>
        {showClose && (
          <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
