import { create } from 'zustand'

export type PackageStatus = 'packing' | 'packed' | 'staged' | 'loaded' | 'closed'

export interface PackageTask {
  id: string
  orderId: string
  customer: string
  boxType: 'S' | 'M' | 'L' | 'XL'
  scanCount: number
  expectedScanCount: number
  carrier: string
  trackingNo: string
  dock: string
  route: string
  vehicleNo: string
  status: PackageStatus
  createdAt: string
}

interface PackingStore {
  packages: PackageTask[]
  createPackage: (payload: Omit<PackageTask, 'id' | 'status' | 'scanCount' | 'createdAt'>) => void
  increaseScanCount: (id: string) => void
  updatePackage: (id: string, payload: Partial<PackageTask>) => void
  updateStatus: (id: string, status: PackageStatus) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const usePackingStore = create<PackingStore>((set) => ({
  packages: [],
  createPackage: (payload) =>
    set((state) => ({
      packages: [
        {
          ...payload,
          id: `PK-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          scanCount: 0,
          status: 'packing',
          createdAt: today(),
        },
        ...state.packages,
      ],
    })),
  increaseScanCount: (id) =>
    set((state) => ({
      packages: state.packages.map((pkg) =>
        pkg.id === id
          ? { ...pkg, scanCount: Math.min(pkg.expectedScanCount, pkg.scanCount + 1) }
          : pkg,
      ),
    })),
  updatePackage: (id, payload) =>
    set((state) => ({
      packages: state.packages.map((pkg) => (pkg.id === id ? { ...pkg, ...payload } : pkg)),
    })),
  updateStatus: (id, status) =>
    set((state) => ({
      packages: state.packages.map((pkg) => (pkg.id === id ? { ...pkg, status } : pkg)),
    })),
}))
