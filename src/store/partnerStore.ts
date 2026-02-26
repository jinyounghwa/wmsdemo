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
  vendors: ['삼성전자', 'LG전자', '현대모비스', '풀무원', '나이키코리아', '아모레퍼시픽', '오뚜기', 'SK하이닉스', '애플코리아', '다이슨'],
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
