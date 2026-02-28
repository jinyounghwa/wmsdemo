import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useInventoryStore } from '../store/inventoryStore'
import { usePartnerStore } from '../store/partnerStore'

const PAGE_SIZES = [20, 50, 100]

export default function ItemBarcodePrint() {
  const items = useInventoryStore((state) => state.items)
  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)

  const [owner, setOwner] = useState('')
  const [skuKeyword, setSkuKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [vendor, setVendor] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => {
    if (!owner) return []
    return items.filter((item) => {
      const skuOk = skuKeyword.trim() === '' || item.sku.toLowerCase().includes(skuKeyword.toLowerCase())
      const nameOk = nameKeyword.trim() === '' || item.name.toLowerCase().includes(nameKeyword.toLowerCase())
      const attrs = `${item.styleCode ?? ''} ${item.color ?? ''} ${item.size ?? ''}`.toLowerCase()
      const attrOk = attrKeyword.trim() === '' || attrs.includes(attrKeyword.toLowerCase())
      const vendorOk = vendor.trim() === '' || (vendors.findIndex((v) => v === vendor) + item.sku.length) % 2 === 0
      return skuOk && nameOk && attrOk && vendorOk
    })
  }, [owner, items, skuKeyword, nameKeyword, attrKeyword, vendor, vendors])

  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))

  const allChecked = paged.length > 0 && paged.every((item) => selected.has(item.sku))

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">품목 바코드 출력</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">문서 경로 `/stock/barcode` 반영 · 화주 필터 선택 후 조회</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (selected.size === 0) return
                setMessage(`출력 요청 완료: ${selected.size}개 품목 라벨`) 
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              출력
            </button>
            <button
              onClick={() => setMessage('출력 템플릿 관리 화면으로 이동(데모): 창고 설정 > 출력 템플릿 관리')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
            >
              출력 템플릿 관리
            </button>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-3">
          <select value={owner} onChange={(e) => { setOwner(e.target.value); setPage(1) }} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">화주명 선택(필수)</option>
            {customers.map((customer) => (
              <option key={customer} value={customer}>{customer}</option>
            ))}
          </select>
          <input value={skuKeyword} onChange={(e) => { setSkuKeyword(e.target.value); setPage(1) }} placeholder="품목코드" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={nameKeyword} onChange={(e) => { setNameKeyword(e.target.value); setPage(1) }} placeholder="품목명" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attrKeyword} onChange={(e) => { setAttrKeyword(e.target.value); setPage(1) }} placeholder="품목속성" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={vendor} onChange={(e) => { setVendor(e.target.value); setPage(1) }} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">공급처 전체</option>
            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <button
            onClick={() => {
              setSkuKeyword('')
              setNameKeyword('')
              setAttrKeyword('')
              setVendor('')
              setSelected(new Set())
              setPage(1)
            }}
            className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            검색 초기화
          </button>
        </div>

        {message && <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{message}</div>}

        {!owner ? (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-12 text-center text-slate-400">
            데이터를 불러오기 위해, 화주명 검색 조건 설정이 필요합니다.
          </div>
        ) : (
          <>
            <div className="text-sm text-slate-300">총 {filtered.length.toLocaleString()}건 / {selected.size.toLocaleString()}건 선택</div>

            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => {
                          const next = new Set(selected)
                          if (e.target.checked) {
                            paged.forEach((item) => next.add(item.sku))
                          } else {
                            paged.forEach((item) => next.delete(item.sku))
                          }
                          setSelected(next)
                        }}
                        className="accent-blue-500"
                      />
                    </th>
                    <th className="text-left px-4 py-3 font-medium">화주명</th>
                    <th className="text-left px-4 py-3 font-medium">품목코드</th>
                    <th className="text-left px-4 py-3 font-medium">품목명/속성</th>
                    <th className="text-left px-4 py-3 font-medium">바코드</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((item) => (
                    <tr key={item.sku} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(item.sku)}
                          onChange={(e) => {
                            const next = new Set(selected)
                            e.target.checked ? next.add(item.sku) : next.delete(item.sku)
                            setSelected(next)
                          }}
                          className="accent-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">{owner}</td>
                      <td className="px-4 py-3 font-mono text-blue-300">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.styleCode ?? '-'} / {item.color ?? '-'} / {item.size ?? '-'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono">{`BC-${item.sku.replace('SKU-', '')}`}</td>
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
          </>
        )}
      </div>
    </Layout>
  )
}
