export type ProductRecord = {
  id: number
  name: string
  inventoryManaged: boolean
  supplier: string
  category: string
  code: string
  salePrice: number
  costPrice: number
  supplyPrice: number
  margin: number
  registeredAt: string
}

export type ProductOptionRow = {
  id: string
  optionName: string
  color: string
  size: string
  cost: number
  currentStock: number
  safetyStock: number
  barcode: string
  optionCode: string
  location: string
}

export type SupplierSummary = {
  supplier: string
  count: number
}

export type OrderItemMatch = {
  sku: string
  optionLabel: string
  qty: number
  designatedWarehouseStock: number
}

export type OrderRecord = {
  id: string
  orderDate: string
  salesChannel: string
  contact: string
  quantity: number
  amount: number
  orderer: string
  receiver: string
  shippingMethod: string
  progress: string[]
  csStatus: string[]
  note: string
  items: OrderItemMatch[]
}

export type CsOrderRecord = {
  id: number
  hasCs: boolean
  orderDate: string
  csDate: string
  delayLabel: string
  status: string
  csCount: number
  salesChannel: string
  orderer: string
  receiver: string
  contact: string
  totalOrderCount: number
  totalQty: number
  totalAmount: number
  shippingMethod: string
  shippedAt: string
  address: string
  carrier: string
}

export type CsHistoryRecord = {
  id: number
  happenedAt: string
  customerName: string
  orderNo: string
  worker: string
  type: string
  status: string
  memo?: string
}

export const productRecords: ProductRecord[] = [
  { id: 188, name: '라뮤즈 본딩 하프코트 SET', inventoryManaged: true, supplier: '자사', category: '미입력', code: '미입력', salePrice: 0, costPrice: 0, supplyPrice: 0, margin: 0, registeredAt: '2025-06-23 10:46' },
  { id: 187, name: 'test1 zg', inventoryManaged: true, supplier: '자사', category: '미입력', code: 'zg1', salePrice: 0, costPrice: 0, supplyPrice: 0, margin: 0, registeredAt: '2025-06-22 21:43' },
  { id: 186, name: '아침', inventoryManaged: true, supplier: '자체제작', category: '미입력', code: '29', salePrice: 8000, costPrice: 8000, supplyPrice: 0, margin: 0, registeredAt: '2025-06-22 21:42' },
  { id: 185, name: '바람', inventoryManaged: true, supplier: '자체제작', category: '미입력', code: 'P00000BC', salePrice: 2000, costPrice: 2000, supplyPrice: 0, margin: 0, registeredAt: '2025-06-22 20:23' },
  { id: 177, name: '발렌즈 앙고라 양말 JA04440', inventoryManaged: true, supplier: '자사', category: '미입력', code: '미입력', salePrice: 0, costPrice: 1800, supplyPrice: 0, margin: 0, registeredAt: '2024-11-06 11:52' },
  { id: 166, name: '[MADE] 데이 코듀로이 기모 팬츠 JP05765', inventoryManaged: true, supplier: '자사', category: '미입력', code: '미입력', salePrice: 0, costPrice: 24000, supplyPrice: 0, margin: 0, registeredAt: '2024-11-06 11:52' },
  { id: 112, name: '라뮤즈 본딩 하프코트', inventoryManaged: true, supplier: '자사', category: '미입력', code: '미입력', salePrice: 0, costPrice: 46000, supplyPrice: 0, margin: 0, registeredAt: '2024-11-06 11:52' },
  { id: 92, name: '[리얼핏]루로스 카라 티셔츠 69589', inventoryManaged: true, supplier: '자사', category: '미입력', code: 'b12359', salePrice: 16000, costPrice: 16000, supplyPrice: 0, margin: 0, registeredAt: '2024-07-18 18:15' },
  { id: 89, name: '아빈티 루즈핏 티셔츠', inventoryManaged: true, supplier: '자사', category: '미입력', code: 'b123591', salePrice: 16000, costPrice: 8000, supplyPrice: 12000, margin: 4000, registeredAt: '2024-07-18 18:15' },
  { id: 40, name: '[리얼핏]샤이티 루즈핏 스트라이프 티셔츠 69198', inventoryManaged: true, supplier: '자사', category: '분류1', code: 'b123596', salePrice: 17000, costPrice: 9880, supplyPrice: 15000, margin: 6000, registeredAt: '2024-07-18 18:15' },
  { id: 35, name: 'A. 릴리 프릴 쿨링 티셔츠[티셔츠C0227H228]', inventoryManaged: true, supplier: '자사', category: '분류1', code: 'b123598', salePrice: 15000, costPrice: 8000, supplyPrice: 12000, margin: 3000, registeredAt: '2024-07-18 18:14' },
  { id: 10, name: '플라워 자수 퍼프 니트', inventoryManaged: true, supplier: '더블제이', category: '분류1', code: 'A0001', salePrice: 30000, costPrice: 20000, supplyPrice: 0, margin: 0, registeredAt: '2023-12-06 11:38' },
]

export const defaultProductOptions: ProductOptionRow[] = [
  { id: 'OPT-1', optionName: '그린/XL', color: '그린', size: 'XL', cost: 12000, currentStock: 123, safetyStock: 20, barcode: '880100000001', optionCode: 'WMS-SKIRT-GREEN-XL', location: '기본창고 A-01-03' },
  { id: 'OPT-2', optionName: '화이트/S', color: '화이트', size: 'S', cost: 12000, currentStock: 123, safetyStock: 20, barcode: '880100000002', optionCode: 'WMS-SKIRT-WHITE-S', location: '기본창고 A-01-04' },
  { id: 'OPT-3', optionName: '화이트/XL', color: '화이트', size: 'XL', cost: 12000, currentStock: 123, safetyStock: 20, barcode: '880100000003', optionCode: 'WMS-SKIRT-WHITE-XL', location: '기본창고 A-01-05' },
]

export const supplierSummaries: SupplierSummary[] = [
  { supplier: '자사', count: 174 },
  { supplier: '로이진', count: 4 },
  { supplier: '레이나', count: 3 },
  { supplier: '자체제작', count: 2 },
  { supplier: '더블제이', count: 2 },
  { supplier: '에이블', count: 2 },
  { supplier: '마인드', count: 1 },
]

export const orderRecords: OrderRecord[] = [
  {
    id: '셀-S260106133213-04',
    orderDate: '2026-03-17',
    salesChannel: '고도몰',
    contact: '010-1234-7748',
    quantity: 3,
    amount: 0,
    orderer: '미입력',
    receiver: '고준석',
    shippingMethod: '선불묶음발송 나누기',
    progress: ['매칭작업', '송장입력', '상품발송'],
    csStatus: ['미배송으로인한생성 처리완료', '배송지수정 처리완료'],
    note: '교환/미배송 이력이 얽혀 있어 분리 주문과 원주문을 함께 추적해야 하는 케이스입니다.',
    items: [
      { sku: 'WMS 스커트', optionLabel: '그린,XL', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,S', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,XL', qty: 1, designatedWarehouseStock: 123 },
    ],
  },
  {
    id: '셀-S260106133213-03',
    orderDate: '2026-03-17',
    salesChannel: '고도몰',
    contact: '010-1234-7748',
    quantity: 3,
    amount: 0,
    orderer: '매칭작업 송장입력 상품발송',
    receiver: '매칭작업 송장입력 상품발송',
    shippingMethod: '교환으로인한생성 처리완료 / 일반상담 처리완료 / 배송지수정 처리완료',
    progress: ['교환생성', '배송지수정'],
    csStatus: [],
    note: '교환 생성 주문으로 화이트 L 단일 옵션만 할당됩니다.',
    items: [{ sku: 'WMS 스커트', optionLabel: '화이트,L', qty: 1, designatedWarehouseStock: 123 }],
  },
  {
    id: '셀-S260106133213-02',
    orderDate: '2026-03-17',
    salesChannel: '고도몰',
    contact: '010-1234-7748',
    quantity: 3,
    amount: 3000,
    orderer: '매칭작업 송장입력 상품발송',
    receiver: '매칭작업 송장입력 상품발송',
    shippingMethod: '교환으로인한생성 처리완료 / 일반상담 처리완료 / 배송지수정 처리완료',
    progress: ['매칭작업', '송장입력'],
    csStatus: [],
    note: '교환 전 원금액이 남아 있는 상태로, 미배송 생성 이전 스냅샷입니다.',
    items: [
      { sku: 'WMS 스커트', optionLabel: '그린,XL', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,S', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,XL', qty: 1, designatedWarehouseStock: 123 },
    ],
  },
  {
    id: '셀-S260106133213-01',
    orderDate: '2026-03-17',
    salesChannel: '고도몰',
    contact: '010-1234-7748',
    quantity: 3,
    amount: 3000,
    orderer: '미입력',
    receiver: '고준석',
    shippingMethod: '선불',
    progress: ['매칭작업', '송장입력', '상품발송'],
    csStatus: ['배송중분실로인한생성 처리완료'],
    note: '배송중 분실 발생 이력으로 재생성 주문이 연결됩니다.',
    items: [
      { sku: 'WMS 스커트', optionLabel: '그린,XL', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,S', qty: 1, designatedWarehouseStock: 123 },
      { sku: 'WMS 스커트', optionLabel: '화이트,XL', qty: 1, designatedWarehouseStock: 123 },
    ],
  },
]

export const csOrderRecords: CsOrderRecord[] = [
  { id: 8, hasCs: true, orderDate: '2026-03-17', csDate: '2026-03-17', delayLabel: '', status: '재묶음방지', csCount: 8, salesChannel: '고도몰', orderer: '미입력', receiver: '고준석', contact: '010-1234-7748', totalOrderCount: 3, totalQty: 9, totalAmount: 3000, shippingMethod: '나누기', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 203호', carrier: '미입력' },
  { id: 7, hasCs: true, orderDate: '2026-03-17', csDate: '2026-03-17', delayLabel: '', status: '', csCount: 1, salesChannel: '고도몰', orderer: '미입력', receiver: '고준석', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 3, totalAmount: 3000, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
  { id: 6, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-12', delayLabel: '(5일지연)', status: '', csCount: 1, salesChannel: '고도몰', orderer: '미입력', receiver: '고준석', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 3, totalAmount: 3000, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
  { id: 5, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-12', delayLabel: '(5일지연)', status: '', csCount: 1, salesChannel: '카페24테스트', orderer: '미입력', receiver: '고준석(맞교환)', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 5, totalAmount: 5000000, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
  { id: 4, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-12', delayLabel: '(5일지연)', status: '', csCount: 1, salesChannel: '카페24테스트', orderer: '미입력', receiver: '고준석(교환)', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 3, totalAmount: 0, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
  { id: 3, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-12', delayLabel: '(5일지연)', status: '', csCount: 2, salesChannel: '고도몰', orderer: '미입력', receiver: '고준석', contact: '01041357748', totalOrderCount: 1, totalQty: 5, totalAmount: 0, shippingMethod: '', shippedAt: '미발송', address: 'Gangnam-gu hakdongro 8gil 23 302ho', carrier: '미입력' },
  { id: 2, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-17', delayLabel: '', status: '', csCount: 6, salesChannel: '고도몰', orderer: '미입력', receiver: '고준석(맞교환)', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 1, totalAmount: 0, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
  { id: 1, hasCs: true, orderDate: '2026-03-12', csDate: '2026-03-16', delayLabel: '', status: '', csCount: 4, salesChannel: '카페24테스트', orderer: '미입력', receiver: '고준석', contact: '010-1234-7748', totalOrderCount: 1, totalQty: 3, totalAmount: 0, shippingMethod: '', shippedAt: '미발송', address: '서울특별시 강남구 학동로8길 23 (논현동) 202호', carrier: '미입력' },
]

export const csHistoryRecords: CsHistoryRecord[] = [
  { id: 1, happenedAt: '2026-03-17 오후 3:41:16', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '배송중분실로인한생성', status: '처리완료', memo: '(분실주문생성) [memo] 배송중 분실테스트' },
  { id: 2, happenedAt: '2026-03-17 오후 3:41:16', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '10.배송중분실', status: '처리완료', memo: '배송중 분실테스트' },
  { id: 3, happenedAt: '2026-03-17 오후 3:38:55', customerName: '고준석(맞교환)', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '12.품절취소', status: '처리완료' },
  { id: 4, happenedAt: '2026-03-17 오후 3:38:43', customerName: '고준석(맞교환)', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 5, happenedAt: '2026-03-17 오후 3:33:12', customerName: '고준석(맞교환)', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '05.발송전취소', status: '처리완료' },
  { id: 6, happenedAt: '2026-03-17 오후 3:32:52', customerName: '고준석(맞교환)', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 7, happenedAt: '2026-03-17 오후 3:27:56', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 8, happenedAt: '2026-03-17 오후 1:28:32', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '배송지수정', status: '처리완료', memo: '추가묶음체크에 묶어주기를 통해 주소를 203호로 변경함.' },
  { id: 9, happenedAt: '2026-03-17 오후 1:28:32', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '01.일반상담', status: '처리완료', memo: '추가묶음체크에 묶어주기를 통해 수령자를 고준석(맞교환) -> 고준석 변경함.' },
  { id: 10, happenedAt: '2026-03-17 오후 1:28:32', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '01.일반상담', status: '처리완료', memo: '추가묶음체크에 묶어주기를 통해 수령자를 고준석(교환) -> 고준석 변경함.' },
  { id: 11, happenedAt: '2026-03-17 오후 12:09:45', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '반품완료', status: '처리완료', memo: '반품택배사 우체국택배, 반품회수일자 2026-03-16 확인.' },
  { id: 12, happenedAt: '2026-03-17 오후 12:08:01', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 13, happenedAt: '2026-03-17 오전 11:58:59', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '반품회수취소', status: '처리완료', memo: '회수일자 2026-03-16 반품회수확인 취소.' },
  { id: 14, happenedAt: '2026-03-17 오전 11:54:13', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '미배송으로인한생성', status: '처리완료', memo: '(미배송생성) [금액변경] [3000] -> [0]' },
  { id: 15, happenedAt: '2026-03-17 오전 11:54:13', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '14.미배송', status: '처리완료', memo: '미배송처리' },
  { id: 16, happenedAt: '2026-03-17 오전 11:52:09', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 17, happenedAt: '2026-03-17 오전 11:46:32', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '맞교환완료', status: '처리완료', memo: '(맞교환완료) 2026.03.16 교환회수확인 완료.' },
  { id: 18, happenedAt: '2026-03-17 오전 11:46:32', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '교환으로인한취소', status: '처리완료', memo: '맞교환으로 인한 취소' },
  { id: 19, happenedAt: '2026-03-17 오전 11:38:05', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '맞교환요청', status: '처리완료', memo: '(맞교환요청) 그린,XL -> 화이트,L 변경 / 금액 3000 -> 0 / 맞교환주문생성' },
  { id: 20, happenedAt: '2026-03-17 오전 11:38:05', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '교환으로인한생성', status: '처리완료', memo: '이 주문은 교환으로 인하여 생성된 주문입니다.' },
  { id: 21, happenedAt: '2026-03-17 오전 11:37:32', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '취소복구', status: '처리완료' },
  { id: 22, happenedAt: '2026-03-17 오전 10:26:06', customerName: '고준석', orderNo: '셀-S260106133213', worker: 'opsmanager', type: '교환으로인한생성', status: '처리완료', memo: '이 주문은 교환으로 인하여 생성된 주문입니다.' },
  { id: 23, happenedAt: '2026-03-17 오전 10:26:04', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '교환완료', status: '처리완료', memo: '(교환완료) 교환회수확인 후 주소를 202호로 반영.' },
  { id: 24, happenedAt: '2026-03-17 오전 10:26:04', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '교환으로인한취소', status: '처리완료', memo: '교환으로 인한 취소 [반품회수수량 3]' },
  { id: 25, happenedAt: '2026-03-17 오전 10:22:19', customerName: '고준석', orderNo: 'S260106133213', worker: 'opsmanager', type: '교환요청', status: '처리완료', memo: '(교환요청) 우체국택배 반품정보 접수.' },
]
