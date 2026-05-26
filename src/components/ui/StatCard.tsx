import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  label: string
  value: string
  color: 'blue' | 'red' | 'green' | 'orange' | 'slate'
  sub?: string
}

const colors = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  slate: 'bg-slate-100 text-slate-500',
}

export function StatCard({ icon: Icon, label, value, color, sub }: Props) {
  return (
    <div className="flex min-h-24 items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className={`text-xs font-bold ${colors[color].split(' ')[1]}`}>{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-950">{value} <span className="text-sm font-semibold">{sub}</span></div>
      </div>
    </div>
  )
}
