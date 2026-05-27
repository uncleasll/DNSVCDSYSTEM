import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";

const STATE_FILE = path.join(process.cwd(), "panels-state.json");

interface ActivePanel {
  id: number;
  status: string;
  description: string;
}

function loadState(): ActivePanel[] {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveState(panels: ActivePanel[]) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(panels), "utf-8");
  } catch {}
}

async function startServer() {
  const app = express();
  const PORT = 8000;

  app.use(cors());
  app.use(express.json());

  // 정적 파일 서빙 최우선 (public 폴더)
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  // .glb 파일 요청에 대해 HTML로 리다이렉트되지 않도록 명시적 처리
  app.get("/*.glb", (req, res) => {
    // 쿼리 스트링(?v=...) 제거
    const purePath = req.path.split('?')[0];
    const fileName = purePath.startsWith('/') ? purePath.substring(1) : purePath;
    const filePath = path.join(publicPath, fileName);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      console.error(`[ERROR] GLB Not Found: ${filePath} (Original path: ${req.path})`);
      res.status(404).send("Model not found");
    }
  });

  let activePanels: ActivePanel[] = loadState();

  app.get("/api/active-panels", (req, res) => {
    res.json({ panels: activePanels });
  });

  app.get("/api/operations", (req, res) => {
    const { panelId, status, from, to } = req.query as Record<string, string>;
    let result = [...operations];
    if (panelId) result = result.filter(o => o.panelId === Number(panelId));
    if (status) result = result.filter(o => o.status === status);
    if (from) result = result.filter(o => o.operatedAt >= from);
    if (to) result = result.filter(o => o.operatedAt <= to + 'T23:59:59');
    res.json({ operations: result.sort((a, b) => b.operatedAt.localeCompare(a.operatedAt)) });
  });

  app.post("/api/operations", (req, res) => {
    const b = req.body;
    if (!b.panelId || !b.unitId || !b.opType || !b.operator) {
      res.status(400).json({ error: '필수 항목 누락' }); return;
    }
    const op: Operation = {
      id: opNextId++,
      panelId: Number(b.panelId),
      unitId: String(b.unitId),
      panelName: String(b.panelName ?? ''),
      opType: b.opType,
      operator: String(b.operator),
      department: String(b.department ?? ''),
      purpose: String(b.purpose ?? ''),
      status: '진행중',
      notes: String(b.notes ?? ''),
      operatedAt: new Date().toISOString().slice(0, 19),
    };
    operations.push(op);
    console.log('New operation:', op);
    res.json({ status: 'success', operation: op });
  });

  // PATCH /api/operations/complete — { ids: number[] } 일괄 완료 처리
  app.patch("/api/operations/complete", (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) { res.status(400).json({ error: 'ids 배열 필요' }); return; }
    ids.forEach((id: number) => {
      const op = operations.find(o => o.id === id);
      if (op) op.status = '완료';
    });
    res.json({ status: 'success', completed: ids.length });
  });

  // POST body: { id, description } 또는 [{ id, description }, ...]
  app.post("/api/active-panels", (req, res) => {
    const body = req.body;
    const toPanel = (item: any): ActivePanel | null => {
      const id = Number(item.id);
      if (isNaN(id) || id < 1 || id > 48) return null;
      return { id, status: String(item.status ?? ''), description: String(item.description ?? '') };
    };

    if (Array.isArray(body)) {
      activePanels = body.map(toPanel).filter((p): p is ActivePanel => p !== null);
    } else if (body && typeof body === 'object') {
      const panel = toPanel(body);
      activePanels = panel ? [panel] : [];
    } else {
      res.status(400).json({ status: "error", message: "Body must be { id, description } or array of those." });
      return;
    }

    saveState(activePanels);
    console.log("Updated active panels:", activePanels);
    res.json({ status: "success", panels: activePanels });
  });

  app.delete("/api/active-panels", (req, res) => {
    activePanels = [];
    saveState([]);
    res.json({ status: "success", panels: [] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// ─── MSSQL 기준 스키마 (참고용) ─────────────────────────────────
// CREATE TABLE VCD_Operations (
//   Id         INT IDENTITY(1,1) PRIMARY KEY,
//   PanelId    INT NOT NULL,
//   UnitId     NVARCHAR(20) NOT NULL,
//   PanelName  NVARCHAR(100) NOT NULL,
//   OpType     NVARCHAR(20) NOT NULL,   -- KEY CLOSED / KEY OPEN / KEY ALERT
//   Operator   NVARCHAR(50) NOT NULL,
//   Department NVARCHAR(50) NOT NULL,
//   Purpose    NVARCHAR(200),
//   Status     NVARCHAR(20) NOT NULL,   -- 완료 / 진행중 / 실패
//   Notes      NVARCHAR(500),
//   OperatedAt DATETIME2 NOT NULL,
//   CreatedAt  DATETIME2 NOT NULL DEFAULT SYSDATETIME()
// );
// ────────────────────────────────────────────────────────────────

interface Operation {
  id: number;
  panelId: number;
  unitId: string;
  panelName: string;
  opType: 'KEY CLOSED' | 'KEY OPEN' | 'KEY ALERT';
  operator: string;
  department: string;
  purpose: string;
  status: '완료' | '진행중' | '실패';
  notes: string;
  operatedAt: string;
}

let operations: Operation[] = [
  { id:1,  panelId:3,  unitId:'UNIT-02A', panelName:'PC TR UNIT-B',            opType:'KEY CLOSED', operator:'김철수', department:'전기팀',   purpose:'정기 점검 후 복전', status:'완료',   notes:'',             operatedAt:'2026-05-15T09:10:00' },
  { id:2,  panelId:12, unitId:'UNIT-06B', panelName:'VERTICAL MILL D',         opType:'KEY OPEN', operator:'이영희', department:'운전팀',   purpose:'모터 교체 작업',   status:'완료',   notes:'작업완료 확인', operatedAt:'2026-05-15T11:30:00' },
  { id:3,  panelId:24, unitId:'UNIT-10F', panelName:'PAF-D',                   opType:'KEY ALERT', operator:'박민준', department:'전기팀',   purpose:'절연 시험',        status:'완료',   notes:'합격',          operatedAt:'2026-05-16T08:00:00' },
  { id:4,  panelId:43, unitId:'COM-18B', panelName:'FGD',                      opType:'KEY CLOSED', operator:'최지수', department:'환경팀',   purpose:'설비 재가동',       status:'완료',   notes:'',             operatedAt:'2026-05-16T13:45:00' },
  { id:5,  panelId:7,  unitId:'UNIT-04A', panelName:'BFP-A',                   opType:'KEY OPEN', operator:'정현우', department:'운전팀',   purpose:'배관 보수',         status:'완료',   notes:'밸브 교체 포함', operatedAt:'2026-05-17T07:20:00' },
  { id:6,  panelId:15, unitId:'UNIT-08A', panelName:'COP-A',                   opType:'KEY ALERT', operator:'김철수', department:'전기팀',   purpose:'예방 정비',         status:'완료',   notes:'',             operatedAt:'2026-05-17T10:00:00' },
  { id:7,  panelId:29, unitId:'UNIT-11B', panelName:'HGRF',                    opType:'KEY CLOSED', operator:'윤서연', department:'전기팀',   purpose:'복전 조작',         status:'완료',   notes:'',             operatedAt:'2026-05-18T08:30:00' },
  { id:8,  panelId:35, unitId:'COM-14B', panelName:'ASP-B',                    opType:'KEY OPEN', operator:'이영희', department:'운전팀',   purpose:'필터 청소',         status:'완료',   notes:'',             operatedAt:'2026-05-18T14:00:00' },
  { id:9,  panelId:9,  unitId:'UNIT-05A', panelName:'VERTICAL MILL A',         opType:'KEY ALERT', operator:'박민준', department:'전기팀',   purpose:'절연저항 측정',     status:'실패',   notes:'재시험 필요',    operatedAt:'2026-05-18T16:30:00' },
  { id:10, panelId:21, unitId:'UNIT-10C', panelName:'PAF-A',                   opType:'KEY CLOSED', operator:'최지수', department:'환경팀',   purpose:'정기 복전',         status:'완료',   notes:'',             operatedAt:'2026-05-19T08:00:00' },
  { id:11, panelId:5,  unitId:'UNIT-03A', panelName:'IDF-B',                   opType:'KEY OPEN', operator:'정현우', department:'운전팀',   purpose:'임펠러 교체',        status:'진행중', notes:'작업 중',       operatedAt:'2026-05-19T09:30:00' },
  { id:12, panelId:39, unitId:'COM-16B', panelName:'PC TR COM-A',              opType:'KEY ALERT', operator:'김철수', department:'전기팀',   purpose:'TR 부하 시험',       status:'완료',   notes:'정상',          operatedAt:'2026-05-19T10:15:00' },
  { id:13, panelId:14, unitId:'UNIT-07B', panelName:'STAGE 2 HAMMER MILL',     opType:'KEY CLOSED', operator:'윤서연', department:'전기팀',   purpose:'수리 후 복전',       status:'완료',   notes:'',             operatedAt:'2026-05-19T11:00:00' },
  { id:14, panelId:47, unitId:'COM-20B', panelName:'START-UP TR INCOMING',     opType:'KEY OPEN', operator:'이영희', department:'운전팀',   purpose:'TR 점검',           status:'진행중', notes:'',             operatedAt:'2026-05-19T13:00:00' },
  { id:15, panelId:31, unitId:'UNIT-12B', panelName:'ASP-A',                   opType:'KEY ALERT', operator:'박민준', department:'전기팀',   purpose:'절연 시험',         status:'진행중', notes:'',             operatedAt:'2026-05-19T14:30:00' },
];
let opNextId = 16;

startServer();
