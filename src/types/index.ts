export type KeyStatus = 'KEY_ALERT' | 'KEY_OPEN' | 'KEY_CLOSED' | 'WARNING' | 'NORMAL'
export type WorkStatus = string
export type EquipmentStatus = string

export interface Unit {
  id: number
  unitId: string
  name: string
  status: 'normal' | 'warning' | 'alert'
}

export interface KeyStatusItem {
  unitId: string
  equipName: string
  status: KeyStatus
  operator: string
  timestamp: string
}

export interface HistoryItem extends KeyStatusItem {
  workStatus: WorkStatus
  content: string
}

export interface Operation {
  id: number
  panelId: number
  unitId: string
  equipName: string
  panelName?: string
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT'
  operator: string
  department: string
  purpose: string
  status: WorkStatus
  notes: string
  operatedAt: string
}

export interface KeyBoxStatus {
  unitId: string
  keyStatus: 'KEY_OPEN' | 'KEY_CLOSED' | 'KEY_ALERT'
  doorStatus: 'OPEN' | 'CLOSED' | 'ABNORMAL'
  abnormal: boolean
  updatedAt: string
}

export interface EquipmentItem {
  id: string
  name: string
  area: string
  type: string
  status: EquipmentStatus
  voltage: string
  capacity: string
  updatedAt: string
}
