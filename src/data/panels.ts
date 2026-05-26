import type { Unit } from '../types'

export type PanelGlbKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

export type PanelInfo = Unit & {
  glbKey: PanelGlbKey
  type: string
  systemCode: string
  systemName: string
  groupCode: string
  groupMcs: string
}

const basePanels: Array<Omit<PanelInfo, 'status'>> = [
  { id: 1, glbKey: 'A', unitId: 'UNIT-10E', name: 'PAF-C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 2, glbKey: 'A', unitId: 'UNIT-10F', name: 'PAF-D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 3, glbKey: 'A', unitId: 'UNIT-10C', name: 'PAF-A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 4, glbKey: 'A', unitId: 'UNIT-10D', name: 'PAF-B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 5, glbKey: 'F', unitId: 'UNIT-10A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 6, glbKey: 'A', unitId: 'UNIT-10B', name: 'FDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 7, glbKey: 'B', unitId: 'UNIT-09A', name: 'PC TR UNIT-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 8, glbKey: 'B', unitId: 'UNIT-09B', name: 'IDF-A', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 9, glbKey: 'A', unitId: 'UNIT-08A', name: 'COP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 10, glbKey: 'A', unitId: 'UNIT-08B', name: 'COP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 11, glbKey: 'A', unitId: 'UNIT-07A', name: 'MTR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 12, glbKey: 'A', unitId: 'UNIT-07B', name: 'STAGE 2 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 13, glbKey: 'A', unitId: 'UNIT-06A', name: 'VERTICAL MILL C', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 14, glbKey: 'A', unitId: 'UNIT-06B', name: 'VERTICAL MILL D', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 15, glbKey: 'A', unitId: 'UNIT-05A', name: 'VERTICAL MILL A', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 16, glbKey: 'A', unitId: 'UNIT-05B', name: 'VERTICAL MILL B', type: '차단기', systemCode: '531130', systemName: '#1 연료연소계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 17, glbKey: 'A', unitId: 'UNIT-04A', name: 'BFP-A', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 18, glbKey: 'A', unitId: 'UNIT-04B', name: 'BFP-B', type: '차단기', systemCode: '531260', systemName: '#1 급수계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 19, glbKey: 'A', unitId: 'UNIT-03A', name: 'IDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 20, glbKey: 'A', unitId: 'UNIT-03B', name: 'FDF-B', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 21, glbKey: 'B', unitId: 'UNIT-02A', name: 'PC TR UNIT-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 22, glbKey: 'B', unitId: 'UNIT-02B', name: '#2 BIOMASS STORAGE BACK-UP TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 23, glbKey: 'E', unitId: 'UNIT-01A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 24, glbKey: 'D', unitId: 'UNIT-01B', name: 'AUX TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 25, glbKey: 'C', unitId: 'COM-20A', name: 'AUX COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 26, glbKey: 'D', unitId: 'COM-20B', name: 'START-UP TR INCOMING', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 27, glbKey: 'A', unitId: 'COM-19A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 28, glbKey: 'B', unitId: 'COM-19B', name: 'INTAKE FEEDER', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 29, glbKey: 'B', unitId: 'COM-18A', name: 'PC TR COM-B', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 30, glbKey: 'B', unitId: 'COM-18B', name: 'FGD', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 31, glbKey: 'B', unitId: 'COM-17A', name: 'NO.2 2D BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 32, glbKey: 'B', unitId: 'COM-17B', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 33, glbKey: 'B', unitId: 'COM-16A', name: 'NO.2 2C BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 34, glbKey: 'B', unitId: 'COM-16B', name: 'PC TR COM-A', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 35, glbKey: 'A', unitId: 'COM-15A', name: '#1신사옥 TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 36, glbKey: 'A', unitId: 'COM-15B', name: 'BFP-C', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 37, glbKey: 'B', unitId: 'COM-14A', name: 'FLY ASH SYSTEM', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 38, glbKey: 'A', unitId: 'COM-14B', name: 'ASP-B', type: '차단기', systemCode: '533140', systemName: '#1,2 회처리계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 39, glbKey: 'B', unitId: 'COM-13A', name: '#3 BIOMASS STORAGE TO DS반', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 40, glbKey: 'B', unitId: 'COM-13B', name: 'UNIT-COM BUS TIE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531120', groupMcs: '#1 Common 4.16KV MCS' },
  { id: 41, glbKey: 'A', unitId: 'UNIT-12A', name: 'MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 42, glbKey: 'A', unitId: 'UNIT-12B', name: 'ASP-A', type: '차단기', systemCode: '531160', systemName: '#1 회처리계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 43, glbKey: 'F', unitId: 'UNIT-11A', name: 'BUS DUCT COMPARTMENT', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 44, glbKey: 'A', unitId: 'UNIT-11B', name: 'HGRF', type: '차단기', systemCode: '531140', systemName: '#1 통풍계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 45, glbKey: 'A', unitId: 'UNIT-10G', name: 'STAGE 1 HAMMER MILL', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 46, glbKey: 'B', unitId: 'UNIT-10H', name: 'NON MOTOR SPARE', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
  { id: 47, glbKey: 'G', unitId: 'UNIT-10I', name: 'STAGE 1 HAMMER MILL VC', type: '차단기', systemCode: '531330', systemName: '#1 소내전력계통', groupCode: 'G531110', groupMcs: '#1 Unit 4.16kV MCS' },
]

const alertIds = new Set([14, 30, 42])
const warningIds = new Set([2, 19, 38])

export const PANEL_DATA: PanelInfo[] = basePanels.map((panel) => ({
  ...panel,
  status: alertIds.has(panel.id) ? 'alert' : warningIds.has(panel.id) ? 'warning' : 'normal',
}))

export function getPanelById(panelId: number) {
  return PANEL_DATA.find((panel) => panel.id === panelId)
}

export function getPanelByUnitId(unitId: string) {
  return PANEL_DATA.find((panel) => panel.unitId === unitId)
}
