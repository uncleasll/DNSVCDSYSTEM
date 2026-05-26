import type { EquipmentStatus, KeyStatus, WorkStatus } from '../../types'

type Props = {
  status: KeyStatus | WorkStatus | EquipmentStatus | string
  blink?: boolean
}

const styles: Record<string, string> = {
  KEY_ALERT: 'bg-red-100 text-red-600',
  'KEY ALERT': 'bg-red-100 text-red-600',
  KEY_OPEN: 'bg-emerald-100 text-emerald-600',
  'KEY OPEN': 'bg-emerald-100 text-emerald-600',
  KEY_CLOSED: 'bg-blue-100 text-blue-600',
  'KEY CLOSED': 'bg-blue-100 text-blue-600',
  WARNING: 'bg-amber-100 text-amber-600',
  NORMAL: 'bg-emerald-100 text-emerald-600',
  완료: 'bg-emerald-100 text-emerald-600',
  진행중: 'bg-blue-100 text-blue-600',
  실패: 'bg-red-100 text-red-600',
  정상: 'bg-emerald-100 text-emerald-600',
  경보: 'bg-orange-100 text-orange-600',
  알람: 'bg-red-100 text-red-600',
  정지: 'bg-slate-100 text-slate-500',
  점검: 'bg-blue-100 text-blue-600',
}

export function StatusBadge({ status, blink = false }: Props) {
  const label = status.replaceAll('_', ' ')
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold ${styles[status] ?? styles[label] ?? 'bg-slate-100 text-slate-600'} ${blink ? 'alert-blink' : ''}`}>
      {label}
    </span>
  )
}
