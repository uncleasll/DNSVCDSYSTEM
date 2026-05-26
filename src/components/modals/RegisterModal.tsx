import { Info, QrCode, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_TEAMS, MOCK_UNITS } from '../../data/mockData'
import { MOCK_REASONS, nowStamp } from '../../data/operations'
import type { Operation } from '../../types'
import { ModalShell } from './ModalShell'

type Props = {
  onClose: () => void
  onSubmit: (operations: Operation[]) => void
}

const demoQrCells = [
  [1, 1, 1, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 1, 1, 0, 1, 1, 1, 0],
  [1, 0, 1, 0, 1, 0, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 0, 1, 1, 0, 1],
]

export function RegisterModal({ onClose, onSubmit }: Props) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState(MOCK_TEAMS[0])
  const [reason, setReason] = useState(MOCK_REASONS[0])
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(['UNIT-12B'])
  const [scanOpen, setScanOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [detailUnitId, setDetailUnitId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return MOCK_UNITS.slice(0, 10)
    return MOCK_UNITS.filter((unit) => `${unit.unitId} ${unit.name}`.toLowerCase().includes(term)).slice(0, 12)
  }, [query])

  const toggleUnit = (unitId: string) => {
    setSelectedUnitIds((ids) => ids.includes(unitId) ? ids.filter((id) => id !== unitId) : [...ids, unitId])
  }

  const completeQrScan = () => {
    setSelectedUnitIds((ids) => ids.includes('UNIT-12B') ? ids : ['UNIT-12B', ...ids])
    setScanOpen(false)
  }

  const submit = () => {
    const operatedAt = nowStamp()
    onSubmit(selectedUnitIds.map((unitId, index) => {
      const unit = MOCK_UNITS.find((item) => item.unitId === unitId) ?? MOCK_UNITS[0]

      return {
        id: Date.now() + index,
        panelId: unit.id,
        unitId: unit.unitId,
        equipName: unit.name,
        opType: 'KEY CLOSED',
        operator: department,
        department,
        purpose: reason,
        status: '진행중',
        notes: '',
        operatedAt,
      }
    }))
  }

  useEffect(() => {
    if (!scanOpen) return

    let stream: MediaStream | null = null
    setCameraReady(false)
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        stream = mediaStream
        setCameraReady(true)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          void videoRef.current.play()
        }
      })
      .catch(() => setCameraReady(false))

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [scanOpen])

  const detailUnit = detailUnitId ? MOCK_UNITS.find((unit) => unit.unitId === detailUnitId) : null

  return (
    <ModalShell onClose={onClose} className="max-w-lg">
      <form className="overflow-y-auto p-8" onSubmit={(event) => { event.preventDefault(); submit() }}>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">조작 등록</h2>
          <div className="mt-1 text-sm font-semibold text-slate-500">REGISTER</div>
          <div className="mx-auto mt-3 h-px w-72 bg-slate-200" />
        </div>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold">작업 부서 <b className="text-red-500">*</b></span>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-600 outline-none focus:border-blue-500">
            {MOCK_TEAMS.map((team) => <option key={team}>{team}</option>)}
          </select>
        </label>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold">작업요청사유 <b className="text-red-500">*</b></span>
          <select value={reason} onChange={(event) => setReason(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 px-4 text-slate-600 outline-none focus:border-blue-500">
            {MOCK_REASONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div>
          <div className="mb-3 text-sm font-semibold">차단기 선택 <b className="text-red-500">*</b></div>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setScanOpen(true)} className="flex h-12 items-center justify-center gap-2 rounded-lg border border-blue-500 font-semibold text-blue-600">
              <QrCode className="h-5 w-5" />QR 스캔
            </button>
            <button type="button" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-400 font-semibold text-slate-700">
              <Search className="h-5 w-5" />검색
            </button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Unit ID or equipment name..." className="h-12 w-full rounded-lg border border-slate-400 pl-12 pr-4 outline-none focus:border-blue-500" />
          </div>
          <div className="mt-3 max-h-52 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 text-slate-700">
                <tr>{['기기번호', '키상태', '작업상태', '상세'].map((head) => <th key={head} className="px-3 py-2">{head}</th>)}</tr>
              </thead>
              <tbody>
                {matches.map((unit) => (
                  <tr key={unit.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-black">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedUnitIds.includes(unit.unitId)} onChange={() => toggleUnit(unit.unitId)} />
                        {unit.unitId}
                      </label>
                    </td>
                    <td className="px-3 py-2">KEY CLOSED</td>
                    <td className="px-3 py-2">대기</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => setDetailUnitId(unit.unitId)} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-300 px-2 font-bold text-slate-700">
                        <Info className="h-3.5 w-3.5" />상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUnitIds.map((unitId) => <span key={unitId} className="rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">{unitId}</span>)}
          </div>
        </div>
        <button type="submit" disabled={selectedUnitIds.length === 0} className="mt-6 h-12 w-full rounded-lg bg-blue-600 text-lg font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-300">조작 등록</button>
      </form>
      {scanOpen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <b>QR 스캔</b>
              <button type="button" onClick={() => setScanOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="relative aspect-video bg-slate-950">
              <video ref={videoRef} className={`h-full w-full object-cover ${cameraReady ? 'block' : 'hidden'}`} muted playsInline />
              {!cameraReady && (
                <div className="flex h-full items-center justify-center">
                  <div className="grid grid-cols-9 gap-1 rounded-xl bg-white p-4">
                    {demoQrCells.flatMap((row, rowIndex) => row.map((cell, colIndex) => (
                      <span key={`${rowIndex}-${colIndex}`} className={`h-3 w-3 ${cell ? 'bg-slate-950' : 'bg-white'}`} />
                    )))}
                  </div>
                </div>
              )}
              <div className="absolute inset-8 rounded-lg border-2 border-blue-400" />
            </div>
            <div className="space-y-3 p-4">
              <p className="text-sm font-semibold text-slate-600">QR 코드를 스캔하세요. 데모 스캔은 UNIT-12B를 선택합니다.</p>
              <button type="button" onClick={completeQrScan} className="h-11 w-full rounded-lg bg-blue-600 font-bold text-white hover:bg-blue-700">데모 스캔 완료</button>
            </div>
          </div>
        </div>
      )}
      {detailUnit && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 p-6">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">상세 정보</h3>
              <button type="button" onClick={() => setDetailUnitId(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">기기번호</span><b>{detailUnit.unitId}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">설비명</span><b className="text-right">{detailUnit.name}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">키상태</span><b>KEY CLOSED</b></div>
              <div className="flex justify-between"><span className="text-slate-500">작업상태</span><b>대기</b></div>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  )
}
