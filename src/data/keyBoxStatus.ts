import type { KeyBoxStatus } from '../types'

// TODO: HW DB connection point.
// Replace this const with GET /api/key-box-status or direct DB data.
// Expected fields: unitId, keyStatus, doorStatus, abnormal, updatedAt.
export const KEY_BOX_STATUS: KeyBoxStatus[] = [
  { unitId: 'UNIT-12B', keyStatus: 'KEY_OPEN', doorStatus: 'OPEN', abnormal: false, updatedAt: '2026-05-19 20:07:13' },
  { unitId: 'COM-20B', keyStatus: 'KEY_CLOSED', doorStatus: 'CLOSED', abnormal: false, updatedAt: '2026-05-19 19:07:36' },
  { unitId: 'COM-16B', keyStatus: 'KEY_ALERT', doorStatus: 'ABNORMAL', abnormal: true, updatedAt: '2026-05-19 18:07:41' },
]

export function getKeyBoxStatus(unitId: string) {
  return KEY_BOX_STATUS.find((item) => item.unitId === unitId)
}
