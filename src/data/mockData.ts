import type { EquipmentItem, HistoryItem, KeyStatusItem, Unit } from '../types'
import { PANEL_DATA } from './panels'

// TODO: Replace with actual API calls to HW system DB.
// DB Connection point: GET /api/units - returns breaker/panel list with status.
export const MOCK_UNITS: Unit[] = PANEL_DATA.map(({ id, unitId, name, status }) => ({ id, unitId, name, status }))

// TODO: DB Connection point: GET /api/key-status - returns key box status.
// HW team: this table should have fields: unit_id, status (KEY_OPEN|KEY_CLOSED|KEY_ALERT), timestamp, is_abnormal.
export const MOCK_KEY_STATUS: KeyStatusItem[] = [
  { unitId: 'UNIT-12B', equipName: 'ASP-A', status: 'KEY_ALERT', operator: '박민준', timestamp: '2026-05-19 20:07:13' },
  { unitId: 'COM-19B', equipName: 'INTAKE FEEDER', status: 'KEY_CLOSED', operator: '정비팀', timestamp: '2026-05-19 19:57:23' },
  { unitId: 'COM-20B', equipName: 'START-UP TR INCOMING', status: 'KEY_CLOSED', operator: '환경팀', timestamp: '2026-05-19 19:07:36' },
  { unitId: 'UNIT-30A', equipName: 'VERTICAL MILL A', status: 'KEY_CLOSED', operator: '운선팀', timestamp: '2026-05-19 18:57:21' },
  { unitId: 'UNIT-02A', equipName: 'PC TR UNIT-B', status: 'KEY_CLOSED', operator: '운전팀', timestamp: '2026-05-19 18:53:59' },
  { unitId: 'COM-16B', equipName: 'PC TR COM-A', status: 'KEY_ALERT', operator: '김철수', timestamp: '2026-05-19 18:07:41' },
  { unitId: 'UNIT-03A', equipName: 'IDF-B', status: 'KEY_OPEN', operator: '정현우', timestamp: '2026-05-19 17:33:10' },
  { unitId: 'COM-14B', equipName: 'ASP-B', status: 'KEY_OPEN', operator: '이영희', timestamp: '2026-05-19 17:10:00' },
]

// TODO: DB Connection point: GET /api/history - paginated operation history.
export const MOCK_HISTORY: HistoryItem[] = [
  { unitId: 'UNIT-12B', equipName: 'ASP-A', status: 'KEY_ALERT', operator: '박민준', timestamp: '2026-05-19 14:30:12', workStatus: '완료', content: 'KEY ALERT' },
  { unitId: 'COM-20B', equipName: 'START-UP TR INCOMING', status: 'KEY_OPEN', operator: '이영희', timestamp: '2026-05-19 13:10:00', workStatus: '완료', content: 'KEY OPEN' },
  { unitId: 'UNIT-02A', equipName: 'PC TR UNIT-B', status: 'KEY_CLOSED', operator: '운선팀', timestamp: '2026-05-19 11:08:45', workStatus: '진행중', content: 'KEY CLOSED' },
  { unitId: 'UNIT-07B', equipName: 'STAGE 2 HAMMER MILL', status: 'KEY_CLOSED', operator: '윤서연', timestamp: '2026-05-19 11:00:33', workStatus: '완료', content: 'KEY CLOSED' },
  { unitId: 'COM-16B', equipName: 'PC TR COM-A', status: 'KEY_ALERT', operator: '김철수', timestamp: '2026-05-19 10:18:15', workStatus: '완료', content: 'KEY ALERT' },
  { unitId: 'COM-19B', equipName: 'INTAKE FEEDER', status: 'KEY_CLOSED', operator: '정비팀', timestamp: '2026-05-19 09:09:48', workStatus: '진행중', content: 'KEY CLOSED' },
  { unitId: 'COM-20B', equipName: 'START-UP TR INCOMING', status: 'KEY_CLOSED', operator: '환경팀', timestamp: '2026-05-19 09:09:46', workStatus: '진행중', content: 'KEY CLOSED' },
  { unitId: 'UNIT-03A', equipName: 'IDF-B', status: 'KEY_CLOSED', operator: '환경팀', timestamp: '2026-05-19 09:09:45', workStatus: '진행중', content: 'KEY CLOSED' },
  { unitId: 'COM-20A', equipName: 'AUX COMPARTMENT', status: 'KEY_CLOSED', operator: '정비팀', timestamp: '2026-05-19 09:09:39', workStatus: '진행중', content: 'KEY CLOSED' },
  { unitId: 'UNIT-03B', equipName: 'IDF-B', status: 'KEY_OPEN', operator: '정현우', timestamp: '2026-05-19 09:09:30', workStatus: '진행중', content: 'KEY OPEN' },
  { unitId: 'UNIT-10C', equipName: 'PAF-A', status: 'KEY_CLOSED', operator: '최지수', timestamp: '2026-05-19 08:10:00', workStatus: '완료', content: 'KEY CLOSED' },
  { unitId: 'UNIT-05A', equipName: 'VERTICAL MILL A', status: 'KEY_ALERT', operator: '박민준', timestamp: '2026-05-18 16:30:22', workStatus: '실패', content: 'KEY ALERT' },
]

// TODO: DB Connection point: GET /api/equipment - returns equipment inventory and health state.
export const MOCK_EQUIPMENT: EquipmentItem[] = [
  { id: 'MTR-06B', name: 'Vertical Mill D', area: 'MILL', type: 'Mechanical', status: '정상', voltage: '4.16', capacity: '450 kW', updatedAt: '20:08:12' },
  { id: 'FAN-10F', name: 'PAF-D', area: 'PA', type: 'Mechanical', status: '경보', voltage: '4.16', capacity: '315 kW', updatedAt: '20:07:05' },
  { id: 'PUMP-18B', name: 'FGD Pump B', area: 'FGD', type: 'Mechanical', status: '경보', voltage: '4.16', capacity: '200 kW', updatedAt: '20:06:45' },
  { id: 'TR-01A', name: 'Aux TR Incoming', area: 'YARD', type: 'Electrical', status: '정상', voltage: '22.9', capacity: '1.5 MVA', updatedAt: '20:06:21' },
  { id: 'BRK-16A', name: 'Breaker 16A', area: 'SWGR', type: 'Electrical', status: '정상', voltage: '4.16', capacity: '-', updatedAt: '20:05:33' },
  { id: 'DCS-01', name: 'DCS Controller', area: 'CONTROL', type: 'Control', status: '정상', voltage: '-', capacity: '-', updatedAt: '20:05:01' },
  { id: 'TT-01A', name: 'Steam Temp. Transmitter', area: 'BOILER', type: 'Instrument', status: '경보', voltage: '-', capacity: '-', updatedAt: '20:04:32' },
  { id: 'LT-02B', name: 'Level Transmitter B', area: 'BOILER', type: 'Instrument', status: '정지', voltage: '-', capacity: '-', updatedAt: '20:04:11' },
  { id: 'MCC-2B', name: 'MCC Panel 2B', area: 'ELEC RM', type: 'Electrical', status: '알람', voltage: '4.16', capacity: '-', updatedAt: '20:03:44' },
  { id: 'COOL-01A', name: 'Cooling Water Pump A', area: 'CW', type: 'Mechanical', status: '점검', voltage: '4.16', capacity: '110 kW', updatedAt: '20:03:21' },
]

// TODO: DB Connection point: GET /api/teams, GET /api/workers.
export const TEAM_DATA: Record<string, { supervisors: string[]; workers: string[] }> = {
  전기팀: { supervisors: ['김철수', '박민준', '윤서연'], workers: ['정수현', '한기범', '임동욱'] },
  운전팀: { supervisors: ['이영희', '정현우'], workers: ['최지수', '오세훈', '강민재'] },
  환경팀: { supervisors: ['최지수', '강하늘'], workers: ['서지훈', '문태오', '권유진'] },
  정비팀: { supervisors: ['정비팀', '장우진'], workers: ['백도윤', '이하준', '유민석'] },
  안전팀: { supervisors: ['한소라', '문지아'], workers: ['송재민', '노현준', '임서율'] },
  계측팀: { supervisors: ['차은우', '배수빈'], workers: ['홍지민', '김도현', '이준서'] },
  토목팀: { supervisors: ['오지훈', '권나현'], workers: ['신태양', '남궁민', '류하린'] },
  기계팀: { supervisors: ['하정우', '서민준'], workers: ['전유찬', '양지후', '황서준'] },
}

export const MOCK_TEAMS = Object.keys(TEAM_DATA)
export const MOCK_WORKERS = Object.values(TEAM_DATA).flatMap((team) => [...team.supervisors, ...team.workers])

// TODO: DB Connection point: POST /api/operation/register - register new operation.
// TODO: DB Connection point: POST /api/operation/start - start operation and trigger key box open.
// TODO: DB Connection point: POST /api/operation/complete - complete operation.
// Request body format: { unitId, team, supervisor, worker, timestamp }.
