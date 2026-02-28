import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { usePartnerStore } from '../store/partnerStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useDispatchStore } from '../store/dispatchStore'

const PAGE_SIZES = [20, 50, 100]

export default function DispatchExecutionSearchFile() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)
  const items = useInventoryStore((state) => state.items)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const adjustStock = useInventoryStore((state) => state.adjustStock)
  const createBulkDispatch = useDispatchStore((state) => state.createBulkDispatch)

  const [owner, setOwner] = useState('')
  const [location, setLocation] = useState('')
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [attr, setAttr] = useState('')
  const [vendor, setVendor] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(50)

  const rows = useMemo(() => {
    if (!owner) return []
    return items
      .map((item, idx) => {
        const reserved = getReservedQty(item.sku)
        const available = Math.max(0, item.currentQty - reserved)
        return {
          id: `${item.sku}-${item.zone}-${item.rack}-${item.bin}`,
          owner,
          sku: item.sku,
          name: item.name,
          attr: `${item.styleCode ?? '-'} / ${item.color ?? '-'} / ${item.size ?? '-'}`,
          vendor: vendors[idx % Math.max(1, vendors.length)] ?? '-',
          expiry: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
          lot: `LOT-${item.sku.replace('SKU-', '')}-${String(idx % 9).padStart(2, '0')}`,
          location: `${item.zone}-${item.rack}-${item.bin}`,
          status: item.status,
          stock: item.currentQty,
          reserved,
          available,
        }
      })
      .filter((row) => {
        const locOk = !location || row.location.toLowerCase().includes(location.toLowerCase())
        const skuOk = !sku || row.sku.toLowerCase().includes(sku.toLowerCase())
        const nameOk = !name || row.name.toLowerCase().includes(name.toLowerCase())
        const attrOk = !attr || row.attr.toLowerCase().includes(attr.toLowerCase())
        const vendorOk = vendor === 'all' || row.vendor === vendor
        return locOk && skuOk && nameOk && attrOk && vendorOk
      })
  }, [owner, items, vendors, getReservedQty, location, sku, name, attr, vendor])

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage))
  const paged = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const executeDispatch = () => {
    const ids = Array.from(selected)
    if (ids.length === 0) return

    const payloads = rows
      .filter((row) => ids.includes(row.id))
      .map((row) => ({
        owner: row.owner,
        sku: row.sku,
        name: row.name,
        qty: Math.max(1, Math.min(5, row.available || 1)),
        location: row.location,
        note: isKo ? '검색/파일 반출' : 'Search/File dispatch',
      }))

    payloads.forEach((row) => {
      adjustStock({
        sku: row.sku,
        qtyChange: -row.qty,
        type: 'outbound',
        reason: isKo ? '반출 실행(검색/파일)' : 'Dispatch execution (search/file)',
      })
    })

    createBulkDispatch(payloads)
    setMessage(t(`반출 실행 완료: ${payloads.length}건`, `Dispatch executed: ${payloads.length}`))
    setSelected(new Set())
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('반출 실행(검색/파일)', 'Dispatch Execution (Search/File)')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('화주 필수 선택 후 검색 또는 파일 업로드로 반출을 실행합니다.', 'Select owner first, then execute dispatch via search or file upload.')}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-7 gap-2">
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">{t('화주명 선택(필수)', 'Select owner (required)')}</option>
            {customers.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('로케이션명', 'Location')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={attr} onChange={(e) => setAttr(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="all">{t('공급처: 전체', 'Vendor: All')}</option>
            {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={() => { setLocation(''); setSku(''); setName(''); setAttr(''); setVendor('all'); setSelected(new Set()); setMessage('') }} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">{t('검색 초기화', 'Reset')}</button>
        </div>

        {!owner ? (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-12 text-center text-slate-400">{t('데이터를 불러오기 위해, 검색 조건 설정이 필요합니다. (화주명 필수)', 'Search conditions are required to load data. (Owner required)')}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-slate-300">{t(`총 ${rows.length}건 / 선택 ${selected.size}건`, `Total ${rows.length} / Selected ${selected.size}`)}</div>
              <div className="flex gap-2">
                <button onClick={executeDispatch} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('반출 실행', 'Execute Dispatch')}</button>
                <button onClick={() => setMessage(t('파일 처리(데모): CSV 일괄 반출 요청', 'File process (demo): batch CSV dispatch request'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('파일로 처리', 'Process by File')}</button>
              </div>
            </div>

            {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
              <table className="w-full text-sm min-w-[1400px]">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">{t('선택', 'Select')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('품목 코드', 'Item code')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('품목명/품목 속성', 'Item/Attributes')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('공급처', 'Vendor')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('유통기한', 'Expiry')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('로트번호', 'Lot')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('로케이션', 'Location')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('상태', 'Status')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('재고', 'Stock')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('예약', 'Reserved')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('반출 가능', 'Dispatchable')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={(e) => {
                            const next = new Set(selected)
                            e.target.checked ? next.add(row.id) : next.delete(row.id)
                            setSelected(next)
                          }}
                          className="accent-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">{row.owner}</td>
                      <td className="px-4 py-3 font-mono text-blue-300">{row.sku}</td>
                      <td className="px-4 py-3">{row.name}<div className="text-xs text-slate-500">{row.attr}</div></td>
                      <td className="px-4 py-3">{row.vendor}</td>
                      <td className="px-4 py-3">{row.expiry}</td>
                      <td className="px-4 py-3">{row.lot}</td>
                      <td className="px-4 py-3">{row.location}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3 text-right">{row.stock}</td>
                      <td className="px-4 py-3 text-right">{row.reserved}</td>
                      <td className="px-4 py-3 text-right text-emerald-300">{row.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paged.length === 0 && <div className="p-10 text-center text-slate-500">{t('데이터가 없습니다.', 'No data.')}</div>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-slate-400">{t(`페이지 ${page} / ${totalPages}`, `Page ${page} / ${totalPages}`)}</div>
              <div className="flex items-center gap-2">
                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1) }} className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg">
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{isKo ? `${size}개씩 보기` : `${size} rows`}</option>)}
                </select>
                <button disabled={page <= 1} onClick={() => setPage(1)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('처음', 'First')}</button>
                <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('이전', 'Prev')}</button>
                <button disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('다음', 'Next')}</button>
                <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className="px-3 py-1.5 bg-slate-700 rounded disabled:opacity-40">{t('마지막', 'Last')}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
