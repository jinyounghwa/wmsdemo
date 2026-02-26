import { create } from 'zustand'

export interface WaveBatch {
  id: string
  name: string
  orderIds: string[]
  createdAt: string
  status: 'open' | 'closed'
}

interface WaveStore {
  waves: WaveBatch[]
  createWave: (orderIds: string[]) => WaveBatch
  closeWave: (id: string) => void
}

export const useWaveStore = create<WaveStore>((set) => ({
  waves: [],
  createWave: (orderIds) => {
    const wave: WaveBatch = {
      id: `WV-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `Wave ${new Date().toISOString().slice(5, 10)}-${Math.floor(Math.random() * 900 + 100)}`,
      orderIds,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'open',
    }
    set((state) => ({ waves: [wave, ...state.waves] }))
    return wave
  },
  closeWave: (id) =>
    set((state) => ({
      waves: state.waves.map((wave) => (wave.id === id ? { ...wave, status: 'closed' } : wave)),
    })),
}))
