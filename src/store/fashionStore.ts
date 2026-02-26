import { create } from 'zustand'

export type AssortmentMode = 'prepack' | 'explode'

export interface AssortmentPack {
  id: string
  name: string
  styleCode: string
  color: string
  seasonCode: string
  ratio: Array<{ size: string; qty: number }>
  barcode: string
  onHandSets: number
  storageFlow: 'goh' | 'flat'
}

interface FashionStore {
  assortments: AssortmentPack[]
  allocateAssortment: (id: string, sets: number) => boolean
  releaseAssortment: (id: string, sets: number) => void
}

export const useFashionStore = create<FashionStore>((set, get) => ({
  assortments: [
    {
      id: 'ASST-TSU001-BLK',
      name: '베이직 반팔 티셔츠 프리팩',
      styleCode: 'TS-U-001',
      color: 'BLACK',
      seasonCode: 'SS25',
      ratio: [
        { size: 'S', qty: 1 },
        { size: 'M', qty: 2 },
        { size: 'L', qty: 1 },
      ],
      barcode: 'PP-TSU001-BLK-01',
      onHandSets: 84,
      storageFlow: 'flat',
    },
    {
      id: 'ASST-JKWM101-NAVY',
      name: '여성 재킷 프리팩',
      styleCode: 'JK-WM-101',
      color: 'NAVY',
      seasonCode: 'FW25',
      ratio: [
        { size: 'S', qty: 1 },
        { size: 'M', qty: 2 },
        { size: 'L', qty: 1 },
      ],
      barcode: 'PP-JKWM101-NAVY-01',
      onHandSets: 26,
      storageFlow: 'goh',
    },
  ],
  allocateAssortment: (id, sets) => {
    const target = get().assortments.find((row) => row.id === id)
    if (!target || sets <= 0 || target.onHandSets < sets) return false
    set((state) => ({
      assortments: state.assortments.map((row) =>
        row.id === id ? { ...row, onHandSets: row.onHandSets - sets } : row,
      ),
    }))
    return true
  },
  releaseAssortment: (id, sets) => {
    if (sets <= 0) return
    set((state) => ({
      assortments: state.assortments.map((row) =>
        row.id === id ? { ...row, onHandSets: row.onHandSets + sets } : row,
      ),
    }))
  },
}))
