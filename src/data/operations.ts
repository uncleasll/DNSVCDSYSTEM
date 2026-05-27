import { MOCK_HISTORY, MOCK_TEAMS, MOCK_UNITS } from './mockData'
import type { Operation } from '../types'

export const MOCK_REASONS = ['정기 점검 후 복전', '설비 보수·교체', '예방 정비', '절연 시험', '부하 시험', '긴급 복전', '계획 개방', '기타']

export const INITIAL_OPERATIONS: Operation[] = MOCK_HISTORY.slice(0, 6).map((item, index) => {
  const unit = MOCK_UNITS.find((candidate) => candidate.unitId === item.unitId)

  return {
    id: index + 1,
    panelId: unit?.id ?? index + 1,
    unitId: item.unitId,
    equipName: item.equipName,
    opType: item.content as Operation['opType'],
    operator: item.operator,
    department: MOCK_TEAMS[index % MOCK_TEAMS.length],
    purpose: MOCK_REASONS[index % MOCK_REASONS.length],
    status: item.workStatus,
    notes: '',
    operatedAt: item.timestamp,
  }
})

export function nowStamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
