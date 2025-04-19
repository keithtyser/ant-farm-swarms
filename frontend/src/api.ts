import io from 'socket.io-client'

const socket = io(import.meta.env.VITE_BACKEND_WS || 'http://localhost:8000')

export { socket }

export async function spawnAgent() {
  await fetch('/api/agents', { method: 'POST', body: JSON.stringify({ action: 'spawn' }) })
}

export async function killAgent() {
  await fetch('/api/agents', { method: 'POST', body: JSON.stringify({ action: 'kill' }) })
}
