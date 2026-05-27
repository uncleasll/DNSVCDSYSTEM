import type { Operation } from '../types'

export interface ActivePanel {
  id: number
  status: string
  description: string
}

export async function fetchOperations(status?: string) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const response = await fetch(`/api/operations${params.size ? `?${params.toString()}` : ''}`)
  const data = await response.json()
  return (data.operations ?? []).map(normalizeOperation) as Operation[]
}

export async function registerOperation(operation: Omit<Operation, 'id' | 'status' | 'operatedAt'>) {
  const response = await fetch('/api/operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operation),
  })
  const data = await response.json()
  return normalizeOperation(data.operation) as Operation
}

function normalizeOperation(operation: Operation) {
  return {
    ...operation,
    equipName: operation.equipName || operation.panelName || '',
  }
}

export async function completeOperations(ids: number[]) {
  await fetch('/api/operations/complete', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
}

export async function setActivePanels(panels: ActivePanel[]) {
  await fetch('/api/active-panels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(panels),
  })
}

export async function clearActivePanels() {
  await fetch('/api/active-panels', { method: 'DELETE' })
}
