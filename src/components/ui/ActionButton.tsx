import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  variant: 'dark' | 'green' | 'orange'
  onClick: () => void
}

const variants = {
  dark: 'bg-slate-950 text-white border-slate-950',
  green: 'bg-white text-emerald-600 border-slate-200',
  orange: 'bg-white text-amber-500 border-slate-200',
}

export function ActionButton({ icon: Icon, label, variant, onClick }: Props) {
  return (
    <button type="button" onClick={onClick} className={`flex h-14 w-full items-center justify-center gap-3 rounded-xl border text-base font-bold shadow-sm transition hover:shadow-md ${variants[variant]}`}>
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}
