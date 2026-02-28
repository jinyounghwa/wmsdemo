import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'
import { useMovementOpsStore } from '../store/movementOpsStore'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZES = [20, 50, 100]
const RANGE_OPTIONS = ['today', '7d', '30d', 'custom'] as const

type RangeType = (typeof RANGE_OPTIONS)[number]

type HistoryType =
  | '전체'
  | '입고'
  | '출고'
  | '이동'
  | '반출'
  | 'B2B 반품'
  | 'B2C 반품'
  | '조정'
  | '입고 취소'
  | '반출 취소'
  | '반품 취소'
  | '조정 취소'

const typeFromTx: Record<string, HistoryType> = {
  inbound: '입고',
  outbound: '출고',
  relocation: '이동',
  adjustment: '조정',
  allocation: '전체',
}

const downloadCsv = (rows: string[][], filename: string) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const today = new Date().toISOString().slice(0, 10)
const beforeDays = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

export default function StockHistory() {
  const { locale } = useLanguage()
  const transactions = useInventoryStore((state) => state.transactions)
  const items = useInventoryStore((state) => state.items)
  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)
  const movementOrders = useMovementOpsStore((state) => state.orders)

  const [range, setRange] = useState<RangeType>('today')
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [owner, setOwner] = useState(customers[0] ?? '')
  const [zone, setZone] = useState('전체')
  const [location, setLocation] = useState('')
  const [skuKeyword, setSkuKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [vendor, setVendor] = useState('전체')
  const [historyType, setHistoryType] = useState<HistoryType>('전체')
  const [extraFilters, setExtraFilters] = useState<string[]>([])
  const [extraValue, setExtraValue] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const [dateStart, dateEnd] = useMemo(() => {
    if (range === 'today') return [today, today]
    if (range === '7d') return [beforeDays(7), today]
    if (range === '30d') return [beforeDays(30), today]
    return [fromDate, toDate]
  }, [range, fromDate, toDate])

  const rows = useMemo(() => {
    const fromTx = transactions.map((tx, idx) => {
      const item = items.find((it) => it.sku === tx.sku)
      const txType = typeFromTx[tx.type] ?? '전체'
      const worker = tx.type === 'relocation' ? 'forklift-01' : tx.type === 'outbound' ? 'ship-op-01' : 'system'
      const zoneLoc = tx.toLocation ?? tx.fromLocation ?? `${item?.zone ?? '-'}-${item?.rack ?? '-'}-${item?.bin ?? '-'}`
      return {
        id: tx.id,
        at: tx.date,
        owner,
        zone: zoneLoc.split('-')[0] ?? '-',
        location: zoneLoc,
        sku: tx.sku,
        name: tx.name,
        attr: `${item?.styleCode ?? '-'} / ${item?.color ?? '-'} / ${item?.size ?? '-'}`,
        vendor: vendors[idx % vendors.length] ?? '자사',
        lot: `LOT-${tx.sku.replace('SKU-', '')}-${String(idx % 9).padStart(2, '0')}`,
        expiry: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
        qty: Math.abs(tx.qtyChange),
        type: txType,
        workLocation: zoneLoc,
        worker,
        memo: tx.reason,
      }
    })

    const fromMovement = movementOrders
      .filter((order) => order.status === 'done')
      .map((order, idx) => ({
        id: `MVH-${order.id}`,
        at: order.completedAt ?? order.createdAt,
        owner: order.owner,
        zone: order.toLocation.split('-')[0] ?? '-',
        location: order.toLocation,
        sku: order.sku,
        name: order.name,
        attr: '-',
        vendor: vendors[(idx + 3) % vendors.length] ?? '자사',
        lot: `LOT-${order.sku.replace('SKU-', '')}-${String((idx + 4) % 9).padStart(2, '0')}`,
        expiry: `2026-${String(((idx + 2) % 12) + 1).padStart(2, '0')}-${String(((idx + 5) % 27) + 1).padStart(2, '0')}`,
        qty: order.qty,
        type: '이동' as HistoryType,
        workLocation: `${order.fromLocation} → ${order.toLocation}`,
        worker: 'move-op-01',
        memo: order.note ?? '이동 확정',
      }))

    return [...fromMovement, ...fromTx].sort((a, b) => (a.at < b.at ? 1 : -1))
  }, [transactions, items, movementOrders, owner, vendors])

  const filtered = rows.filter((row) => {
    const dateOk = row.at >= dateStart && row.at <= dateEnd
    const zoneOk = zone === '전체' || row.zone === zone
    const locationOk = location.trim() === '' || row.location.toLowerCase().includes(location.toLowerCase())
    const skuOk = skuKeyword.trim() === '' || row.sku.toLowerCase().includes(skuKeyword.toLowerCase())
    const nameOk = nameKeyword.trim() === '' || row.name.toLowerCase().includes(nameKeyword.toLowerCase())
    const attrOk = attrKeyword.trim() === '' || row.attr.toLowerCase().includes(attrKeyword.toLowerCase())
    const vendorOk = vendor === '전체' || row.vendor === vendor
    const typeOk = historyType === '전체' || row.type === historyType
    const extraOk = extraValue.trim() === '' || row.memo.toLowerCase().includes(extraValue.toLowerCase()) || row.id.toLowerCase().includes(extraValue.toLowerCase())
    return dateOk && zoneOk && locationOk && skuOk && nameOk && attrOk && vendorOk && typeOk && extraOk
  })

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{locale === 'ko' ? '입출고 및 이동 내역' : 'Inbound/Outbound & Movement History'}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {locale === 'ko'
                ? '모든 재고 변동 이력을 통합 조회합니다. (`/stock/history`)'
                : 'Integrated view of all inventory movements and transactions. (`/stock/history`)'}
            </p>
          </div>
          <button
            onClick={() =>
              downloadCsv(
                [
                  ['일시', '화주명', 'Zone/로케이션', '품목코드', '품목명/속성', '공급처', '유통기한/로트번호', '수량', '구분', '작업 위치', '작업자', '메모'],
                  ...filtered.map((row) => [
                    row.at,
                    row.owner,
                    `${row.zone}/${row.location}`,
                    row.sku,
                    `${row.name} (${row.attr})`,
                    row.vendor,
                    `${row.expiry}/${row.lot}`,
                    String(row.qty),
                    row.type,
                    row.workLocation,
                    row.worker,
                    row.memo,
                  ]),
                ],
                `stock-history-${today}.csv`,
              )
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            {locale === 'ko' ? '엑셀 다운로드(CSV)' : 'Download CSV'}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
            <select value={range} onChange={(e) => setRange(e.target.value as RangeType)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="today">{locale === 'ko' ? '오늘' : 'Today'}</option>
              <option value="7d">{locale === 'ko' ? '지난 7일' : 'Last 7 days'}</option>
              <option value="30d">{locale === 'ko' ? '지난 30일' : 'Last 30 days'}</option>
              <option value="custom">{locale === 'ko' ? '사용자 지정' : 'Custom'}</option>
            </select>
            {range === 'custom' && (
              <>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </>
            )}
            <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {customers.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {['전체', 'A', 'B', 'C', 'D'].map((z) => <option key={z}>{z === '전체' ? (locale === 'ko' ? '전체' : 'All') : z}</option>)}
            </select>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={locale === 'ko' ? '로케이션명' : 'Location'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={skuKeyword} onChange={(e) => setSkuKeyword(e.target.value)} placeholder={locale === 'ko' ? '품목 코드' : 'Item code'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder={locale === 'ko' ? '품목명' : 'Item name'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <input value={attrKeyword} onChange={(e) => setAttrKeyword(e.target.value)} placeholder={locale === 'ko' ? '품목 속성' : 'Item attributes'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option>{locale === 'ko' ? '전체' : 'All'}</option>
              {vendors.map((v) => <option key={v}>{v}</option>)}
            </select>
            <select value={historyType} onChange={(e) => setHistoryType(e.target.value as HistoryType)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {['전체', '입고', '출고', '이동', '반출', 'B2B 반품', 'B2C 반품', '조정', '입고 취소', '반출 취소', '반품 취소', '조정 취소'].map((t) => (
                <option key={t}>
                  {locale === 'ko'
                    ? t
                    : ({
                        전체: 'All',
                        입고: 'Inbound',
                        출고: 'Outbound',
                        이동: 'Movement',
                        반출: 'Takeout',
                        'B2B 반품': 'B2B Return',
                        'B2C 반품': 'B2C Return',
                        조정: 'Adjustment',
                        '입고 취소': 'Inbound Cancel',
                        '반출 취소': 'Takeout Cancel',
                        '반품 취소': 'Return Cancel',
                        '조정 취소': 'Adjustment Cancel',
                      }[t] ?? t)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const options = ['송장번호', '반품 송장번호', '입고 오더번호', '출고 오더번호', '이동 오더번호', '반출 오더번호', 'B2C 반품 오더번호', 'B2B 반품 오더번호', '조정 오더번호']
                  const next = options.find((option) => !extraFilters.includes(option))
                  if (!next) return
                  setExtraFilters((prev) => [...prev, next])
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                {locale === 'ko' ? '+ 필터추가' : '+ Add Filter'}
              </button>
              {extraFilters.map((f) => (
                <span key={f} className="text-xs px-2 py-1 rounded bg-slate-700 border border-slate-600">{f}</span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={extraValue} onChange={(e) => setExtraValue(e.target.value)} placeholder={locale === 'ko' ? '추가필터 값' : 'Extra filter value'} className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button
                onClick={() => {
                  setRange('today')
                  setFromDate(today)
                  setToDate(today)
                  setZone('전체')
                  setLocation('')
                  setSkuKeyword('')
                  setNameKeyword('')
                  setAttrKeyword('')
                  setVendor('전체')
                  setHistoryType('전체')
                  setExtraFilters([])
                  setExtraValue('')
                  setPage(1)
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                {locale === 'ko' ? '검색 초기화' : 'Reset'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-sm text-slate-300">
          {locale === 'ko' ? `총 ${filtered.length.toLocaleString()}건` : `Total ${filtered.length.toLocaleString()}`}
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[1400px]">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '일시' : 'Datetime'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '화주명' : 'Owner'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? 'Zone/로케이션' : 'Zone/Location'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목 코드' : 'Item code'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목명/품목 속성' : 'Item/Attributes'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '공급처' : 'Vendor'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '유통기한/로트번호' : 'Expiry/Lot'}</th>
                <th className="text-right px-4 py-3 font-medium">{locale === 'ko' ? '수량' : 'Qty'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '구분' : 'Type'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '작업 위치' : 'Work location'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '작업자' : 'Worker'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '메모' : 'Memo'}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{row.at}</td>
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3">{row.zone} / {row.location}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{row.sku}</td>
                  <td className="px-4 py-3">{row.name}<div className="text-xs text-slate-500">{row.attr}</div></td>
                  <td className="px-4 py-3">{row.vendor}</td>
                  <td className="px-4 py-3">{row.expiry} / {row.lot}</td>
                  <td className="px-4 py-3 text-right">{row.qty}</td>
                  <td className="px-4 py-3">{row.type}</td>
                  <td className="px-4 py-3">{row.workLocation}</td>
                  <td className="px-4 py-3">{row.worker}</td>
                  <td className="px-4 py-3">{row.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <div className="p-10 text-center text-slate-500">{locale === 'ko' ? '데이터가 없습니다.' : 'No data.'}</div>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">{locale === 'ko' ? `페이지 ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}</div>
          <div className="flex items-center gap-2">
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }} className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg">
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{locale === 'ko' ? `${size}개씩 보기` : `${size} rows`}</option>)}
            </select>
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '이전' : 'Prev'}
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">
              {locale === 'ko' ? '다음' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
