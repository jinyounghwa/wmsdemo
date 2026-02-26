export interface InventoryItem {
  sku: string
  name: string
  category: string
  zone: string
  rack: string
  bin: string
  currentQty: number
  safetyQty: number
  status: 'normal' | 'low' | 'excess' | 'defect'
  lastMovedAt: string
  styleCode?: string
  color?: string
  size?: string
  seasonCode?: string
  collection?: string
  storageType?: 'hanger' | 'shelf' | 'flat'
}

export const mockInventoryItems: InventoryItem[] = [
  { sku: 'SKU-0001', name: '갤럭시 버즈', category: '전자부품', zone: 'A', rack: '01', bin: '02', currentQty: 40, safetyQty: 50, status: 'low', lastMovedAt: '2026-02-26' },
  { sku: 'SKU-0002', name: '무선충전기', category: '전자부품', zone: 'A', rack: '01', bin: '03', currentQty: 120, safetyQty: 30, status: 'excess', lastMovedAt: '2026-02-25' },
  { sku: 'SKU-0003', name: 'OLED TV 65인치', category: '전자부품', zone: 'A', rack: '06', bin: '01', currentQty: 17, safetyQty: 10, status: 'normal', lastMovedAt: '2026-02-22' },
  { sku: 'SKU-0010', name: '자동차 배터리', category: '자동차부품', zone: 'B', rack: '01', bin: '01', currentQty: 198, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24' },
  { sku: 'SKU-0020', name: '두부 세트', category: '식품', zone: 'D', rack: '03', bin: '01', currentQty: 450, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-26' },
  { sku: 'SKU-0021', name: '콩나물', category: '식품', zone: 'D', rack: '03', bin: '02', currentQty: 270, safetyQty: 150, status: 'normal', lastMovedAt: '2026-02-26' },
  { sku: 'SKU-0030', name: '에어맥스 270', category: '의류/신발', zone: 'B', rack: '03', bin: '04', currentQty: 130, safetyQty: 60, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'SNKR-270', color: 'WHITE', size: '270', seasonCode: 'SS25', collection: 'PERFORMANCE', storageType: 'shelf' },
  { sku: 'SKU-0031', name: '에어포스1', category: '의류/신발', zone: 'B', rack: '03', bin: '05', currentQty: 85, safetyQty: 60, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'AF-001', color: 'BLACK', size: '275', seasonCode: 'FW25', collection: 'URBAN', storageType: 'shelf' },
  { sku: 'SKU-0040', name: '설화수 윤조에센스', category: '생활용품', zone: 'C', rack: '02', bin: '01', currentQty: 55, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-25' },
  { sku: 'SKU-0050', name: '3분 카레', category: '식품', zone: 'D', rack: '01', bin: '01', currentQty: 900, safetyQty: 300, status: 'normal', lastMovedAt: '2026-02-25' },
  { sku: 'SKU-0051', name: '진라면', category: '식품', zone: 'D', rack: '01', bin: '02', currentQty: 700, safetyQty: 400, status: 'normal', lastMovedAt: '2026-02-25' },
  { sku: 'SKU-0060', name: 'DDR5 메모리', category: '전자부품', zone: 'A', rack: '05', bin: '03', currentQty: 450, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-24' },
  { sku: 'SKU-0070', name: '아이스크림 박스', category: '식품', zone: 'D', rack: '04', bin: '01', currentQty: 180, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24' },
  { sku: 'SKU-0080', name: '태양광 패널', category: '전자부품', zone: 'C', rack: '05', bin: '01', currentQty: 30, safetyQty: 15, status: 'normal', lastMovedAt: '2026-02-20' },
  { sku: 'SKU-0090', name: '정수기 필터', category: '생활용품', zone: 'B', rack: '04', bin: '02', currentQty: 265, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24' },
  { sku: 'SKU-0100', name: '청소기 V15', category: '전자부품', zone: 'C', rack: '01', bin: '02', currentQty: 35, safetyQty: 20, status: 'normal', lastMovedAt: '2026-02-20' },
  { sku: 'SKU-0110', name: '노브랜드 생수', category: '식품', zone: 'D', rack: '05', bin: '01', currentQty: 5, safetyQty: 500, status: 'low', lastMovedAt: '2026-02-18' },
  { sku: 'SKU-0120', name: '여성 재킷', category: '의류/신발', zone: 'C', rack: '03', bin: '01', currentQty: 47, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'JK-WM-101', color: 'NAVY', size: 'M', seasonCode: 'FW25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0130', name: '선물세트 A', category: '생활용품', zone: 'C', rack: '04', bin: '01', currentQty: 100, safetyQty: 50, status: 'normal', lastMovedAt: '2026-02-26' },
  { sku: 'SKU-0131', name: '선물세트 B', category: '생활용품', zone: 'C', rack: '04', bin: '02', currentQty: 80, safetyQty: 50, status: 'normal', lastMovedAt: '2026-02-26' },
  { sku: 'SKU-0140', name: '햇반', category: '식품', zone: 'D', rack: '02', bin: '03', currentQty: 1300, safetyQty: 500, status: 'normal', lastMovedAt: '2026-02-23' },
  { sku: 'SKU-0150', name: '990v5', category: '의류/신발', zone: 'B', rack: '05', bin: '03', currentQty: 78, safetyQty: 40, status: 'normal', lastMovedAt: '2026-02-20', styleCode: 'NB-990V5', color: 'GRAY', size: '260', seasonCode: 'SS25', collection: 'RUNNING', storageType: 'shelf' },
  { sku: 'SKU-0160', name: 'AirPods Pro', category: '전자부품', zone: 'A', rack: '02', bin: '04', currentQty: 175, safetyQty: 80, status: 'normal', lastMovedAt: '2026-02-24' },
  { sku: 'SKU-0170', name: '참이슬 박스', category: '식품', zone: 'D', rack: '06', bin: '01', currentQty: 20, safetyQty: 100, status: 'low', lastMovedAt: '2026-02-21' },
  { sku: 'SKU-0180', name: '화장지 100롤', category: '생활용품', zone: 'D', rack: '07', bin: '01', currentQty: 400, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-15' },
  { sku: 'SKU-0190', name: '불량 노트북', category: '전자부품', zone: 'A', rack: '07', bin: '01', currentQty: 12, safetyQty: 0, status: 'defect', lastMovedAt: '2026-02-10' },
  { sku: 'SKU-0200', name: '마우스 무선', category: '전자부품', zone: 'A', rack: '03', bin: '01', currentQty: 25, safetyQty: 50, status: 'low', lastMovedAt: '2026-02-22' },
  { sku: 'SKU-0201', name: '키보드 무선', category: '전자부품', zone: 'A', rack: '03', bin: '02', currentQty: 80, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-22' },
  { sku: 'SKU-0210', name: '러닝화 남성', category: '의류/신발', zone: 'B', rack: '06', bin: '01', currentQty: 65, safetyQty: 40, status: 'normal', lastMovedAt: '2026-02-19', styleCode: 'RUN-M-301', color: 'BLUE', size: '265', seasonCode: 'SS25', collection: 'RUNNING', storageType: 'shelf' },
  { sku: 'SKU-0220', name: '스킨케어 세트', category: '생활용품', zone: 'C', rack: '02', bin: '03', currentQty: 3, safetyQty: 20, status: 'low', lastMovedAt: '2026-02-20' },
]
