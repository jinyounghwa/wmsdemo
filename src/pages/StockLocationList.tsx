import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'
import { useLanguage } from '../i18n/LanguageContext'

const PAGE_SIZES = [20, 50, 100]

type Row = {
  id: string
  owner: string
  zone: string
  location: string
  status: '가용' | '검수 대기' | '불량'
  sku: string
  name: string
  vendor: string
  expiryDate: string
  lotNo: string
  totalQty: number
  reservedQty: number
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

export default function StockLocationList() {
  const { locale } = useLanguage()
  const items = useInventoryStore((state) => state.items)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const vendors = usePartnerStore((state) => state.vendors)
  const customers = usePartnerStore((state) => state.customers)

  const [owner, setOwner] = useState(customers[0] ?? '')
  const [locationKeyword, setLocationKeyword] = useState('')
  const [skuKeyword, setSkuKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const rows = useMemo<Row[]>(() => {
    return items.map((item, index) => {
      const reserved = getReservedQty(item.sku)
      const id = `${item.sku}-${item.zone}-${item.rack}-${item.bin}`
      const baseMonth = String((index % 9) + 1).padStart(2, '0')
      const baseDay = String((index % 27) + 1).padStart(2, '0')
      return {
        id,
        owner,
        zone: item.zone,
        location: `${item.zone}-${item.rack}-${item.bin}`,
        status: item.status === 'defect' ? '불량' : item.status === 'low' ? '검수 대기' : '가용',
        sku: item.sku,
        name: item.name,
        vendor: vendors[index % vendors.length] ?? '자사',
        expiryDate: `2026-${baseMonth}-${baseDay}`,
        lotNo: `LOT-${item.sku.replace('SKU-', '')}-${String(index % 8).padStart(2, '0')}`,
        totalQty: item.currentQty,
        reservedQty: reserved,
      }
    })
  }, [items, getReservedQty, owner, vendors])

  const filtered = rows.filter((row) => {
    const locationOk = locationKeyword.trim() === '' || row.location.toLowerCase().includes(locationKeyword.toLowerCase())
    const skuOk = skuKeyword.trim() === '' || row.sku.toLowerCase().includes(skuKeyword.toLowerCase())
    const nameOk = nameKeyword.trim() === '' || row.name.toLowerCase().includes(nameKeyword.toLowerCase())
    return locationOk && skuOk && nameOk
  })

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const totalQty = filtered.reduce((sum, row) => sum + row.totalQty, 0)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{locale === 'ko' ? '로케이션별 재고 목록' : 'Location Stock List'}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">
              {locale === 'ko'
                ? '위치 단위 재고 명세 조회 · 문서 경로 `/stock/locations` 반영'
                : 'Location-based stock details (`/stock/locations`).'}
            </p>
          </div>
          <button
            onClick={() =>
              downloadCsv(
                [
                  ['화주명', 'Zone', '로케이션', '상태', '품목코드', '품목명', '공급처', '유통기한', '로트번호', '총재고', '예약'],
                  ...filtered.map((row) => [
                    row.owner,
                    row.zone,
                    row.location,
                    row.status,
                    row.sku,
                    row.name,
                    row.vendor,
                    row.expiryDate,
                    row.lotNo,
                    String(row.totalQty),
                    String(row.reservedQty),
                  ]),
                ],
                `location-stock-list-${new Date().toISOString().slice(0, 10)}.csv`,
              )
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            {locale === 'ko' ? '엑셀 다운로드(CSV)' : 'Download CSV'}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {customers.map((customer) => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>
          <input value={locationKeyword} onChange={(e) => { setLocationKeyword(e.target.value); setPage(1) }} placeholder={locale === 'ko' ? '로케이션명' : 'Location'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={skuKeyword} onChange={(e) => { setSkuKeyword(e.target.value); setPage(1) }} placeholder={locale === 'ko' ? '품목코드' : 'Item code'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={nameKeyword} onChange={(e) => { setNameKeyword(e.target.value); setPage(1) }} placeholder={locale === 'ko' ? '품목명' : 'Item name'} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button
            onClick={() => {
              setLocationKeyword('')
              setSkuKeyword('')
              setNameKeyword('')
              setPage(1)
            }}
            className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            {locale === 'ko' ? '검색 초기화' : 'Reset'}
          </button>
        </div>

        <div className="text-sm text-slate-300">
          {locale === 'ko'
            ? `총 ${filtered.length.toLocaleString()}건 · 총 재고 ${totalQty.toLocaleString()} EA`
            : `Total ${filtered.length.toLocaleString()} · Qty ${totalQty.toLocaleString()} EA`}
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '화주명' : 'Owner'}</th>
                <th className="text-left px-4 py-3 font-medium">Zone</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '로케이션' : 'Location'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '상태' : 'Status'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목코드' : 'Item code'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '품목명' : 'Item name'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '공급처' : 'Vendor'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '유통기한' : 'Expiry'}</th>
                <th className="text-left px-4 py-3 font-medium">{locale === 'ko' ? '로트번호' : 'Lot'}</th>
                <th className="text-right px-4 py-3 font-medium">{locale === 'ko' ? '총 재고' : 'Total qty'}</th>
                <th className="text-right px-4 py-3 font-medium">{locale === 'ko' ? '예약' : 'Reserved'}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{row.owner}</td>
                  <td className="px-4 py-3">{row.zone}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{row.location}</td>
                  <td className="px-4 py-3">
                    {locale === 'ko' ? row.status : ({ 가용: 'Available', '검수 대기': 'Inspection', 불량: 'Defect' }[row.status] ?? row.status)}
                  </td>
                  <td className="px-4 py-3 font-mono">{row.sku}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.vendor}</td>
                  <td className="px-4 py-3">{row.expiryDate}</td>
                  <td className="px-4 py-3">{row.lotNo}</td>
                  <td className="px-4 py-3 text-right">{row.totalQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-300">{row.reservedQty.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <div className="p-10 text-center text-slate-500">{locale === 'ko' ? '검색 결과가 없습니다.' : 'No results.'}</div>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">{locale === 'ko' ? `페이지 ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}</div>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                const next = Number(e.target.value)
                setRowsPerPage(next)
                setPage(1)
              }}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>{locale === 'ko' ? `${size}개씩 보기` : `${size} rows`}</option>
              ))}
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
