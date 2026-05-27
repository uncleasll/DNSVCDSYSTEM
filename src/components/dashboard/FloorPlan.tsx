import { PANEL_DATA } from '../../data/panels'

type ActivePanel = {
  id: number
  status: string
  description: string
}

type PanelCabinet = {
  id: string
  upperId: number
  lowerId: number
  position: [number, number, number]
}

type Props = {
  cameraPos: { x: number; z: number; rotation: number }
  targetPanelIds?: number[]
  activePanels?: ActivePanel[]
}

function buildCabinets(): PanelCabinet[] {
  const items: PanelCabinet[] = []
  const rowZ: [number, number] = [-4.9, 4.9]
  const startX = 11

  for (let col = 0; col < 12; col += 1) {
    items.push({
      id: `right-${col}`,
      upperId: col * 2 + 1,
      lowerId: col * 2 + 2,
      position: [startX + col * 2, 2.5, rowZ[1]],
    })
  }

  for (let col = 0; col < 12; col += 1) {
    if (col === 0) {
      items.push({ id: 'left-0', upperId: 47, lowerId: 47, position: [startX, 2.5, rowZ[0]] })
      continue
    }
    const upperId = 47 - col * 2
    items.push({ id: `left-${col}`, upperId, lowerId: upperId + 1, position: [startX + col * 2, 2.5, rowZ[0]] })
  }

  return items
}

const cabinets = buildCabinets()

export function FloorPlan({ cameraPos, targetPanelIds = [], activePanels = [] }: Props) {
  // Unitlar kattaroq ko'rinishi uchun viewBox va oraliqlar birga oshirildi.
  const width = 3400
  const height = 7000
  
  // Panellarning vertikal (Y) o'qi bo'yicha oralarini ochish.
  const normalScale = 270 

  // Panellarning gorizontal (X) o'qi bo'yicha oralarini ochish.
  const mapX2D = (z: number) => 1700 + z * 195 
  
  const mapY2D = (x: number) => {
    if (x >= 11) return 260 + (35 - x) * normalScale
    const yAt11 = 260 + (35 - 11) * normalScale
    return yAt11 + (11 - x) * 25 // Bu yer ham muvozanat uchun oshirildi
  }

  return (
    <section className="flex h-[calc(100vh-104px)] min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="floor-grid" width={100} height={100} patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
              <circle cx="50" cy="50" r="1.5" fill="rgba(37,99,235,0.16)" />
            </pattern>
            <radialGradient id="camera-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="floor-panel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="floor-selected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
            <filter id="floor-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#floor-grid)" />

          {cabinets.map((cabinet) => {
            const isSelectedUpper = targetPanelIds.includes(cabinet.upperId)
            const isSelectedLower = targetPanelIds.includes(cabinet.lowerId)
            const isSelected = isSelectedUpper || isSelectedLower
            const panelWidth = 1120
            const panelHeight = 480
            const xPos = mapX2D(cabinet.position[2]) - panelWidth / 2
            const yPos = mapY2D(cabinet.position[0]) - panelHeight / 2
            const upper = PANEL_DATA.find((panel) => panel.id === cabinet.upperId)
            const lower = PANEL_DATA.find((panel) => panel.id === cabinet.lowerId)

            return (
              <g key={cabinet.id}>
                {isSelected && (
                  <rect
                    x={xPos - 12}
                    y={yPos - 12}
                    width={panelWidth + 24}
                    height={panelHeight + 24}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="6"
                    rx="8"
                    filter="url(#floor-glow)"
                    className="animate-pulse"
                  />
                )}
                <rect
                  x={xPos}
                  y={yPos}
                  width={panelWidth}
                  height={panelHeight}
                  fill={isSelected ? 'url(#floor-selected)' : 'url(#floor-panel)'}
                  stroke={isSelected ? '#2563eb' : '#cbd5e1'}
                  strokeWidth={isSelected ? '4' : '3'}
                  rx="6"
                />
                <clipPath id={`clip-${cabinet.id}-upper`}>
                  <rect x={xPos + 22} y={yPos + 30} width={panelWidth - 44} height="176" rx="5" />
                </clipPath>
                <clipPath id={`clip-${cabinet.id}-lower`}>
                  <rect x={xPos + 22} y={yPos + 222} width={panelWidth - 44} height="178" rx="5" />
                </clipPath>
                <rect x={xPos + 2} y={yPos + 2} width={panelWidth - 4} height={panelHeight * 0.15} fill="rgba(37,99,235,0.08)" rx="4" />
                <g clipPath={`url(#clip-${cabinet.id}-upper)`}>
                  <text x={xPos + 34} y={yPos + 94} fontSize="108" fontWeight="800" fill={isSelectedUpper ? '#1d4ed8' : '#2563eb'} textAnchor="start" alignmentBaseline="middle">
                    {String(cabinet.upperId).padStart(2, '0')}
                  </text>
                  <text x={xPos + 214} y={yPos + 94} fontSize="98" fontWeight="800" fill={isSelectedUpper ? '#0f172a' : '#1e293b'} textAnchor="start" alignmentBaseline="middle">
                    {upper?.unitId ?? ''}
                  </text>
                  <text x={xPos + 34} y={yPos + 180} fontSize="68" fontWeight="700" fill={isSelectedUpper ? '#1d4ed8' : '#64748b'} textAnchor="start" alignmentBaseline="middle">
                    {(upper?.name ?? '').slice(0, 25)}
                  </text>
                </g>

                {cabinet.upperId !== cabinet.lowerId && (
                  <g clipPath={`url(#clip-${cabinet.id}-lower)`}>
                    <text x={xPos + 34} y={yPos + 278} fontSize="108" fontWeight="800" fill={isSelectedLower ? '#1d4ed8' : '#2563eb'} textAnchor="start" alignmentBaseline="middle">
                      {String(cabinet.lowerId).padStart(2, '0')}
                    </text>
                    <text x={xPos + 214} y={yPos + 278} fontSize="98" fontWeight="800" fill={isSelectedLower ? '#0f172a' : '#1e293b'} textAnchor="start" alignmentBaseline="middle">
                      {lower?.unitId ?? ''}
                    </text>
                    <text x={xPos + 34} y={yPos + 364} fontSize="68" fontWeight="700" fill={isSelectedLower ? '#1d4ed8' : '#64748b'} textAnchor="start" alignmentBaseline="middle">
                      {(lower?.name ?? '').slice(0, 25)}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          <g transform={`translate(${width / 2}, ${height / 2})`}>
            <circle r="220" fill="url(#camera-glow)" />
            <circle r="52" fill="#2563eb" stroke="#fff" strokeWidth="10" className="animate-pulse" />
            <circle r="20" fill="#fff" opacity="0.9" />
          </g>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-bold">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-500">ACTIVE <span className="float-right text-blue-600">{activePanels.length}</span></div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-500">CAM X <span className="float-right text-blue-600">{cameraPos.x.toFixed(1)}</span></div>
      </div>
    </section>
  )
}
