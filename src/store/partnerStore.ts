import { create } from 'zustand'

interface PartnerStore {
  vendors: string[]
  customers: string[]
  carriers: string[]
  addVendor: (name: string) => void
  addCustomer: (name: string) => void
  addCarrier: (name: string) => void
}

const normalize = (name: string) => name.trim()

export const usePartnerStore = create<PartnerStore>((set) => ({
  vendors: ['무신사 스탠다드', '탑텐', '스파오', '에잇세컨즈', '나이키코리아', '리바이스', '빈폴ACC', '노스페이스', '뉴발란스', '신세계인터내셔날'],
  customers: ['쿠팡', '11번가', '네이버쇼핑', 'SSG닷컴', '무신사', '컬리', '롯데온', '티몬'],
  carriers: ['CJ대한통운', '한진택배', '롯데택배', '우체국택배', '로젠택배'],
  addVendor: (name) =>
    set((state) => {
      const normalized = normalize(name)
      if (!normalized || state.vendors.includes(normalized)) return {}
      return { vendors: [...state.vendors, normalized] }
    }),
  addCustomer: (name) =>
    set((state) => {
      const normalized = normalize(name)
      if (!normalized || state.customers.includes(normalized)) return {}
      return { customers: [...state.customers, normalized] }
    }),
  addCarrier: (name) =>
    set((state) => {
      const normalized = normalize(name)
      if (!normalized || state.carriers.includes(normalized)) return {}
      return { carriers: [...state.carriers, normalized] }
    }),
}))
