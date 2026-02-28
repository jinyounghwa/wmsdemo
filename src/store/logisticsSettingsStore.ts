import { create } from 'zustand'

export type ShipperIntegration = 'required' | 'completed'

export interface LogisticsWarehouse {
  id: string
  name: string
  code: string
  address: string
  manager: string
  phone: string
}

export interface LogisticsUser {
  id: string
  name: string
  phone: string
  email: string
  userType: string
  userCode: string
  roleName: string
  joinedAt: string
}

export interface LogisticsShipper {
  id: string
  name: string
  domain: string
  manager: string
  email: string
  phone: string
  integration: ShipperIntegration
  createdAt: string
}

export interface LogisticsCarrier {
  id: string
  type: 'parcel' | 'same-day' | 'overseas' | 'other'
  name: string
  managerName: string
  carrierCode: string
  manager: string
  phone: string
  note?: string
}

export interface LogisticsRole {
  id: string
  name: string
  locked?: boolean
  pagePermissions: string[]
  featurePermissions: string[]
}

interface LogisticsSettingsStore {
  warehouses: LogisticsWarehouse[]
  users: LogisticsUser[]
  shippers: LogisticsShipper[]
  carriers: LogisticsCarrier[]
  roles: LogisticsRole[]
  requestShipperIntegration: (id: string) => void
  syncShipper: (id: string) => void
}

export const useLogisticsSettingsStore = create<LogisticsSettingsStore>((set) => ({
  warehouses: [
    { id: 'WH-L-1', name: '승승창고', code: 'WHS-SG-01', address: '경기도 고양시 물류로 21', manager: '김수빈', phone: '010-1111-2222' },
    { id: 'WH-L-2', name: '기본 창고', code: 'WHS-BASE-01', address: '경기도 파주시 창고길 100', manager: '박현우', phone: '010-3333-4444' },
  ],
  users: [
    { id: 'U-1', name: '김수빈', phone: '010-1111-2222', email: 'sbkim@onedns.co.kr', userType: '물류사', userCode: 'LG001', roleName: '최고 권한', joinedAt: '2025-10-15' },
    { id: 'U-2', name: '박현우', phone: '010-3333-4444', email: 'hwpark@onedns.co.kr', userType: '물류사', userCode: 'LG002', roleName: '최고 권한', joinedAt: '2025-09-02' },
    { id: 'U-3', name: '셀메이트개발', phone: '010-5555-1111', email: 'dev@sellmate.co.kr', userType: '파트너', userCode: 'LG003', roleName: '최고 권한', joinedAt: '2025-05-29' },
    { id: 'U-4', name: '윤의원', phone: '010-7777-1111', email: 'ewyun@onedns.co.kr', userType: '물류사', userCode: 'LG004', roleName: '최고 권한', joinedAt: '2025-09-24' },
    { id: 'U-5', name: '하수철', phone: '010-8888-1111', email: 'scha@onedns.co.kr', userType: '물류사', userCode: 'LG005', roleName: '최고 권한', joinedAt: '2025-09-01' },
  ],
  shippers: [
    { id: 'S-1', name: '원차일드', domain: 'onechild_onedns', manager: '장유진', email: 'owner@onechild.kr', phone: '010-1234-5678', integration: 'required', createdAt: '2025-12-01' },
    { id: 'S-2', name: 'onedns_test', domain: 'onedns_test', manager: '이현지', email: 'test@onedns.co.kr', phone: '010-2234-5678', integration: 'completed', createdAt: '2025-11-20' },
    { id: 'S-3', name: '테스트', domain: 'api_test', manager: '박지훈', email: 'api@test.com', phone: '010-3234-5678', integration: 'required', createdAt: '2025-11-12' },
    { id: 'S-4', name: '안나앤모드', domain: 'annanmode', manager: '정다은', email: 'ops@annanmode.com', phone: '010-4234-5678', integration: 'required', createdAt: '2025-10-28' },
  ],
  carriers: [
    { id: 'C-1', type: 'parcel', name: 'CJ대한통운', managerName: 'CJ 관리자', carrierCode: 'CJ', manager: '송민수', phone: '02-111-0001', note: '기본 택배사' },
    { id: 'C-2', type: 'same-day', name: '오늘의픽업', managerName: '오늘의픽업 관리자', carrierCode: 'TODAY', manager: '최수연', phone: '02-111-0002', note: '기본 당일 배송' },
    { id: 'C-3', type: 'overseas', name: '화물', managerName: '화물 관리자', carrierCode: 'CARGO', manager: '유상민', phone: '02-111-0003', note: '기본 화물' },
    { id: 'C-4', type: 'other', name: '퀵배송', managerName: '퀵배송 관리자', carrierCode: 'QUICK', manager: '서지훈', phone: '02-111-0004', note: '기본 퀵배송' },
  ],
  roles: [
    {
      id: 'R-1',
      name: '최고 권한',
      locked: true,
      pagePermissions: ['재고', '입고', '출고', '이동', '반출', '반품', '재고 조정', '창고 설정', '물류사 설정', '모바일 설정'],
      featurePermissions: ['사용자', '설정', '지시', '파일 다운로드', '삭제', '취소', '승인'],
    },
  ],
  requestShipperIntegration: (id) =>
    set((state) => ({
      shippers: state.shippers.map((shipper) => (shipper.id === id ? { ...shipper, integration: 'required' } : shipper)),
    })),
  syncShipper: (id) =>
    set((state) => ({
      shippers: state.shippers.map((shipper) => (shipper.id === id ? { ...shipper, integration: 'completed' } : shipper)),
    })),
}))
