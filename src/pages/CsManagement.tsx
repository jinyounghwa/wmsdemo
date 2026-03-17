import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, ClipboardClock, MessageSquareText, RefreshCcw } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import {
  csHistoryRecords,
  csOrderRecords,
} from '../data/commerceManagementData'

const sectionCard = 'rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5'

const formatCurrency = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)} 원`

const csLogicCards = [
  {
    koTitle: '교환 / 맞교환',
    enTitle: 'Exchange / Advanced Exchange',
    koDesc: '교환요청이 들어오면 원주문은 취소/복구 이력을 남기고, 생성 주문은 별도 주문번호로 CS 히스토리에 연결됩니다.',
    enDesc: 'An exchange request leaves cancel/restore events on the source order and links the generated order under a separate CS trace.',
  },
  {
    koTitle: '미배송 / 배송중분실',
    enTitle: 'Non-delivery / Lost in Transit',
    koDesc: '금액변경과 재생성 주문이 동시에 발생하며, 처리완료 메모가 원주문과 생성주문 모두에 남습니다.',
    enDesc: 'Amount changes and regenerated orders are recorded together, with completion notes on both the source and generated order.',
  },
  {
    koTitle: '배송지수정 / 일반상담',
    enTitle: 'Address Change / General Consultation',
    koDesc: '묶어주기, 재묶음방지, 수령자 변경 같은 운영성 작업도 CS수와 메모에 누적됩니다.',
    enDesc: 'Operational fixes such as bundle control, anti-rebundle, and receiver change are accumulated as CS count and memo history.',
  },
]

export default function CsManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const [orders] = useState(csOrderRecords)
  const [histories] = useState(csHistoryRecords)
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0].id)
  const [selectedHistoryId, setSelectedHistoryId] = useState(histories[0].id)
  const [typeFilter, setTypeFilter] = useState('전체')

  const filteredHistories = useMemo(() => {
    if (typeFilter === '전체') return histories
    return histories.filter((history) => history.type.includes(typeFilter))
  }, [histories, typeFilter])

  const delayedCount = useMemo(
    () => orders.filter((order) => order.delayLabel).length,
    [orders],
  )

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0]
  const selectedHistory = filteredHistories.find((history) => history.id === selectedHistoryId) ?? filteredHistories[0] ?? null

  const historyTypeSummary = useMemo(() => {
    const summary = new Map<string, number>()
    histories.forEach((history) => {
      summary.set(history.type, (summary.get(history.type) ?? 0) + 1)
    })
    return Array.from(summary.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
  }, [histories])

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{isKo ? 'CS 관리' : 'CS Management'}</h1>
              <LanguageToggle />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {isKo
                ? '좌측 주문 CS 목록 8건과 우측 CS 히스토리 25건을 기준으로 주문별 상세와 메모를 추적합니다.'
                : 'Tracks eight CS-linked orders and twenty-five CS history entries with order detail and memo inspection.'}
            </p>
          </div>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm"
          >
            {['전체', '교환', '취소', '배송', '미배송', '반품', '일반상담'].map((type) => (
              <option key={type} value={type}>
                {isKo ? type : type === '전체' ? 'All' : type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: isKo ? '주문 CS 목록' : 'CS Orders', value: orders.length, icon: <ClipboardClock className="h-5 w-5" /> },
            { label: isKo ? 'CS 히스토리' : 'CS Histories', value: histories.length, icon: <MessageSquareText className="h-5 w-5" /> },
            { label: isKo ? '지연 주문' : 'Delayed Orders', value: delayedCount, icon: <AlertTriangle className="h-5 w-5" /> },
            { label: isKo ? '재처리/복구' : 'Restore / Retry', value: histories.filter((history) => history.type.includes('복구')).length, icon: <RefreshCcw className="h-5 w-5" /> },
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

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className={sectionCard}>
            <h2 className="text-lg font-semibold">{isKo ? '주문 CS 목록' : 'Order CS List'}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-400">
                  <tr className="border-b border-slate-700">
                    <th className="px-3 py-3">#</th>
                    <th className="px-3 py-3">{isKo ? 'CS여부' : 'CS'}</th>
                    <th className="px-3 py-3">{isKo ? '주문일자' : 'Order Date'}</th>
                    <th className="px-3 py-3">{isKo ? 'CS일자' : 'CS Date'}</th>
                    <th className="px-3 py-3">{isKo ? '지연' : 'Delay'}</th>
                    <th className="px-3 py-3">{isKo ? '상태' : 'Status'}</th>
                    <th className="px-3 py-3">{isKo ? 'CS수' : 'CS Count'}</th>
                    <th className="px-3 py-3">{isKo ? '판매처' : 'Channel'}</th>
                    <th className="px-3 py-3">{isKo ? '주문자/수령자' : 'Orderer / Receiver'}</th>
                    <th className="px-3 py-3">{isKo ? '합계수량' : 'Qty'}</th>
                    <th className="px-3 py-3">{isKo ? '합계금액' : 'Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className={`cursor-pointer border-b border-slate-800 text-slate-200 ${
                        selectedOrder.id === order.id ? 'bg-blue-500/10' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="px-3 py-3">{order.id}</td>
                      <td className="px-3 py-3">{order.hasCs ? 'Y' : 'N'}</td>
                      <td className="px-3 py-3">{order.orderDate}</td>
                      <td className="px-3 py-3">{order.csDate}</td>
                      <td className="px-3 py-3 text-amber-200">{order.delayLabel || '-'}</td>
                      <td className="px-3 py-3">{order.status || '-'}</td>
                      <td className="px-3 py-3">{order.csCount}</td>
                      <td className="px-3 py-3">{order.salesChannel}</td>
                      <td className="px-3 py-3">{order.orderer} / {order.receiver}</td>
                      <td className="px-3 py-3">{order.totalQty}</td>
                      <td className="px-3 py-3">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {isKo ? '주문별 상세 정보' : 'Selected Order Detail'}
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {selectedOrder.salesChannel} / {selectedOrder.orderer} / {selectedOrder.receiver}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <InfoRow label={isKo ? '주소' : 'Address'} value={selectedOrder.address} />
                <InfoRow label={isKo ? '연락처' : 'Contact'} value={selectedOrder.contact} />
                <InfoRow label={isKo ? '주문수 / 수량' : 'Orders / Qty'} value={`${selectedOrder.totalOrderCount} / ${selectedOrder.totalQty}`} />
                <InfoRow label={isKo ? '합계금액' : 'Amount'} value={formatCurrency(selectedOrder.totalAmount)} />
                <InfoRow label={isKo ? '택배사' : 'Carrier'} value={selectedOrder.carrier} />
                <InfoRow label={isKo ? '배송 / 발송' : 'Shipping / Shipment'} value={`${selectedOrder.shippingMethod || '미입력'} / ${selectedOrder.shippedAt}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-sm font-semibold text-white">{isKo ? '상태 해석' : 'Status Interpretation'}</p>
              <p className="mt-3 text-sm text-slate-300">
                {selectedOrder.status
                  ? selectedOrder.status
                  : isKo
                    ? '상태값이 비어 있는 주문은 히스토리 누적만 있고 별도 운영 플래그가 없는 상태입니다.'
                    : 'Blank status means the order has accumulated history but no dedicated operational flag.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={sectionCard}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{isKo ? 'CS 처리 히스토리' : 'CS History'}</h2>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                {isKo ? `${filteredHistories.length}건` : `${filteredHistories.length} rows`}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {filteredHistories.map((history) => (
                <button
                  key={history.id}
                  type="button"
                  onClick={() => setSelectedHistoryId(history.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left ${
                    selectedHistory.id === history.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{history.type}</p>
                      <p className="mt-1 text-xs text-slate-400">{history.happenedAt} · {history.customerName}</p>
                    </div>
                    <span className="rounded-full bg-slate-700 px-2 py-1 text-xs text-slate-200">
                      {history.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {selectedHistory ? (
              <div className={sectionCard}>
                <h2 className="text-lg font-semibold">{isKo ? '선택 히스토리 상세' : 'Selected History Detail'}</h2>
                <div className="mt-4 grid gap-3 text-sm text-slate-300">
                  <InfoRow label={isKo ? '일시' : 'Timestamp'} value={selectedHistory.happenedAt} />
                  <InfoRow label={isKo ? '고객' : 'Customer'} value={selectedHistory.customerName} />
                  <InfoRow label={isKo ? '주문번호' : 'Order No.'} value={selectedHistory.orderNo} />
                  <InfoRow label={isKo ? '작업자' : 'Worker'} value={selectedHistory.worker} />
                  <InfoRow label={isKo ? 'CS유형' : 'CS Type'} value={selectedHistory.type} />
                  <InfoRow label={isKo ? '처리상태' : 'Status'} value={selectedHistory.status} />
                </div>
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/40 p-4 text-sm text-slate-300">
                  {selectedHistory.memo || (isKo ? '메모 없음' : 'No memo')}
                </div>
              </div>
            ) : (
              <div className={sectionCard}>
                <h2 className="text-lg font-semibold">{isKo ? '선택 히스토리 상세' : 'Selected History Detail'}</h2>
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-sm text-slate-400">
                  {isKo ? '현재 필터에 해당하는 히스토리가 없습니다.' : 'No history entries match the current filter.'}
                </div>
              </div>
            )}

            <div className={sectionCard}>
              <h2 className="text-lg font-semibold">{isKo ? 'CS 유형 빈도' : 'Top CS Types'}</h2>
              <div className="mt-4 space-y-3">
                {historyTypeSummary.map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
                    <span className="text-sm text-slate-200">{type}</span>
                    <span className="text-sm font-semibold text-blue-200">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={sectionCard}>
              <h2 className="text-lg font-semibold">{isKo ? 'CS 처리 로직 설명' : 'CS Logic Guide'}</h2>
              <div className="mt-4 grid gap-3">
                {csLogicCards.map((card) => (
                  <div key={card.koTitle} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                    <p className="text-sm font-semibold text-white">
                      {isKo ? card.koTitle : card.enTitle}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {isKo ? card.koDesc : card.enDesc}
                    </p>
                  </div>
                ))}
              </div>
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
