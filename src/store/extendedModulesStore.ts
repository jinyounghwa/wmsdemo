import { create } from 'zustand'

export type OrderLifecycle = 'received' | 'inventoryChecked' | 'allocated' | 'partiallyShipped' | 'completed'

export interface OrderLine {
  sku: string
  name: string
  qty: number
}

export interface OrderShipment {
  shipmentId: string
  orderId: string
  items: Array<{ sku: string; qty: number }>
  status: 'ready' | 'shipped' | 'delivered'
}

export interface OrderEntity {
  id: string
  customer: string
  receivedAt: string
  status: OrderLifecycle
  lines: OrderLine[]
  shipments: string[]
}

export interface CrossDockTask {
  id: string
  inboundRef: string
  outboundRef: string
  sku: string
  qty: number
  inboundDock: string
  outboundDock: string
  status: 'queued' | 'moving' | 'completed'
}

export interface LotBatchStock {
  id: string
  sku: string
  lotNo: string
  batchNo: string
  expiryDate: string
  qty: number
  location: string
}

export interface SerialUnit {
  serialNo: string
  sku: string
  status: 'inStock' | 'allocated' | 'shipped' | 'returned'
  location: string
  lastEvent: string
}

export interface YardAppointment {
  id: string
  truckNo: string
  carrier: string
  dockDoor: string
  slot: string
  status: 'booked' | 'arrived' | 'atYard' | 'atDock' | 'completed'
  waitingMinutes: number
}

export interface AsnNotice {
  id: string
  vendor: string
  eta: string
  dock: string
  status: 'received' | 'scheduled' | 'arrived'
  lines: Array<{ sku: string; qty: number }>
}

export interface InventoryAuditEvent {
  id: string
  sku: string
  action: string
  fromLocation?: string
  toLocation?: string
  qty: number
  actor: string
  at: string
}

export interface DisposalRequest {
  id: string
  sku: string
  qty: number
  reason: string
  approvalStatus: 'requested' | 'approved' | 'disposed'
  requestedBy: string
  approvedBy?: string
  requestedAt: string
}

export interface NotificationRule {
  id: string
  eventType: string
  condition: string
  recipient: string
  enabled: boolean
}

export interface NotificationItem {
  id: string
  eventType: string
  message: string
  severity: 'info' | 'warn' | 'critical'
  read: boolean
  createdAt: string
}

export interface SystemConfiguration {
  warehouseCode: string
  warehouseName: string
  address: string
  operationHours: string
  weightUnit: 'kg' | 'lb'
  volumeUnit: 'cbm' | 'ft3'
  barcodePrefix: string
  autoNumberPattern: string
  interfaceMode: 'mock' | 'api'
}

export interface WarehouseStock {
  warehouseId: string
  warehouseName: string
  sku: string
  qty: number
}

export interface TransferOrder {
  id: string
  fromWh: string
  toWh: string
  sku: string
  qty: number
  status: 'requested' | 'inTransit' | 'received'
}

export interface KitBom {
  id: string
  kitSku: string
  kitName: string
  components: Array<{ sku: string; qty: number }>
}

export interface KitAssemblyOrder {
  id: string
  kitSku: string
  qty: number
  status: 'queued' | 'assembling' | 'completed'
}

export interface QcInspection {
  id: string
  refNo: string
  samplingRate: number
  criteria: string
  result: 'pass' | 'fail' | 'hold'
  inspector: string
  inspectedAt: string
}

export interface ShippingTmsRecord {
  id: string
  orderId: string
  shipmentId: string
  carrier: string
  trackingNo: string
  status: 'manifested' | 'inTransit' | 'delivered'
  deliveredAt?: string
}

interface ExtendedModulesStore {
  orders: OrderEntity[]
  orderShipments: OrderShipment[]
  crossDockTasks: CrossDockTask[]
  lots: LotBatchStock[]
  serials: SerialUnit[]
  yardAppointments: YardAppointment[]
  asnNotices: AsnNotice[]
  inventoryAuditTrail: InventoryAuditEvent[]
  disposalRequests: DisposalRequest[]
  notificationRules: NotificationRule[]
  notifications: NotificationItem[]
  systemConfig: SystemConfiguration
  warehouseStocks: WarehouseStock[]
  transferOrders: TransferOrder[]
  kitBoms: KitBom[]
  kitAssemblyOrders: KitAssemblyOrder[]
  qcInspections: QcInspection[]
  shippingRecords: ShippingTmsRecord[]
  createOrder: (payload: Omit<OrderEntity, 'status' | 'shipments'>) => void
  updateOrderLifecycle: (orderId: string, status: OrderLifecycle) => void
  createShipment: (payload: Omit<OrderShipment, 'status'>) => void
  updateShipmentStatus: (shipmentId: string, status: OrderShipment['status']) => void
  createCrossDockTask: (payload: Omit<CrossDockTask, 'status'>) => void
  updateCrossDockStatus: (id: string, status: CrossDockTask['status']) => void
  addLot: (lot: LotBatchStock) => void
  allocateFefo: (sku: string, qty: number) => Array<{ lotNo: string; pickedQty: number }>
  registerSerial: (serial: SerialUnit) => void
  updateSerialStatus: (serialNo: string, status: SerialUnit['status'], location: string) => void
  createYardAppointment: (payload: Omit<YardAppointment, 'status' | 'waitingMinutes'>) => void
  updateYardStatus: (id: string, status: YardAppointment['status']) => void
  updateYardWaiting: (id: string, waitingMinutes: number) => void
  createAsn: (payload: Omit<AsnNotice, 'status'>) => void
  updateAsnStatus: (id: string, status: AsnNotice['status']) => void
  addAuditEvent: (payload: Omit<InventoryAuditEvent, 'id'>) => void
  createDisposalRequest: (payload: Omit<DisposalRequest, 'approvalStatus' | 'requestedAt'>) => void
  approveDisposal: (id: string, approvedBy: string) => void
  completeDisposal: (id: string) => void
  addNotificationRule: (payload: Omit<NotificationRule, 'id'>) => void
  toggleRule: (id: string) => void
  addNotification: (payload: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  updateSystemConfig: (payload: Partial<SystemConfiguration>) => void
  createTransferOrder: (payload: Omit<TransferOrder, 'id' | 'status'>) => void
  updateTransferStatus: (id: string, status: TransferOrder['status']) => void
  addKitBom: (payload: Omit<KitBom, 'id'>) => void
  createAssemblyOrder: (payload: Omit<KitAssemblyOrder, 'id' | 'status'>) => void
  updateAssemblyStatus: (id: string, status: KitAssemblyOrder['status']) => void
  addQcInspection: (payload: Omit<QcInspection, 'id' | 'inspectedAt'>) => void
  addShippingRecord: (payload: Omit<ShippingTmsRecord, 'id'>) => void
  updateShippingStatus: (id: string, status: ShippingTmsRecord['status']) => void
}

const today = () => new Date().toISOString().slice(0, 10)

export const useExtendedModulesStore = create<ExtendedModulesStore>((set, get) => ({
  orders: [
    {
      id: 'ORD-240226-001',
      customer: '쿠팡',
      receivedAt: today(),
      status: 'allocated',
      lines: [
        { sku: 'SKU-0001', name: '갤럭시 버즈', qty: 3 },
        { sku: 'SKU-0002', name: '무선충전기', qty: 1 },
      ],
      shipments: ['SHP-240226-001'],
    },
  ],
  orderShipments: [
    {
      shipmentId: 'SHP-240226-001',
      orderId: 'ORD-240226-001',
      items: [
        { sku: 'SKU-0001', qty: 2 },
        { sku: 'SKU-0002', qty: 1 },
      ],
      status: 'shipped',
    },
  ],
  crossDockTasks: [
    {
      id: 'XD-240226-001',
      inboundRef: 'PO-240226-100',
      outboundRef: 'SO-240226-310',
      sku: 'SKU-0110',
      qty: 120,
      inboundDock: 'RCV-02',
      outboundDock: 'SHP-01',
      status: 'queued',
    },
  ],
  lots: [
    { id: 'LOT-1', sku: 'SKU-0020', lotNo: 'LOT-20260201-A', batchNo: 'B-01', expiryDate: '2026-03-05', qty: 100, location: 'D-03-01-01-01' },
    { id: 'LOT-2', sku: 'SKU-0020', lotNo: 'LOT-20260205-B', batchNo: 'B-02', expiryDate: '2026-03-15', qty: 180, location: 'D-03-01-01-02' },
  ],
  serials: [
    { serialNo: 'SN-ABCD-0001', sku: 'SKU-0100', status: 'inStock', location: 'C-01-02-01-01', lastEvent: today() },
    { serialNo: 'SN-ABCD-0002', sku: 'SKU-0100', status: 'allocated', location: 'STAGE-01', lastEvent: today() },
  ],
  yardAppointments: [
    { id: 'YARD-001', truckNo: '88가1234', carrier: 'CJ대한통운', dockDoor: 'DOOR-03', slot: '09:00-09:30', status: 'booked', waitingMinutes: 0 },
  ],
  asnNotices: [
    {
      id: 'ASN-240226-01',
      vendor: '삼성전자',
      eta: `${today()} 10:30`,
      dock: 'RCV-01',
      status: 'scheduled',
      lines: [{ sku: 'SKU-0001', qty: 200 }],
    },
  ],
  inventoryAuditTrail: [
    { id: 'ADT-001', sku: 'SKU-0001', action: 'Put-away completed', fromLocation: 'RCV-01', toLocation: 'A-01-01-01-01', qty: 120, actor: 'PDA-01', at: `${today()} 09:10` },
  ],
  disposalRequests: [
    { id: 'DSP-001', sku: 'SKU-0190', qty: 4, reason: '불량품', approvalStatus: 'requested', requestedBy: 'QC-01', requestedAt: `${today()} 11:20` },
  ],
  notificationRules: [
    { id: 'NR-1', eventType: 'SLA', condition: '출고 지연 +1일', recipient: 'Ops Manager', enabled: true },
    { id: 'NR-2', eventType: 'Stock', condition: '안전재고 미만', recipient: 'Inventory Lead', enabled: true },
  ],
  notifications: [
    { id: 'NT-1', eventType: 'SLA', message: 'SO-240226-210 출고 지연 +1일', severity: 'warn', read: false, createdAt: `${today()} 08:50` },
    { id: 'NT-2', eventType: 'WCS', message: 'Sorter SR-02 Jam 감지', severity: 'critical', read: false, createdAt: `${today()} 09:30` },
  ],
  systemConfig: {
    warehouseCode: 'WH-SEOUL-01',
    warehouseName: '서울 통합 물류센터',
    address: '경기도 고양시 물류로 100',
    operationHours: '08:00-22:00',
    weightUnit: 'kg',
    volumeUnit: 'cbm',
    barcodePrefix: 'WMS',
    autoNumberPattern: 'YYMMDD-####',
    interfaceMode: 'mock',
  },
  warehouseStocks: [
    { warehouseId: 'WH-SEOUL-01', warehouseName: '서울센터', sku: 'SKU-0001', qty: 140 },
    { warehouseId: 'WH-BUSAN-01', warehouseName: '부산센터', sku: 'SKU-0001', qty: 80 },
  ],
  transferOrders: [
    { id: 'TRF-001', fromWh: 'WH-SEOUL-01', toWh: 'WH-BUSAN-01', sku: 'SKU-0001', qty: 20, status: 'inTransit' },
  ],
  kitBoms: [
    {
      id: 'KIT-1',
      kitSku: 'KIT-1000',
      kitName: '홈오피스 세트',
      components: [
        { sku: 'SKU-0200', qty: 1 },
        { sku: 'SKU-0201', qty: 1 },
      ],
    },
  ],
  kitAssemblyOrders: [
    { id: 'ASM-001', kitSku: 'KIT-1000', qty: 10, status: 'queued' },
  ],
  qcInspections: [
    {
      id: 'QC-001',
      refNo: 'PO-240226-100',
      samplingRate: 10,
      criteria: '외관/기능/라벨',
      result: 'hold',
      inspector: 'QC-A',
      inspectedAt: `${today()} 10:10`,
    },
  ],
  shippingRecords: [
    {
      id: 'TMS-001',
      orderId: 'ORD-240226-001',
      shipmentId: 'SHP-240226-001',
      carrier: 'CJ대한통운',
      trackingNo: 'TRK-8899123',
      status: 'inTransit',
    },
  ],
  createOrder: (payload) =>
    set((state) => ({
      orders: [
        {
          ...payload,
          status: 'received',
          shipments: [],
        },
        ...state.orders,
      ],
    })),
  updateOrderLifecycle: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    })),
  createShipment: (payload) =>
    set((state) => ({
      orderShipments: [{ ...payload, status: 'ready' }, ...state.orderShipments],
      orders: state.orders.map((order) =>
        order.id === payload.orderId ? { ...order, shipments: [...order.shipments, payload.shipmentId] } : order,
      ),
    })),
  updateShipmentStatus: (shipmentId, status) =>
    set((state) => ({
      orderShipments: state.orderShipments.map((shipment) =>
        shipment.shipmentId === shipmentId ? { ...shipment, status } : shipment,
      ),
    })),
  createCrossDockTask: (payload) =>
    set((state) => ({ crossDockTasks: [{ ...payload, status: 'queued' }, ...state.crossDockTasks] })),
  updateCrossDockStatus: (id, status) =>
    set((state) => ({
      crossDockTasks: state.crossDockTasks.map((task) => (task.id === id ? { ...task, status } : task)),
    })),
  addLot: (lot) => set((state) => ({ lots: [lot, ...state.lots] })),
  allocateFefo: (sku, qty) => {
    const lots = [...get().lots]
      .filter((lot) => lot.sku === sku && lot.qty > 0)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))
    const picks: Array<{ lotNo: string; pickedQty: number }> = []
    let remaining = qty
    lots.forEach((lot) => {
      if (remaining <= 0) return
      const pickedQty = Math.min(lot.qty, remaining)
      if (pickedQty > 0) {
        picks.push({ lotNo: lot.lotNo, pickedQty })
        remaining -= pickedQty
      }
    })

    if (picks.length > 0) {
      set((state) => ({
        lots: state.lots.map((lot) => {
          const matched = picks.find((pick) => pick.lotNo === lot.lotNo)
          return matched ? { ...lot, qty: Math.max(0, lot.qty - matched.pickedQty) } : lot
        }),
      }))
    }
    return picks
  },
  registerSerial: (serial) => set((state) => ({ serials: [serial, ...state.serials] })),
  updateSerialStatus: (serialNo, status, location) =>
    set((state) => ({
      serials: state.serials.map((serial) =>
        serial.serialNo === serialNo ? { ...serial, status, location, lastEvent: today() } : serial,
      ),
    })),
  createYardAppointment: (payload) =>
    set((state) => ({ yardAppointments: [{ ...payload, status: 'booked', waitingMinutes: 0 }, ...state.yardAppointments] })),
  updateYardStatus: (id, status) =>
    set((state) => ({
      yardAppointments: state.yardAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    })),
  updateYardWaiting: (id, waitingMinutes) =>
    set((state) => ({
      yardAppointments: state.yardAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, waitingMinutes } : appointment,
      ),
    })),
  createAsn: (payload) => set((state) => ({ asnNotices: [{ ...payload, status: 'received' }, ...state.asnNotices] })),
  updateAsnStatus: (id, status) =>
    set((state) => ({ asnNotices: state.asnNotices.map((asn) => (asn.id === id ? { ...asn, status } : asn)) })),
  addAuditEvent: (payload) =>
    set((state) => ({
      inventoryAuditTrail: [{ ...payload, id: `ADT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }, ...state.inventoryAuditTrail],
    })),
  createDisposalRequest: (payload) =>
    set((state) => ({
      disposalRequests: [
        {
          ...payload,
          approvalStatus: 'requested',
          requestedAt: `${today()} ${new Date().toTimeString().slice(0, 5)}`,
        },
        ...state.disposalRequests,
      ],
    })),
  approveDisposal: (id, approvedBy) =>
    set((state) => ({
      disposalRequests: state.disposalRequests.map((request) =>
        request.id === id ? { ...request, approvalStatus: 'approved', approvedBy } : request,
      ),
    })),
  completeDisposal: (id) =>
    set((state) => ({
      disposalRequests: state.disposalRequests.map((request) =>
        request.id === id ? { ...request, approvalStatus: 'disposed' } : request,
      ),
    })),
  addNotificationRule: (payload) =>
    set((state) => ({
      notificationRules: [
        { ...payload, id: `NR-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` },
        ...state.notificationRules,
      ],
    })),
  toggleRule: (id) =>
    set((state) => ({
      notificationRules: state.notificationRules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    })),
  addNotification: (payload) =>
    set((state) => ({
      notifications: [
        {
          ...payload,
          id: `NT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          read: false,
          createdAt: `${today()} ${new Date().toTimeString().slice(0, 5)}`,
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
    })),
  updateSystemConfig: (payload) =>
    set((state) => ({ systemConfig: { ...state.systemConfig, ...payload } })),
  createTransferOrder: (payload) =>
    set((state) => ({
      transferOrders: [
        {
          ...payload,
          id: `TRF-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          status: 'requested',
        },
        ...state.transferOrders,
      ],
    })),
  updateTransferStatus: (id, status) =>
    set((state) => ({
      transferOrders: state.transferOrders.map((order) => (order.id === id ? { ...order, status } : order)),
    })),
  addKitBom: (payload) =>
    set((state) => ({
      kitBoms: [{ ...payload, id: `KIT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` }, ...state.kitBoms],
    })),
  createAssemblyOrder: (payload) =>
    set((state) => ({
      kitAssemblyOrders: [
        { ...payload, id: `ASM-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, status: 'queued' },
        ...state.kitAssemblyOrders,
      ],
    })),
  updateAssemblyStatus: (id, status) =>
    set((state) => ({
      kitAssemblyOrders: state.kitAssemblyOrders.map((order) => (order.id === id ? { ...order, status } : order)),
    })),
  addQcInspection: (payload) =>
    set((state) => ({
      qcInspections: [
        { ...payload, id: `QC-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, inspectedAt: `${today()} ${new Date().toTimeString().slice(0, 5)}` },
        ...state.qcInspections,
      ],
    })),
  addShippingRecord: (payload) =>
    set((state) => ({
      shippingRecords: [
        { ...payload, id: `TMS-${Date.now()}-${Math.random().toString(36).slice(2, 5)}` },
        ...state.shippingRecords,
      ],
    })),
  updateShippingStatus: (id, status) =>
    set((state) => ({
      shippingRecords: state.shippingRecords.map((record) => (record.id === id ? { ...record, status } : record)),
    })),
}))
