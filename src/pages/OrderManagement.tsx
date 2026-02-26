import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore, OrderLifecycle } from '../store/extendedModulesStore'

const statusFlow: OrderLifecycle[] = ['received', 'inventoryChecked', 'allocated', 'partiallyShipped', 'completed']

export default function OrderManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const orders = useExtendedModulesStore((state) => state.orders)
  const shipments = useExtendedModulesStore((state) => state.orderShipments)
  const createOrder = useExtendedModulesStore((state) => state.createOrder)
  const updateOrderLifecycle = useExtendedModulesStore((state) => state.updateOrderLifecycle)
  const createShipment = useExtendedModulesStore((state) => state.createShipment)

  const [customer, setCustomer] = useState('쿠팡')
  const [sku, setSku] = useState('SKU-0001')
  const [qty, setQty] = useState(1)

  const statusLabel: Record<OrderLifecycle, string> = isKo
    ? {
        received: '주문접수',
        inventoryChecked: '재고확인',
        allocated: '출고지시배분',
        partiallyShipped: '부분출고/분할배송',
        completed: '주문완료',
      }
    : {
        received: 'Received',
        inventoryChecked: 'Inventory Checked',
        allocated: 'Allocation Completed',
        partiallyShipped: 'Partial/ Split Shipment',
        completed: 'Completed',
      }

  const shipmentMap = useMemo(() => {
    const map = new Map<string, typeof shipments>()
    shipments.forEach((shipment) => {
      const current = map.get(shipment.orderId) ?? []
      map.set(shipment.orderId, [...current, shipment])
    })
    return map
  }, [shipments])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '주문 관리 (OMS 연동 뷰)' : 'Order Management (OMS View)'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {isKo ? '주문 단위와 출고 단위(합포장/분할출고) 매핑을 포함한 전체 주문 라이프사이클을 추적합니다.' : 'Track full order lifecycle with mapping between order unit and shipment unit (merge/split).'}
          </p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '고객사' : 'Customer'} />
          <input value={sku} onChange={(e) => setSku(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="SKU" />
          <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button
            onClick={() => {
              const id = `ORD-${Date.now()}`
              createOrder({ id, customer, receivedAt: new Date().toISOString().slice(0, 10), lines: [{ sku, name: sku, qty }] })
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            {isKo ? '주문 생성' : 'Create Order'}
          </button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const orderShipments = shipmentMap.get(order.id) ?? []
            return (
              <div key={order.id} className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-blue-400 font-mono text-sm">{order.id}</p>
                    <p className="text-sm">{order.customer} · {order.receivedAt}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {statusFlow.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateOrderLifecycle(order.id, status)}
                        className={`text-xs px-2 py-1 rounded-full border ${order.status === status ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'}`}
                      >
                        {statusLabel[status]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    <p className="text-xs text-slate-400 mb-2">{isKo ? '주문 라인' : 'Order Lines'}</p>
                    {order.lines.map((line) => (
                      <p key={`${order.id}-${line.sku}`} className="text-sm">{line.sku} · {line.qty} EA</p>
                    ))}
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">{isKo ? '출고/배송 매핑' : 'Shipment Mapping'}</p>
                      <button
                        onClick={() => createShipment({ shipmentId: `SHP-${Date.now()}`, orderId: order.id, items: order.lines.map((line) => ({ sku: line.sku, qty: Math.max(1, Math.floor(line.qty / 2)) })) })}
                        className="text-xs px-2 py-1 bg-slate-700 rounded"
                      >
                        {isKo ? '분할 출고 추가' : 'Add Split Shipment'}
                      </button>
                    </div>
                    {orderShipments.length === 0 && <p className="text-xs text-slate-500">{isKo ? '생성된 출고 없음' : 'No shipment created'}</p>}
                    {orderShipments.map((shipment) => (
                      <div key={shipment.shipmentId} className="text-sm py-1 flex items-center justify-between">
                        <span>{shipment.shipmentId} ({shipment.items.reduce((sum, item) => sum + item.qty, 0)} EA)</span>
                        <span className="text-xs text-slate-400">{shipment.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
