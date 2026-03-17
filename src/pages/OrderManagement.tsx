import { useMemo, useState, type ReactNode } from 'react'
import { CheckCheck, PackageSearch, Search, Truck } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { orderRecords } from '../data/commerceManagementData'

const sectionCard = 'rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5'

const formatCurrency = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`

const processGuides = [
  {
    key: 'matching',
    koTitle: '매칭작업',
    enTitle: 'Matching',
    koDesc: '주문 옵션과 창고 SKU를 연결하고 지정창고재고를 검증합니다.',
    enDesc: 'Maps order options to warehouse SKUs and validates designated stock.',
  },
  {
    key: 'invoice',
    koTitle: '송장입력',
    enTitle: 'Tracking Input',
    koDesc: '판매처 주문번호 기준으로 운송장, 선불/묶음/나누기 배송정책을 반영합니다.',
    enDesc: 'Applies tracking number and prepaid/bundle/split shipping rules per channel order.',
  },
  {
    key: 'shipment',
    koTitle: '상품발송',
    enTitle: 'Shipment',
    koDesc: '매칭 완료 SKU를 출고하고 진행현황에 발송 단계를 남깁니다.',
    enDesc: 'Ships matched SKUs and records shipment progress in the order lifecycle.',
  },
  {
    key: 'cs',
    koTitle: 'CS 연동',
    enTitle: 'CS Link',
    koDesc: '교환/미배송/배송지수정 이력을 주문 상세에 함께 누적합니다.',
    enDesc: 'Accumulates exchange, non-delivery, and address-change history in the order detail.',
  },
]

const channelOptions = ['전체', '고도몰']

export default function OrderManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const [orders, setOrders] = useState(orderRecords)
  const [selectedId, setSelectedId] = useState(orderRecords[0].id)
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState(channelOptions[0])

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return orders.filter((order) => {
      const channelMatched = channelFilter === '전체' || order.salesChannel === channelFilter
      const keywordMatched =
        !keyword ||
        [order.id, order.salesChannel, order.contact, order.receiver, order.orderer]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      return channelMatched && keywordMatched
    })
  }, [channelFilter, orders, search])

  const selectedOrder = filteredOrders.find((order) => order.id === selectedId) ?? filteredOrders[0] ?? null

  const totalAmount = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.amount, 0),
    [filteredOrders],
  )

  const totalQty = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + order.quantity, 0),
    [filteredOrders],
  )

  const csLinkedCount = useMemo(
    () => filteredOrders.filter((order) => order.csStatus.length > 0).length,
    [filteredOrders],
  )

  const appendProgress = (orderId: string, step: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id !== orderId || order.progress.includes(step)
          ? order
          : { ...order, progress: [...order.progress, step] },
      ),
    )
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{isKo ? '주문 관리' : 'Order Management'}</h1>
              <LanguageToggle />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {isKo
                ? '주문 목록 요약, 주문 상세, 매칭 재고, CS 상태를 한 화면에 배치했습니다.'
                : 'Shows order summary, detail, stock matching, and CS state in one workflow screen.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['매칭작업', '송장입력', '상품발송'].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => selectedOrder && appendProgress(selectedOrder.id, step)}
                disabled={!selectedOrder}
                className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isKo ? `${step} 반영` : `Apply ${step}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: isKo ? '총 주문건수' : 'Total Orders', value: filteredOrders.length, icon: <Truck className="h-5 w-5" /> },
            { label: isKo ? '합계 수량' : 'Total Qty', value: totalQty, icon: <PackageSearch className="h-5 w-5" /> },
            { label: isKo ? '합계 금액' : 'Total Amount', value: formatCurrency(totalAmount), icon: <CheckCheck className="h-5 w-5" /> },
            { label: isKo ? 'CS 연동 주문' : 'CS Linked Orders', value: csLinkedCount, icon: <Search className="h-5 w-5" /> },
          ].map((card) => (
            <div key={card.label} className={`${sectionCard} flex items-start justify-between`}>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-blue-200">{card.value}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">{card.icon}</div>
            </div>
          ))}
        </div>

        <div className={`${sectionCard} grid gap-4 lg:grid-cols-[1.2fr_0.8fr]`}>
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {isKo ? '주문 목록 요약' : 'Order Summary List'}
                </h2>
                <p className="text-sm text-slate-400">
                  {isKo ? '셀메이트 문서 기준 4건의 주문 스냅샷을 구성했습니다.' : 'Built from the four-order snapshot in the source document.'}
                </p>
              </div>
              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={isKo ? '주문번호/주문자/수령자 검색' : 'Search order / orderer / receiver'}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm"
                />
                <select
                  value={channelFilter}
                  onChange={(event) => setChannelFilter(event.target.value)}
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm"
                >
                  {(isKo ? channelOptions : ['All', 'GodoMall']).map((label, index) => (
                    <option key={label} value={channelOptions[index]}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-400">
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">{isKo ? '주문일자' : 'Order Date'}</th>
                    <th className="px-3 py-3">{isKo ? '판매처' : 'Channel'}</th>
                    <th className="px-3 py-3">{isKo ? '주문번호' : 'Order No.'}</th>
                    <th className="px-3 py-3">{isKo ? '연락처' : 'Contact'}</th>
                    <th className="px-3 py-3">{isKo ? '수량' : 'Qty'}</th>
                    <th className="px-3 py-3">{isKo ? '금액' : 'Amount'}</th>
                    <th className="px-3 py-3">{isKo ? '주문자/수령자' : 'Orderer / Receiver'}</th>
                    <th className="px-3 py-3">{isKo ? '배송방법' : 'Shipping'}</th>
                    <th className="px-3 py-3">{isKo ? '진행현황' : 'Progress'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedId(order.id)}
                      className={`cursor-pointer border-b border-slate-800 text-slate-200 ${
                        selectedOrder?.id === order.id ? 'bg-blue-500/10' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="px-3 py-3">{filteredOrders.length - index}</td>
                      <td className="px-3 py-3">{order.orderDate}</td>
                      <td className="px-3 py-3">{order.salesChannel}</td>
                      <td className="px-3 py-3 font-mono text-xs">{order.id}</td>
                      <td className="px-3 py-3">{order.contact}</td>
                      <td className="px-3 py-3">{order.quantity}</td>
                      <td className="px-3 py-3">{formatCurrency(order.amount)}</td>
                      <td className="px-3 py-3">{order.orderer} / {order.receiver}</td>
                      <td className="px-3 py-3">{order.shippingMethod}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.progress.map((step) => (
                            <span key={step} className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                              {step}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            {selectedOrder ? (
              <>
                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {isKo ? '주문 상세' : 'Order Detail'}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedOrder.id}</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300">
                    <InfoRow label={isKo ? '주문일자' : 'Order Date'} value={selectedOrder.orderDate} />
                    <InfoRow label={isKo ? '판매처' : 'Channel'} value={selectedOrder.salesChannel} />
                    <InfoRow label={isKo ? '연락처' : 'Contact'} value={selectedOrder.contact} />
                    <InfoRow label={isKo ? '주문자/수령자' : 'Orderer / Receiver'} value={`${selectedOrder.orderer} / ${selectedOrder.receiver}`} />
                    <InfoRow label={isKo ? '배송방법' : 'Shipping'} value={selectedOrder.shippingMethod} />
                    <InfoRow label={isKo ? '합계금액' : 'Amount'} value={formatCurrency(selectedOrder.amount)} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                  <p className="text-sm font-semibold text-white">{isKo ? 'C/S 상태' : 'CS Status'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(selectedOrder.csStatus.length > 0 ? selectedOrder.csStatus : [isKo ? '연결된 C/S 없음' : 'No linked CS']).map((status) => (
                      <span key={status} className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                        {status}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-slate-300">{selectedOrder.note}</p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-sm text-slate-400">
                {isKo ? '검색 조건에 맞는 주문이 없습니다.' : 'No orders match the current filters.'}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={`${sectionCard} space-y-4`}>
            <h2 className="text-lg font-semibold">{isKo ? '상품정보 / 재고매칭' : 'Item Info / Stock Match'}</h2>
            {selectedOrder ? selectedOrder.items.map((item) => (
              <div key={`${item.sku}-${item.optionLabel}`} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.sku}</p>
                    <p className="text-xs text-slate-400">{item.optionLabel}</p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                    {isKo ? `주문수량 x${item.qty}` : `Qty x${item.qty}`}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-slate-700 px-3 py-3">
                    <p className="text-slate-500">{isKo ? '지정창고재고' : 'Designated Stock'}</p>
                    <p className="mt-1 text-lg font-semibold">{item.designatedWarehouseStock}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 px-3 py-3">
                    <p className="text-slate-500">{isKo ? '매칭상태' : 'Match State'}</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">
                      {isKo ? '할당미진행 / 수동검토' : 'Unallocated / Manual Review'}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-sm text-slate-400">
                {isKo ? '표시할 매칭 품목이 없습니다.' : 'No matched items to display.'}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={sectionCard}>
              <h2 className="text-lg font-semibold">{isKo ? '진행현황 플로우' : 'Progress Flow'}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {processGuides.map((guide) => (
                  <div key={guide.key} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                    <p className="text-sm font-semibold text-white">
                      {isKo ? guide.koTitle : guide.enTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {isKo ? guide.koDesc : guide.enDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={sectionCard}>
              <h2 className="text-lg font-semibold">{isKo ? '선택 주문 상태 배지' : 'Selected Order Progress'}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedOrder?.progress.map((step) => (
                  <span key={step} className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-200">
                    {step}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-400">
                {isKo
                  ? '문서의 "매칭작업 송장입력 상품발송" 문자열을 개별 단계 배지로 분해해 추적할 수 있게 구현했습니다.'
                  : 'The compact progress string from the source document is decomposed into trackable lifecycle badges.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  )
}
