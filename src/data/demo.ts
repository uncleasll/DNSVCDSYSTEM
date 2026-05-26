import { MOCK_EQUIPMENT, MOCK_KEY_STATUS } from './mockData'
import { PANEL_DATA } from './panels'

export const demoAlarms = [
  { level: 'KEY-ALERT', unitId: 'UNIT-06B', equipment: 'VERTICAL MILL D', time: '20:08:12', area: 'MILL', message: 'Key box abnormal signal detected', status: 'Unresolved' },
  { level: 'KEY-ALERT', unitId: 'UNIT-10F', equipment: 'PAF-D', time: '20:07:05', area: 'PA', message: 'Breaker key is open during normal operation', status: 'Unresolved' },
  { level: 'WARNING', unitId: 'COM-18B', equipment: 'FGD', time: '20:06:45', area: 'FGD', message: 'Communication delay detected', status: 'Checking' },
  { level: 'WARNING', unitId: 'UNIT-03A', equipment: 'FO-B', time: '20:05:33', area: 'FAN', message: 'Signal quality below threshold', status: 'Checking' },
  { level: 'ALARM', unitId: 'UNIT-01A', equipment: 'AUX TR INCOMING', time: '20:04:21', area: 'YARD', message: 'Panel door status mismatch', status: 'Resolved' },
]

export const notices = Array.from({ length: 8 }, (_, index) => ({
  title: '[점검] 5/20 정기 점검 안내',
  date: '2026.05.18',
  id: index + 1,
}))

export const unitRows = PANEL_DATA.map((unit, index) => {
  const equipment = MOCK_EQUIPMENT[index % MOCK_EQUIPMENT.length]
  const key = MOCK_KEY_STATUS[index % MOCK_KEY_STATUS.length]
  const status = unit.status === 'alert' ? 'KEY-ALERT' : unit.status === 'warning' ? 'WARNING' : 'KEY-CLOSED'

  return {
    panelId: unit.id,
    unitId: unit.unitId,
    area: unit.groupCode,
    equipmentId: unit.systemCode,
    equipmentName: unit.name,
    status,
    voltage: equipment.voltage || '4.16',
    current: '152.4',
    power: '634',
    communication: unit.status === 'warning' ? '주의' : '정상',
    workStatus: unit.status === 'alert' ? '확인필요' : key.operator,
  }
})
