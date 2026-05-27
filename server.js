import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { createServer as createViteServer } from 'vite'

const PORT = 8000
const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const STATE_FILE = path.join(ROOT, 'panels-state.json')

let activePanels = loadState()
let opNextId = 16
let operations = [
  { id: 1, panelId: 3, unitId: 'UNIT-02A', panelName: 'PC TR UNIT-B', opType: 'KEY CLOSED', operator: '김철수', department: '전기팀', purpose: '정기 점검 후 복전', status: '완료', notes: '', operatedAt: '2026-05-15T09:10:00' },
  { id: 2, panelId: 12, unitId: 'UNIT-06B', panelName: 'VERTICAL MILL D', opType: 'KEY OPEN', operator: '이영희', department: '운전팀', purpose: '모터 교체 작업', status: '완료', notes: '작업완료 확인', operatedAt: '2026-05-15T11:30:00' },
  { id: 3, panelId: 24, unitId: 'UNIT-10F', panelName: 'PAF-D', opType: 'KEY ALERT', operator: '박민준', department: '전기팀', purpose: '절연 시험', status: '완료', notes: '합격', operatedAt: '2026-05-16T08:00:00' },
  { id: 4, panelId: 43, unitId: 'COM-18B', panelName: 'FGD', opType: 'KEY CLOSED', operator: '최지수', department: '환경팀', purpose: '설비 재가동', status: '완료', notes: '', operatedAt: '2026-05-16T13:45:00' },
  { id: 5, panelId: 7, unitId: 'UNIT-04A', panelName: 'BFP-A', opType: 'KEY OPEN', operator: '정현우', department: '운전팀', purpose: '배관 보수', status: '완료', notes: '밸브 교체 포함', operatedAt: '2026-05-17T07:20:00' },
  { id: 6, panelId: 15, unitId: 'UNIT-08A', panelName: 'COP-A', opType: 'KEY ALERT', operator: '김철수', department: '전기팀', purpose: '예방 정비', status: '완료', notes: '', operatedAt: '2026-05-17T10:00:00' },
  { id: 7, panelId: 29, unitId: 'UNIT-11B', panelName: 'HGRF', opType: 'KEY CLOSED', operator: '윤서연', department: '전기팀', purpose: '복전 조작', status: '완료', notes: '', operatedAt: '2026-05-18T08:30:00' },
  { id: 8, panelId: 35, unitId: 'COM-14B', panelName: 'ASP-B', opType: 'KEY OPEN', operator: '이영희', department: '운전팀', purpose: '필터 청소', status: '완료', notes: '', operatedAt: '2026-05-18T14:00:00' },
  { id: 9, panelId: 9, unitId: 'UNIT-05A', panelName: 'VERTICAL MILL A', opType: 'KEY ALERT', operator: '박민준', department: '전기팀', purpose: '절연저항 측정', status: '실패', notes: '재시험 필요', operatedAt: '2026-05-18T16:30:00' },
  { id: 10, panelId: 21, unitId: 'UNIT-10C', panelName: 'PAF-A', opType: 'KEY CLOSED', operator: '최지수', department: '환경팀', purpose: '정기 복전', status: '완료', notes: '', operatedAt: '2026-05-19T08:00:00' },
  { id: 11, panelId: 5, unitId: 'UNIT-03A', panelName: 'IDF-B', opType: 'KEY OPEN', operator: '정현우', department: '운전팀', purpose: '임펠러 교체', status: '진행중', notes: '작업 중', operatedAt: '2026-05-19T09:30:00' },
  { id: 12, panelId: 39, unitId: 'COM-16B', panelName: 'PC TR COM-A', opType: 'KEY ALERT', operator: '김철수', department: '전기팀', purpose: 'TR 부하 시험', status: '완료', notes: '정상', operatedAt: '2026-05-19T10:15:00' },
  { id: 13, panelId: 14, unitId: 'UNIT-07B', panelName: 'STAGE 2 HAMMER MILL', opType: 'KEY CLOSED', operator: '윤서연', department: '전기팀', purpose: '수리 후 복전', status: '완료', notes: '', operatedAt: '2026-05-19T11:00:00' },
  { id: 14, panelId: 47, unitId: 'COM-20B', panelName: 'START-UP TR INCOMING', opType: 'KEY OPEN', operator: '이영희', department: '운전팀', purpose: 'TR 점검', status: '진행중', notes: '', operatedAt: '2026-05-19T13:00:00' },
  { id: 15, panelId: 31, unitId: 'UNIT-12B', panelName: 'ASP-A', opType: 'KEY ALERT', operator: '박민준', department: '전기팀', purpose: '절연 시험', status: '진행중', notes: '', operatedAt: '2026-05-19T14:30:00' },
]

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveState(panels) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(panels), 'utf-8')
  } catch {
    // Best effort, matching the reference workflow.
  }
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => { raw += chunk })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function toPanel(item) {
  const id = Number(item?.id)
  if (Number.isNaN(id) || id < 1 || id > 48) return null
  return { id, status: String(item.status ?? ''), description: String(item.description ?? '') }
}

async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, {})
    return true
  }

  if (url.pathname === '/api/active-panels' && req.method === 'GET') {
    sendJson(res, 200, { panels: activePanels })
    return true
  }

  if (url.pathname === '/api/active-panels' && req.method === 'POST') {
    const body = await readBody(req)
    if (Array.isArray(body)) {
      activePanels = body.map(toPanel).filter(Boolean)
    } else {
      const panel = toPanel(body)
      activePanels = panel ? [panel] : []
    }
    saveState(activePanels)
    sendJson(res, 200, { status: 'success', panels: activePanels })
    return true
  }

  if (url.pathname === '/api/active-panels' && req.method === 'DELETE') {
    activePanels = []
    saveState([])
    sendJson(res, 200, { status: 'success', panels: [] })
    return true
  }

  if (url.pathname === '/api/operations' && req.method === 'GET') {
    let result = [...operations]
    const panelId = url.searchParams.get('panelId')
    const status = url.searchParams.get('status')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    if (panelId) result = result.filter((operation) => operation.panelId === Number(panelId))
    if (status) result = result.filter((operation) => operation.status === status)
    if (from) result = result.filter((operation) => operation.operatedAt >= from)
    if (to) result = result.filter((operation) => operation.operatedAt <= `${to}T23:59:59`)
    sendJson(res, 200, { operations: result.sort((a, b) => b.operatedAt.localeCompare(a.operatedAt)) })
    return true
  }

  if (url.pathname === '/api/operations' && req.method === 'POST') {
    const body = await readBody(req)
    if (!body.panelId || !body.unitId || !body.opType || !body.operator) {
      sendJson(res, 400, { error: '필수 항목 누락' })
      return true
    }
    const operation = {
      id: opNextId++,
      panelId: Number(body.panelId),
      unitId: String(body.unitId),
      panelName: String(body.panelName ?? ''),
      opType: body.opType,
      operator: String(body.operator),
      department: String(body.department ?? ''),
      purpose: String(body.purpose ?? ''),
      status: '진행중',
      notes: String(body.notes ?? ''),
      operatedAt: new Date().toISOString().slice(0, 19),
    }
    operations.push(operation)
    sendJson(res, 200, { status: 'success', operation })
    return true
  }

  if (url.pathname === '/api/operations/complete' && req.method === 'PATCH') {
    const body = await readBody(req)
    if (!Array.isArray(body.ids)) {
      sendJson(res, 400, { error: 'ids 배열 필요' })
      return true
    }
    body.ids.forEach((id) => {
      const operation = operations.find((item) => item.id === id)
      if (operation) operation.status = '완료'
    })
    sendJson(res, 200, { status: 'success', completed: body.ids.length })
    return true
  }

  return false
}

function servePublic(req, res, url) {
  const decodedPath = decodeURIComponent(url.pathname)
  const filePath = path.join(PUBLIC_DIR, decodedPath)
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false
  }
  fs.createReadStream(filePath).pipe(res)
  return true
}

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  if (await handleApi(req, res, url)) return
  if (servePublic(req, res, url)) return
  vite.middlewares(req, res, () => {
    res.statusCode = 404
    res.end('Not found')
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
