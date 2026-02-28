import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'

const PAGE_SIZES = [20, 50, 100]

const statusBadge: Record<string, string> = {
  normal: 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30',
  low: 'text-rose-300 bg-rose-500/10 border border-rose-500/30',
  excess: 'text-sky-300 bg-sky-500/10 border border-sky-500/30',
  defect: 'text-slate-300 bg-slate-500/10 border border-slate-500/30',
}

const statusLabel: Record<string, string> = {
  normal: '가용',
  low: '가용 부족',
  excess: '과다',
  defect: '불량/격리',
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

export default function StockItemList() {
  const items = useInventoryStore((state) => state.items)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const getAvailableQty = useInventoryStore((state) => state.getAvailableQty)
  const customers = usePartnerStore((state) => state.customers)

  const [owner, setOwner] = useState(customers[0] ?? '')
  const [skuKeyword, setSkuKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const skuOk = skuKeyword.trim() === '' || item.sku.toLowerCase().includes(skuKeyword.toLowerCase())
      const nameOk = nameKeyword.trim() === '' || item.name.toLowerCase().includes(nameKeyword.toLowerCase())
      const attrs = `${item.styleCode ?? ''} ${item.color ?? ''} ${item.size ?? ''} ${item.collection ?? ''}`.toLowerCase()
      const attrOk = attrKeyword.trim() === '' || attrs.includes(attrKeyword.toLowerCase())
      return skuOk && nameOk && attrOk
    })
  }, [items, skuKeyword, nameKeyword, attrKeyword])

  const totalQty = filtered.reduce((sum, item) => sum + item.currentQty, 0)
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">품목별 재고 목록</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">SKU 단위 통합 재고 조회 · 문서 경로 `/stock/items` 반영</p>
          </div>
          <button
            onClick={() =>
              downloadCsv(
                [
                  ['화주', '품목코드', '품목명', 'Zone', '총재고', '예약', '가용', '상태', '최종이동일'],
                  ...filtered.map((item) => [
                    owner,
                    item.sku,
                    item.name,
                    item.zone,
                    String(item.currentQty),
                    String(getReservedQty(item.sku)),
                    String(getAvailableQty(item.sku)),
                    statusLabel[item.status],
                    item.lastMovedAt,
                  ]),
                ],
                `item-stock-list-${new Date().toISOString().slice(0, 10)}.csv`,
              )
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
          >
            엑셀 다운로드(CSV)
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-3">
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            {customers.map((customer) => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>
          <input value={skuKeyword} onChange={(e) => { setSkuKeyword(e.target.value); setPage(1) }} placeholder="품목코드" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={nameKeyword} onChange={(e) => { setNameKeyword(e.target.value); setPage(1) }} placeholder="품목명" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attrKeyword} onChange={(e) => { setAttrKeyword(e.target.value); setPage(1) }} placeholder="품목속성(스타일/컬러/사이즈)" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <button
            onClick={() => {
              setSkuKeyword('')
              setNameKeyword('')
              setAttrKeyword('')
              setPage(1)
            }}
            className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            검색 초기화
          </button>
        </div>

        <div className="text-sm text-slate-300">총 {filtered.length.toLocaleString()}건 · 총 재고 {totalQty.toLocaleString()} EA</div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">화주명</th>
                <th className="text-left px-4 py-3 font-medium">품목코드</th>
                <th className="text-left px-4 py-3 font-medium">품목명/속성</th>
                <th className="text-left px-4 py-3 font-medium">Zone</th>
                <th className="text-right px-4 py-3 font-medium">총재고</th>
                <th className="text-right px-4 py-3 font-medium">예약</th>
                <th className="text-right px-4 py-3 font-medium">가용</th>
                <th className="text-left px-4 py-3 font-medium">상태</th>
                <th className="text-left px-4 py-3 font-medium">최종 이동일</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => (
                <tr key={item.sku} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{owner}</td>
                  <td className="px-4 py-3 font-mono text-blue-300">{item.sku}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.styleCode ?? '-'} / {item.color ?? '-'} / {item.size ?? '-'}</div>
                  </td>
                  <td className="px-4 py-3">{item.zone}</td>
                  <td className="px-4 py-3 text-right">{item.currentQty.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-amber-300">{getReservedQty(item.sku).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-sky-300">{getAvailableQty(item.sku).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusBadge[item.status]}`}>{statusLabel[item.status]}</span></td>
                  <td className="px-4 py-3 text-slate-400">{item.lastMovedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {paged.length === 0 && <div className="p-10 text-center text-slate-500">검색 결과가 없습니다.</div>}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">페이지 {page} / {totalPages}</div>
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
                <option key={size} value={size}>{size}개씩 보기</option>
              ))}
            </select>
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">이전</button>
            <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">다음</button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
