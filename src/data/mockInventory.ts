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
  { sku: 'SKU-0001', name: '남성 오버핏 후드티', category: '의류/신발', zone: 'A', rack: '01', bin: '02', currentQty: 140, safetyQty: 80, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'HD-M-001', color: 'BLACK', size: 'L', seasonCode: 'FW25', collection: 'URBAN', storageType: 'flat' },
  { sku: 'SKU-0002', name: '여성 크롭 후드티', category: '의류/신발', zone: 'A', rack: '01', bin: '03', currentQty: 120, safetyQty: 60, status: 'normal', lastMovedAt: '2026-02-25', styleCode: 'HD-W-011', color: 'GRAY', size: 'M', seasonCode: 'FW25', collection: 'URBAN', storageType: 'flat' },
  { sku: 'SKU-0003', name: '남성 롱패딩', category: '의류/신발', zone: 'A', rack: '06', bin: '01', currentQty: 37, safetyQty: 20, status: 'normal', lastMovedAt: '2026-02-22', styleCode: 'PD-M-210', color: 'BLACK', size: 'XL', seasonCode: 'FW25', collection: 'WINTER OUTER', storageType: 'hanger' },
  { sku: 'SKU-0010', name: '여성 슬림 슬랙스', category: '의류/신발', zone: 'B', rack: '01', bin: '01', currentQty: 198, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24', styleCode: 'PT-W-120', color: 'NAVY', size: 'M', seasonCode: 'SS25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0020', name: '베이직 반팔 티셔츠', category: '의류/신발', zone: 'D', rack: '03', bin: '01', currentQty: 450, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'TS-U-001', color: 'BLACK', size: 'M', seasonCode: 'SS25', collection: 'BASIC', storageType: 'flat' },
  { sku: 'SKU-0021', name: '베이직 반팔 티셔츠', category: '의류/신발', zone: 'D', rack: '03', bin: '02', currentQty: 270, safetyQty: 150, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'TS-U-001', color: 'WHITE', size: 'L', seasonCode: 'SS25', collection: 'BASIC', storageType: 'flat' },
  { sku: 'SKU-0030', name: '에어맥스 270', category: '의류/신발', zone: 'B', rack: '03', bin: '04', currentQty: 130, safetyQty: 60, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'SNKR-270', color: 'WHITE', size: '270', seasonCode: 'SS25', collection: 'PERFORMANCE', storageType: 'shelf' },
  { sku: 'SKU-0031', name: '에어포스1', category: '의류/신발', zone: 'B', rack: '03', bin: '05', currentQty: 85, safetyQty: 60, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'AF-001', color: 'BLACK', size: '275', seasonCode: 'FW25', collection: 'URBAN', storageType: 'shelf' },
  { sku: 'SKU-0040', name: '여성 캐시미어 코트', category: '의류/신발', zone: 'C', rack: '02', bin: '01', currentQty: 55, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-25', styleCode: 'CT-W-510', color: 'BEIGE', size: 'M', seasonCode: 'FW25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0050', name: '남성 데님 자켓', category: '의류/신발', zone: 'D', rack: '01', bin: '01', currentQty: 190, safetyQty: 80, status: 'excess', lastMovedAt: '2026-02-25', styleCode: 'JK-M-330', color: 'BLUE', size: 'L', seasonCode: 'SS25', collection: 'DENIM', storageType: 'hanger' },
  { sku: 'SKU-0051', name: '여성 데님 자켓', category: '의류/신발', zone: 'D', rack: '01', bin: '02', currentQty: 170, safetyQty: 90, status: 'normal', lastMovedAt: '2026-02-25', styleCode: 'JK-W-331', color: 'INDIGO', size: 'M', seasonCode: 'SS25', collection: 'DENIM', storageType: 'hanger' },
  { sku: 'SKU-0060', name: '프리미엄 가죽 벨트', category: '의류/신발', zone: 'A', rack: '05', bin: '03', currentQty: 450, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-24', styleCode: 'AC-BT-101', color: 'BROWN', size: 'FREE', seasonCode: 'BASIC', collection: 'ACCESSORY', storageType: 'shelf' },
  { sku: 'SKU-0070', name: '울 머플러', category: '의류/신발', zone: 'D', rack: '04', bin: '01', currentQty: 180, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24', styleCode: 'AC-MF-207', color: 'IVORY', size: 'FREE', seasonCode: 'FW25', collection: 'WINTER OUTER', storageType: 'flat' },
  { sku: 'SKU-0080', name: '다운 베스트', category: '의류/신발', zone: 'C', rack: '05', bin: '01', currentQty: 30, safetyQty: 15, status: 'normal', lastMovedAt: '2026-02-20', styleCode: 'VT-U-120', color: 'KHAKI', size: 'L', seasonCode: 'FW25', collection: 'OUTDOOR', storageType: 'hanger' },
  { sku: 'SKU-0090', name: '니트 비니', category: '의류/신발', zone: 'B', rack: '04', bin: '02', currentQty: 265, safetyQty: 100, status: 'normal', lastMovedAt: '2026-02-24', styleCode: 'AC-BN-013', color: 'CHARCOAL', size: 'FREE', seasonCode: 'FW25', collection: 'WINTER OUTER', storageType: 'flat' },
  { sku: 'SKU-0100', name: '러닝 윈드브레이커', category: '의류/신발', zone: 'C', rack: '01', bin: '02', currentQty: 35, safetyQty: 20, status: 'normal', lastMovedAt: '2026-02-20', styleCode: 'WB-U-090', color: 'LIME', size: 'M', seasonCode: 'SS25', collection: 'RUNNING', storageType: 'hanger' },
  { sku: 'SKU-0110', name: '스포츠 양말 3팩', category: '의류/신발', zone: 'D', rack: '05', bin: '01', currentQty: 45, safetyQty: 120, status: 'low', lastMovedAt: '2026-02-18', styleCode: 'AC-SK-300', color: 'WHITE', size: 'FREE', seasonCode: 'BASIC', collection: 'SPORTS', storageType: 'flat' },
  { sku: 'SKU-0120', name: '여성 재킷', category: '의류/신발', zone: 'C', rack: '03', bin: '01', currentQty: 47, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'JK-WM-101', color: 'NAVY', size: 'M', seasonCode: 'FW25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0130', name: '기프트 니트 세트 A', category: '의류/신발', zone: 'C', rack: '04', bin: '01', currentQty: 100, safetyQty: 50, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'GT-KN-A', color: 'MIX', size: 'FREE', seasonCode: 'FW25', collection: 'GIFT', storageType: 'flat' },
  { sku: 'SKU-0131', name: '기프트 니트 세트 B', category: '의류/신발', zone: 'C', rack: '04', bin: '02', currentQty: 80, safetyQty: 50, status: 'normal', lastMovedAt: '2026-02-26', styleCode: 'GT-KN-B', color: 'MIX', size: 'FREE', seasonCode: 'FW25', collection: 'GIFT', storageType: 'flat' },
  { sku: 'SKU-0140', name: '플리스 집업', category: '의류/신발', zone: 'D', rack: '02', bin: '03', currentQty: 300, safetyQty: 120, status: 'excess', lastMovedAt: '2026-02-23', styleCode: 'FL-U-008', color: 'CREAM', size: 'L', seasonCode: 'FW25', collection: 'BASIC', storageType: 'hanger' },
  { sku: 'SKU-0150', name: '990v5', category: '의류/신발', zone: 'B', rack: '05', bin: '03', currentQty: 78, safetyQty: 40, status: 'normal', lastMovedAt: '2026-02-20', styleCode: 'NB-990V5', color: 'GRAY', size: '260', seasonCode: 'SS25', collection: 'RUNNING', storageType: 'shelf' },
  { sku: 'SKU-0160', name: '트레킹 고어텍스 자켓', category: '의류/신발', zone: 'A', rack: '02', bin: '04', currentQty: 175, safetyQty: 80, status: 'normal', lastMovedAt: '2026-02-24', styleCode: 'JK-U-870', color: 'OLIVE', size: 'L', seasonCode: 'FW25', collection: 'OUTDOOR', storageType: 'hanger' },
  { sku: 'SKU-0170', name: '코튼 파자마 세트', category: '의류/신발', zone: 'D', rack: '06', bin: '01', currentQty: 20, safetyQty: 100, status: 'low', lastMovedAt: '2026-02-21', styleCode: 'HM-U-021', color: 'SKY', size: 'M', seasonCode: 'BASIC', collection: 'HOMEWEAR', storageType: 'flat' },
  { sku: 'SKU-0180', name: '발열 내의 세트', category: '의류/신발', zone: 'D', rack: '07', bin: '01', currentQty: 400, safetyQty: 200, status: 'normal', lastMovedAt: '2026-02-15', styleCode: 'HT-U-777', color: 'BLACK', size: 'L', seasonCode: 'FW25', collection: 'WINTER OUTER', storageType: 'flat' },
  { sku: 'SKU-0190', name: '불량 롱패딩', category: '의류/신발', zone: 'A', rack: '07', bin: '01', currentQty: 12, safetyQty: 0, status: 'defect', lastMovedAt: '2026-02-10', styleCode: 'PD-M-210', color: 'BLACK', size: 'XL', seasonCode: 'FW25', collection: 'WINTER OUTER', storageType: 'hanger' },
  { sku: 'SKU-0200', name: '남성 기본 셔츠', category: '의류/신발', zone: 'A', rack: '03', bin: '01', currentQty: 25, safetyQty: 50, status: 'low', lastMovedAt: '2026-02-22', styleCode: 'SH-M-100', color: 'WHITE', size: 'L', seasonCode: 'SS25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0201', name: '여성 기본 셔츠', category: '의류/신발', zone: 'A', rack: '03', bin: '02', currentQty: 80, safetyQty: 30, status: 'normal', lastMovedAt: '2026-02-22', styleCode: 'SH-W-101', color: 'BLUE', size: 'M', seasonCode: 'SS25', collection: 'CITY FORMAL', storageType: 'hanger' },
  { sku: 'SKU-0210', name: '러닝화 남성', category: '의류/신발', zone: 'B', rack: '06', bin: '01', currentQty: 65, safetyQty: 40, status: 'normal', lastMovedAt: '2026-02-19', styleCode: 'RUN-M-301', color: 'BLUE', size: '265', seasonCode: 'SS25', collection: 'RUNNING', storageType: 'shelf' },
  { sku: 'SKU-0220', name: '캔버스 토트백', category: '의류/신발', zone: 'C', rack: '02', bin: '03', currentQty: 33, safetyQty: 20, status: 'normal', lastMovedAt: '2026-02-20', styleCode: 'BG-TB-022', color: 'NATURAL', size: 'FREE', seasonCode: 'BASIC', collection: 'ACCESSORY', storageType: 'shelf' },
]
