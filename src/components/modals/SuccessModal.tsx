import { Check, X } from 'lucide-react'
import { useEffect } from 'react'

export function SuccessModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2500)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-6">
      <div className="relative h-[560px] w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        {Array.from({ length: 16 }, (_, index) => (
          <span key={index} className="confetti-particle absolute h-2 w-2 rounded-sm" style={{ left: `${15 + (index * 5) % 70}%`, top: `${20 + (index * 11) % 45}%`, background: ['#10B981', '#3B82F6', '#60A5FA', '#14B8A6'][index % 4], animationDelay: `${index * 0.12}s` }} />
        ))}
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-white via-white to-blue-50">
          <div className="mb-14 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_0_40px_rgba(16,185,129,.45)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="h-12 w-12" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">조작 등록 완료</div>
        </div>
      </div>
    </div>
  )
}
