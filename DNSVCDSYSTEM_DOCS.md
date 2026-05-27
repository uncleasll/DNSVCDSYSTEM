# DNSVCDSYSTEM — Project Documentation

## What this project is

An electrical panel monitoring and operation management system for KOEN (Korea South-East Power). Workers use it to register, start, and complete switching operations on 47 physical breaker panels inside a switchgear room. The 3D viewer shows the actual room layout — when an operation starts, the system walks the camera to the target panel and blinks it red so workers know exactly which one to work on.

---

## Project structure

```
src/
├── pages/
│   └── Dashboard.tsx          ← main page, owns all state
├── components/
│   ├── dashboard/
│   │   ├── ThreePanelViewer.tsx   ← 3D scene (Three.js / R3F)
│   │   ├── ImageViewer.tsx        ← wrapper around ThreePanelViewer
│   │   ├── FloorPlan.tsx          ← 2D SVG map, shows camera dot
│   │   ├── StatusPanel.tsx        ← active operation list in sidebar
│   │   └── RecentActivity.tsx     ← recent ops log
│   ├── modals/
│   │   ├── RegisterModal.tsx      ← register new operation
│   │   ├── OperationModal.tsx     ← start / complete operations
│   │   ├── HistoryModal.tsx       ← history viewer
│   │   ├── SuccessModal.tsx       ← success confirmation
│   │   └── ModalShell.tsx         ← shared modal wrapper
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   └── ui/
│       ├── ActionButton.tsx
│       ├── StatusBadge.tsx
│       └── StatCard.tsx
├── api/
│   └── operations.ts          ← all fetch calls to server
├── data/
│   ├── panels.ts              ← 47 panel definitions (id, unitId, name, glbKey)
│   ├── mockData.ts            ← TEAM_DATA, MOCK_UNITS, MOCK_KEY_STATUS, MOCK_HISTORY
│   ├── operations.ts          ← INITIAL_OPERATIONS, MOCK_REASONS, nowStamp()
│   └── keyBoxStatus.ts        ← KEY_BOX_STATUS for stat cards
├── types/
│   └── index.ts               ← Operation, Unit, KeyStatusItem, etc.
└── App.tsx                    ← router setup, sidebar layout
```

---

## Tech stack

- React 19 + TypeScript + Vite
- React Router v7
- Three.js via @react-three/fiber + @react-three/drei
- GSAP for camera animations
- @react-three/postprocessing (Bloom, Vignette, ToneMapping)
- Tailwind CSS v4
- Express server (server.js) with JSON file persistence

---

## Core data types

```typescript
// types/index.ts

interface Operation {
  id: number
  panelId: number        // maps to panel ID in 3D scene (1–47)
  unitId: string         // e.g. "UNIT-12B"
  equipName: string      // e.g. "ASP-A"
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT'
  operator: string
  department: string
  purpose: string
  status: string         // '진행중' | '완료' | '실패'
  notes: string
  operatedAt: string
}

interface ActivePanel {
  id: number             // panel ID, used to highlight in 3D
  status: string         // 'ON'
  description: string    // unitId string
}
```

---

## API endpoints (server.js)

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/api/operations` | returns all operations, optional `?status=진행중` filter |
| POST | `/api/operations` | creates a new operation |
| PATCH | `/api/operations/complete` | marks operations as '완료', body: `{ ids: number[] }` |
| GET | `/api/active-panels` | returns currently active panels: `{ panels: ActivePanel[] }` |
| POST | `/api/active-panels` | sets active panels, body: `ActivePanel[]` |
| DELETE | `/api/active-panels` | clears all active panels |

---

## API functions (api/operations.ts)

```typescript
fetchOperations(status?: string): Promise<Operation[]>
registerOperation(op): Promise<Operation>
completeOperations(ids: number[]): Promise<void>
setActivePanels(panels: ActivePanel[]): Promise<void>
clearActivePanels(): Promise<void>
```

---

## How the full operation flow works

### Step 1 — Register
User opens RegisterModal → selects department, reason, and one or more panels (by QR scan or search) → hits submit → `registerOperation()` is called for each selected panel → server creates operations with status `'진행중'` → Dashboard refreshes operations list → SuccessModal appears.

### Step 2 — Start
User opens OperationModal (mode="start") → sees list of `진행중` operations → checks the ones to work on → selects team, supervisor, worker → hits confirm → `onConfirm(selectedOperations, worker, team)` is called → Dashboard's `startOperations()` runs:

```
startOperations(selectedOperations) {
  1. Call setActivePanels(selectedOperations.map → ActivePanel[])
  2. setSequencePanelIds(panelIds)
  3. setSequenceId(id => id + 1)     ← this triggers the 3D sequence
  4. setIsOperationActive(true)
  5. refreshOperations()
}
```

### Step 3 — 3D sequence triggers
`ThreePanelViewer` receives new `sequenceId` and `activePanelIds` via props → `CameraController` useEffect fires:

- If 1 panel selected:
  - Panel blinks red (useFrame flickers overlay opacity)
  - Floor arrows animate toward the panel
  - Camera walks to the panel (GSAP, 4.5s ease)
  - Camera returns home (GSAP, 3.5s ease)
  - This repeats 2 cycles
  - After 5s → `onSequenceDone()` is called

- If multiple panels selected:
  - All panels blink red for 5s
  - Then `onSequenceDone()` is called

### Step 4 — Complete
User opens OperationModal (mode="complete") → sees `진행중` operations → selects which to complete → hits confirm → `onConfirm(selectedOperations, worker, team)` is called → Dashboard's `finishOperations()` runs:

```
finishOperations(selectedOperations) {
  1. Call completeOperations(selectedOperations.map(op => op.id))
  2. Call clearActivePanels()
  3. setSequencePanelIds([])
  4. refreshOperations()
}
```

### Polling
Dashboard polls `/api/active-panels` every 1 second. If the panels array changed (compared by JSON.stringify), it updates `sequencePanelIds` and increments `sequenceId`. This means if someone else triggers an operation from another device, the 3D scene will react automatically.

---

## Dashboard.tsx — state variables

```typescript
const [modal, setModal] = useState<Modal>(null)
// which modal is open: 'register' | 'start' | 'complete' | 'history' | 'success' | 'activity' | null

const [operations, setOperations] = useState<Operation[]>(INITIAL_OPERATIONS)
// full list of operations, refreshed after every action

const [sequencePanelIds, setSequencePanelIds] = useState<number[]>([])
// panel IDs to highlight in 3D, passed as activePanelIds to ThreePanelViewer

const [sequenceId, setSequenceId] = useState(0)
// incremented to trigger a new 3D sequence — ThreePanelViewer watches this

const [activePanels, setActivePanelsState] = useState<ActivePanel[]>([])
// same panels, but as full ActivePanel objects (used for the red badge overlay in UI)

const [cameraPos, setCameraPos] = useState({ x: -6, z: 0, rotation: 0 })
// camera position fed into FloorPlan to show the dot

const [isOperationActive, setIsOperationActive] = useState(false)
// enables keyboard WASD movement in 3D and zoom
```

---

## ThreePanelViewer.tsx — how the 3D works

The viewer is a React Three Fiber Canvas. It has two main parts:

**Room** — static scene: floor GLB, ceiling GLB, walls, lights, postprocessing effects. Never changes. Do not touch.

**CameraController** — handles:
- OrbitControls (pan disabled, rotate disabled, zoom only when `isOperationActive`)
- Keyboard WASD/arrow movement (only when `isOperationActive` and not mid-sequence)
- GSAP camera animation sequences
- Path arrows on the floor
- Panel blinking state (`blinkingIds`)

**PanelGrid** — renders all 47 GLBClone components. Each GLBClone:
- Loads the correct GLB model (A–G) from its `glbKey`
- Scales it to fit a 2×2.5×1m slot
- Has a red overlay plane that blinks via `useFrame` when `isActive` is true

**Key props flowing into ThreePanelViewer:**
```typescript
activePanelIds: number[]   // which panels to blink
sequenceId: number         // increment to trigger new sequence
isOperationActive: boolean // enables movement + zoom
onCameraUpdate: (pos) => void  // called every frame, feeds FloorPlan
onSequenceDone: () => void     // called when sequence finishes
```

---

## OperationModal.tsx — how it works

One component handles both start and complete via the `mode` prop.

It shows:
- Left column: list of operations to pick from (filtered to `진행중` status)
- Middle column: team / supervisor / worker selects (data from `TEAM_DATA` in mockData.ts)
- Right column: confirmation summary

Confirm button is disabled until: team selected + supervisor selected + worker selected + at least one operation selected.

On confirm:
```typescript
onConfirm(selectedItems, worker, team)
```

The parent (Dashboard) receives this and runs `startOperations` or `finishOperations`.

---

## RegisterModal.tsx — how it works

- Department select (from `MOCK_TEAMS`)
- Reason select (from `MOCK_REASONS`)
- Panel picker: QR scan button (opens camera) or Search button (shows filterable table of all 47 panels)
- Selected panels shown as tags
- On submit: calls `registerOperation()` for each selected unit → calls `onSubmit(created)`

---

## mockData.ts — key exports

```typescript
TEAM_DATA: Record<string, { supervisors: string[]; workers: string[] }>
// 8 teams: 전기팀, 운전팀, 환경팀, 정비팀, 안전팀, 계측팀, 토목팀, 기계팀

MOCK_TEAMS: string[]
// just the team names array

MOCK_KEY_STATUS: KeyStatusItem[]
// 8 items used as fallback when operations list is empty

MOCK_HISTORY: HistoryItem[]
// 12 items used to seed INITIAL_OPERATIONS

MOCK_UNITS: Unit[]
// all 47 panels as simplified unit objects (from panels.ts)
```

---

## panels.ts — the 47 panels

Each panel has:
```typescript
{
  id: number          // 1–47, used as panel ID in 3D positioning
  unitId: string      // e.g. "UNIT-10E"
  name: string        // e.g. "PAF-C"
  glbKey: 'A'|'B'|'C'|'D'|'E'|'F'|'G'  // which 3D model to use
  status: 'normal' | 'warning' | 'alert'
  type: string
  systemCode: string
  systemName: string
  groupCode: string
  groupMcs: string
}
```

Panels 1–24 are on the right row (facing KOEN sign direction).
Panels 25–47 are on the left row. Panel 47 is double-height.

---

## 3D panel layout

```
Left row:   panels 47 → 25  (z = -4.9, facing forward)
Right row:  panels 1  → 24  (z = +4.9, facing backward)
```

Each column is 2 units wide. Panels stack 2 high (floor = y:0, upper = y:2.5). Panel 47 occupies both floors (doubleHeight).

Camera home position: `{ x: -6, y: 4, z: 0 }`, target: `{ x: 40, y: 2.8, z: 0 }`.

---

## What is broken and needs to be fixed

### 1. Start flow not triggering 3D
`OperationModal` calls `onConfirm(selectedItems, worker, team)` correctly, but `Dashboard.startOperations` does not increment `sequenceId`, so `ThreePanelViewer` never receives a new sequence trigger. Fix: make sure `setSequenceId(id => id + 1)` is called inside `startOperations` after `setActivePanels`.

### 2. Complete flow not clearing 3D
`finishOperations` calls `completeOperations` but does not call `clearActivePanels()` or reset `sequencePanelIds`. The 3D panels keep blinking after completion.

### 3. Polling increments sequenceId on every tick
The polling comparison uses a stale reference, so `sequenceId` keeps incrementing even when panels haven't changed, causing repeated 3D sequences. Fix: compare `serialized !== lastSerialized` before incrementing.

### 4. `isOperationActive` never resets
Once set to `true`, it stays true even after operations complete. This leaves keyboard movement permanently enabled. Fix: set `isOperationActive` to `false` inside `handleSequenceDone` or after complete.

---

## Files that should NEVER be modified by AI

- `src/components/dashboard/ThreePanelViewer.tsx` — Room component (lights, walls, floor, ceiling, postprocessing). Only CameraController logic may be touched.
- `src/data/panels.ts` — panel definitions, coordinates depend on this
- `src/types/index.ts` — type changes break everything
- `src/api/operations.ts` — API layer is stable
- `server.js` — backend is working correctly
- Any styling / Tailwind classes anywhere

---

## Files AI is allowed to modify

| File | What to change |
|------|----------------|
| `src/pages/Dashboard.tsx` | `startOperations`, `finishOperations`, polling logic, `handleSequenceDone` |
| `src/components/modals/OperationModal.tsx` | `onConfirm` call signature and confirm button handler |
| `src/components/dashboard/ThreePanelViewer.tsx` | Only `CameraController` useEffect sequence logic |
