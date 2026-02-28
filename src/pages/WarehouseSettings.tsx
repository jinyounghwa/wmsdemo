import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useWarehouseSettingsStore } from '../store/warehouseSettingsStore'

const pages = [
  { path: '/warehouse/location', key: 'location' },
  { path: '/warehouse/accounts', key: 'accounts' },
  { path: '/warehouse/shop', key: 'shop' },
  { path: '/warehouse/supplier', key: 'supplier' },
  { path: '/warehouse/product', key: 'product' },
  { path: '/warehouse/assignment', key: 'assignment' },
  { path: '/warehouse/total-picking', key: 'total-picking' },
  { path: '/warehouse/template', key: 'template' },
] as const

type PageKey = (typeof pages)[number]['key']
const PAGE_SIZES = [20, 50, 100]

export default function WarehouseSettings() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)
  const location = useLocation()
  const current = (pages.find((entry) => location.pathname === entry.path)?.key ?? 'location') as PageKey

  const locations = useWarehouseSettingsStore((state) => state.locations)
  const accounts = useWarehouseSettingsStore((state) => state.accounts)
  const shops = useWarehouseSettingsStore((state) => state.shops)
  const suppliers = useWarehouseSettingsStore((state) => state.suppliers)
  const products = useWarehouseSettingsStore((state) => state.products)
  const rules = useWarehouseSettingsStore((state) => state.rules)
  const strategies = useWarehouseSettingsStore((state) => state.strategies)
  const templates = useWarehouseSettingsStore((state) => state.templates)
  const totalPickingStations = useWarehouseSettingsStore((state) => state.totalPickingStations)
  const totalPickingInvoiceLimit = useWarehouseSettingsStore((state) => state.totalPickingInvoiceLimit)
  const totalPickingUseRemainBlock = useWarehouseSettingsStore((state) => state.totalPickingUseRemainBlock)
  const totalPickingDefaultTemplate = useWarehouseSettingsStore((state) => state.totalPickingDefaultTemplate)
  const updateTotalPicking = useWarehouseSettingsStore((state) => state.updateTotalPicking)

  const [zoneKeyword, setZoneKeyword] = useState('all')
  const [locationKeyword, setLocationKeyword] = useState('')
  const [stockState, setStockState] = useState<'all' | 'available' | 'defect' | 'inspection' | 'special' | 'reserved'>('all')
  const [ownerKeyword, setOwnerKeyword] = useState('')
  const [codeKeyword, setCodeKeyword] = useState('')
  const [nameKeyword, setNameKeyword] = useState('')
  const [attrKeyword, setAttrKeyword] = useState('')
  const [assignmentTab, setAssignmentTab] = useState<'rule' | 'strategy'>('rule')
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')

  const titleMap: Record<PageKey, string> = {
    location: t('로케이션 관리', 'Location Management'),
    accounts: t('출고처 관리', 'Accounts Management'),
    shop: t('판매처 관리', 'Shop Management'),
    supplier: t('공급처 관리', 'Supplier Management'),
    product: t('품목 관리', 'Product Management'),
    assignment: t('할당 조건 관리', 'Assignment Management'),
    'total-picking': t('토탈 피킹 설정', 'Total Picking Settings'),
    template: t('출력 템플릿 관리', 'Template Management'),
  }

  const filteredLocations = useMemo(() => {
    return locations.filter((row) => {
      const zoneOk = zoneKeyword === 'all' || row.zone.toLowerCase() === zoneKeyword.toLowerCase()
      const locOk = !locationKeyword || row.location.toLowerCase().includes(locationKeyword.toLowerCase())
      const stateOk = stockState === 'all' || row.state === stockState
      return zoneOk && locOk && stateOk
    })
  }, [locations, zoneKeyword, locationKeyword, stockState])

  const filteredAccounts = useMemo(() => accounts.filter((row) => (!ownerKeyword || row.owner.toLowerCase().includes(ownerKeyword.toLowerCase())) && (!codeKeyword || row.code.toLowerCase().includes(codeKeyword.toLowerCase())) && (!nameKeyword || row.name.toLowerCase().includes(nameKeyword.toLowerCase()))), [accounts, ownerKeyword, codeKeyword, nameKeyword])
  const filteredShops = useMemo(() => shops.filter((row) => !ownerKeyword || row.owner.toLowerCase().includes(ownerKeyword.toLowerCase())), [shops, ownerKeyword])
  const filteredSuppliers = useMemo(() => suppliers.filter((row) => (!ownerKeyword || row.owner.toLowerCase().includes(ownerKeyword.toLowerCase())) && (!nameKeyword || row.name.toLowerCase().includes(nameKeyword.toLowerCase()))), [suppliers, ownerKeyword, nameKeyword])
  const filteredProducts = useMemo(() => products.filter((row) => (!ownerKeyword || row.owner.toLowerCase().includes(ownerKeyword.toLowerCase())) && (!codeKeyword || row.sku.toLowerCase().includes(codeKeyword.toLowerCase())) && (!nameKeyword || row.name.toLowerCase().includes(nameKeyword.toLowerCase())) && (!attrKeyword || row.attr.toLowerCase().includes(attrKeyword.toLowerCase()))), [products, ownerKeyword, codeKeyword, nameKeyword, attrKeyword])

  const activeRows = current === 'location' ? filteredLocations : current === 'accounts' ? filteredAccounts : current === 'shop' ? filteredShops : current === 'supplier' ? filteredSuppliers : current === 'product' ? filteredProducts : current === 'assignment' ? (assignmentTab === 'rule' ? rules : strategies) : current === 'template' ? templates : []
  const totalPages = Math.max(1, Math.ceil(activeRows.length / rowsPerPage))
  const paged = activeRows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{titleMap[current]}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('창고 운영 마스터 데이터를 등록·관리합니다.', 'Manage warehouse master configuration data.')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pages.map((entry) => (
            <Link key={entry.path} to={entry.path} className={`px-3 py-2 rounded text-sm ${current === entry.key ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {titleMap[entry.key]}
            </Link>
          ))}
        </div>

        {current === 'location' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
              <input value={zoneKeyword === 'all' ? '' : zoneKeyword} onChange={(e) => { setZoneKeyword(e.target.value || 'all'); setPage(1) }} placeholder="Zone" className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={locationKeyword} onChange={(e) => { setLocationKeyword(e.target.value); setPage(1) }} placeholder={t('로케이션명', 'Location name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <select value={stockState} onChange={(e) => setStockState(e.target.value as 'all' | 'available' | 'defect' | 'inspection' | 'special' | 'reserved')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
                <option value="all">{t('재고 상태: 전체', 'Stock state: All')}</option>
                <option value="available">{t('가용', 'Available')}</option>
                <option value="defect">{t('불량', 'Defect')}</option>
                <option value="inspection">{t('검수대기', 'Inspection')}</option>
                <option value="special">{t('특수', 'Special')}</option>
                <option value="reserved">{t('예약', 'Reserved')}</option>
              </select>
              <button onClick={() => setMessage(t('위치 바코드 출력(데모)', 'Print location barcodes (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('위치 바코드 출력', 'Print Location Barcodes')}</button>
              <button onClick={() => setMessage(t('엑셀 다운로드(데모)', 'Excel download (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('엑셀 다운로드', 'Download Excel')}</button>
              <button onClick={() => setMessage(t('출력 템플릿 관리(데모)', 'Manage print templates (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('출력 템플릿 관리', 'Template Settings')}</button>
              <button onClick={() => setMessage(t('Zone 관리(데모)', 'Zone settings (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('Zone 관리', 'Zone Settings')}</button>
              <button onClick={() => setMessage(t('기본 로케이션 관리(데모)', 'Default location settings (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('기본 로케이션 관리', 'Default Locations')}</button>
              <button onClick={() => setMessage(t('로케이션 등록(데모)', 'Register location (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('로케이션 등록', 'Register Location')}</button>
              <button onClick={() => setMessage(t('파일로 등록(데모)', 'Register by file (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('파일로 등록', 'Register by File')}</button>
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredLocations.length}건`, `Total ${filteredLocations.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">Zone</th>
                    <th className="text-left px-4 py-3 font-medium">{t('로케이션명', 'Location')}</th>
                    <th className="text-right px-4 py-3 font-medium">{t('재고 수량', 'Qty')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('재고 상태', 'State')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('비고', 'Note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => {
                    const target = row as typeof filteredLocations[number]
                    return (
                      <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                        <td className="px-4 py-3">{target.zone}</td>
                        <td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline inline-flex items-center gap-1">{target.location}<span>↗</span></a></td>
                        <td className="px-4 py-3 text-right">{target.qty}</td>
                        <td className="px-4 py-3">{target.state === 'available' ? t('가용', 'Available') : target.state === 'defect' ? t('불량', 'Defect') : target.state === 'inspection' ? t('검수대기', 'Inspection') : target.state === 'special' ? t('특수', 'Special') : t('예약', 'Reserved')}</td>
                        <td className="px-4 py-3">{target.note ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'accounts' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-6 gap-2">
              <input value={ownerKeyword} onChange={(e) => setOwnerKeyword(e.target.value)} placeholder={t('화주명', 'Owner')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={codeKeyword} onChange={(e) => setCodeKeyword(e.target.value)} placeholder={t('출고처 코드', 'Account code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder={t('출고처명', 'Account name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button onClick={() => setMessage(t('출고처 등록(데모)', 'Register account (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('출고처 등록', 'Register Account')}</button>
              <button onClick={() => setMessage(t('파일로 등록(데모)', 'Register by file (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('파일로 등록', 'Register by File')}</button>
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredAccounts.length}건`, `Total ${filteredAccounts.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-10 text-center text-slate-500">{filteredAccounts.length === 0 ? t('현재 등록된 출고처가 없습니다.', 'No registered accounts.') : ''}</div>
          </>
        )}

        {current === 'shop' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-3 gap-2">
              <input value={ownerKeyword} onChange={(e) => setOwnerKeyword(e.target.value)} placeholder={t('화주명', 'Owner')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredShops.length}건`, `Total ${filteredShops.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th><th className="text-left px-4 py-3 font-medium">{t('판매처명', 'Shop')}</th><th className="text-left px-4 py-3 font-medium">{t('판매처 분류', 'Category')}</th><th className="text-left px-4 py-3 font-medium">{t('판매처 사이트', 'Site')}</th></tr></thead>
                <tbody>
                  {paged.map((row) => {
                    const target = row as typeof filteredShops[number]
                    return (
                      <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3">{target.owner}</td><td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{target.name}</a></td><td className="px-4 py-3">{target.category}</td><td className="px-4 py-3">{target.active ? t('사용', 'Active') : t('미사용', 'Inactive')}</td></tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'supplier' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-4 gap-2">
              <input value={ownerKeyword} onChange={(e) => setOwnerKeyword(e.target.value)} placeholder={t('화주명', 'Owner')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder={t('공급처명', 'Supplier')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button onClick={() => setMessage(t('출력(데모)', 'Print (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('출력', 'Print')}</button>
              <button onClick={() => setMessage(t('출력 템플릿 관리(데모)', 'Template settings (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('출력 템플릿 관리', 'Template Settings')}</button>
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredSuppliers.length}건`, `Total ${filteredSuppliers.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th><th className="text-left px-4 py-3 font-medium">{t('공급처 분류', 'Category')}</th><th className="text-left px-4 py-3 font-medium">{t('공급처명', 'Supplier')}</th><th className="text-left px-4 py-3 font-medium">{t('공급처 코드', 'Code')}</th><th className="text-left px-4 py-3 font-medium">{t('휴대폰 번호', 'Phone')}</th><th className="text-left px-4 py-3 font-medium">{t('위치', 'Location')}</th><th className="text-left px-4 py-3 font-medium">{t('주소', 'Address')}</th></tr></thead>
                <tbody>
                  {paged.map((row) => {
                    const target = row as typeof filteredSuppliers[number]
                    return (
                      <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3">{target.owner}</td><td className="px-4 py-3">{target.category}</td><td className="px-4 py-3">{target.name}</td><td className="px-4 py-3 font-mono">{target.code}</td><td className="px-4 py-3">{target.phone}</td><td className="px-4 py-3">{target.location}</td><td className="px-4 py-3">{target.address}</td></tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'product' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-2">
              <input value={ownerKeyword} onChange={(e) => setOwnerKeyword(e.target.value)} placeholder={t('화주명', 'Owner')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={codeKeyword} onChange={(e) => setCodeKeyword(e.target.value)} placeholder={t('품목 코드', 'Item code')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder={t('품목명', 'Item name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <input value={attrKeyword} onChange={(e) => setAttrKeyword(e.target.value)} placeholder={t('품목 속성', 'Item attributes')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredProducts.length}건`, `Total ${filteredProducts.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th><th className="text-left px-4 py-3 font-medium">{t('품목 코드', 'Item code')}</th><th className="text-left px-4 py-3 font-medium">{t('품목명·품목 속성', 'Item / Attr')}</th><th className="text-left px-4 py-3 font-medium">{t('공급처', 'Supplier')}</th><th className="text-left px-4 py-3 font-medium">{t('품목 분류', 'Category')}</th><th className="text-right px-4 py-3 font-medium">{t('판매 단가', 'Sale price')}</th><th className="text-right px-4 py-3 font-medium">{t('원가', 'Cost')}</th><th className="text-left px-4 py-3 font-medium">{t('등록일', 'Created')}</th></tr></thead>
                <tbody>
                  {paged.map((row) => {
                    const target = row as typeof filteredProducts[number]
                    return (
                      <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3">{target.owner}</td><td className="px-4 py-3 font-mono text-blue-300">{target.sku}</td><td className="px-4 py-3">{target.name}<div className="text-xs text-slate-500">{target.attr}</div></td><td className="px-4 py-3">{target.supplier}</td><td className="px-4 py-3">{target.category}</td><td className="px-4 py-3 text-right">{target.salePrice.toLocaleString()}</td><td className="px-4 py-3 text-right">{target.cost.toLocaleString()}</td><td className="px-4 py-3">{target.createdAt}</td></tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'assignment' && (
          <>
            <div className="flex gap-2">
              <button onClick={() => setAssignmentTab('rule')} className={`px-3 py-2 rounded text-sm ${assignmentTab === 'rule' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{t('할당 조건 설정', 'Allocation Rules')}</button>
              <button onClick={() => setAssignmentTab('strategy')} className={`px-3 py-2 rounded text-sm ${assignmentTab === 'strategy' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>{t('할당 전략 관리', 'Allocation Strategies')}</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">{t('우선순위 중복 입력 불가, 저장 후 적용됩니다.', 'Duplicate priority is not allowed. Save to apply.')}</div>
              <div className="flex gap-2">
                <button onClick={() => setMessage(t('저장(데모)', 'Saved (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('저장', 'Save')}</button>
                <button onClick={() => setMessage(assignmentTab === 'rule' ? t('할당 조건 생성(데모)', 'Create rule (demo)') : t('새 전략 생성(데모)', 'Create strategy (demo)'))} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{assignmentTab === 'rule' ? t('할당 조건 생성', 'Create Rule') : t('새 전략 생성', 'Create Strategy')}</button>
              </div>
            </div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              {assignmentTab === 'rule' ? (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('우선순위', 'Priority')}</th><th className="text-left px-4 py-3 font-medium">{t('할당 조건명', 'Rule name')}</th><th className="text-left px-4 py-3 font-medium">{t('할당 전략명', 'Strategy')}</th><th className="text-left px-4 py-3 font-medium">{t('대상 화주', 'Owner scope')}</th><th className="text-left px-4 py-3 font-medium">{t('지정 판매처 수', 'Assigned shops')}</th><th className="text-left px-4 py-3 font-medium">{t('작업자', 'Worker')}</th></tr></thead>
                  <tbody>
                    {paged.map((row) => {
                      const target = row as typeof rules[number]
                      return (
                        <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3">{target.priority}</td><td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{target.name}</a></td><td className="px-4 py-3">{target.strategyName}</td><td className="px-4 py-3">{target.ownerScope}</td><td className="px-4 py-3">{target.shopCount === 0 ? t('전체 판매처', 'All shops') : target.shopCount}</td><td className="px-4 py-3">{target.worker}</td></tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('전략명', 'Strategy')}</th><th className="text-left px-4 py-3 font-medium">{t('전략 설명', 'Description')}</th><th className="text-left px-4 py-3 font-medium">{t('작업자', 'Worker')}</th><th className="text-left px-4 py-3 font-medium">{t('등록일', 'Created')}</th></tr></thead>
                  <tbody>
                    {paged.map((row) => {
                      const target = row as typeof strategies[number]
                      return (
                        <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{target.name}</a></td><td className="px-4 py-3">{target.description}</td><td className="px-4 py-3">{target.worker}</td><td className="px-4 py-3">{target.createdAt}</td></tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {current === 'total-picking' && (
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5 space-y-4 max-w-3xl">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">{t('스테이션 수', 'Stations')}</label>
              <input type="number" min={1} value={totalPickingStations} onChange={(e) => updateTotalPicking({ totalPickingStations: Math.max(1, Number(e.target.value)) })} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">{t('처리 송장 수', 'Invoice limit')}</label>
              <select value={totalPickingInvoiceLimit} onChange={(e) => updateTotalPicking({ totalPickingInvoiceLimit: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
                {[20, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">{t('잔여 수량 블록 생성 여부', 'Create remain blocks')}</label>
              <div className="flex gap-2">
                <button onClick={() => updateTotalPicking({ totalPickingUseRemainBlock: true })} className={`px-3 py-2 rounded text-sm ${totalPickingUseRemainBlock ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('사용', 'Use')}</button>
                <button onClick={() => updateTotalPicking({ totalPickingUseRemainBlock: false })} className={`px-3 py-2 rounded text-sm ${!totalPickingUseRemainBlock ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('미사용', 'Disable')}</button>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">{t('기본 템플릿', 'Default template')}</label>
              <select value={totalPickingDefaultTemplate} onChange={(e) => updateTotalPicking({ totalPickingDefaultTemplate: e.target.value })} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm">
                {templates.filter((row) => row.type === '토탈피킹 라벨').map((row) => <option key={row.id} value={row.name}>{row.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMessage(t('토탈 피킹 설정 저장(데모)', 'Saved total picking settings (demo)'))} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('저장', 'Save')}</button>
              <button onClick={() => setMessage(t('템플릿 관리로 이동(데모)', 'Open template settings (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('관리', 'Manage')}</button>
            </div>
          </div>
        )}

        {current === 'template' && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">{t(`총 ${templates.length}건`, `Total ${templates.length}`)}</div>
              <button onClick={() => setMessage(t('새 템플릿 등록(데모)', 'Register template (demo)'))} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('새 템플릿 등록', 'New Template')}</button>
            </div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-700 text-slate-400"><th className="text-left px-4 py-3 font-medium">{t('템플릿 유형', 'Type')}</th><th className="text-left px-4 py-3 font-medium">{t('템플릿명', 'Name')}</th><th className="text-left px-4 py-3 font-medium">{t('기본 여부', 'Default')}</th><th className="text-left px-4 py-3 font-medium">{t('용지 종류', 'Paper')}</th><th className="text-left px-4 py-3 font-medium">{t('등록일', 'Created')}</th></tr></thead>
                <tbody>
                  {paged.map((row) => {
                    const target = row as typeof templates[number]
                    return (
                      <tr key={target.id} className="border-b border-slate-700/40 hover:bg-slate-700/30"><td className="px-4 py-3">{target.type}</td><td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{target.name}</a></td><td className="px-4 py-3">{target.isDefault ? <span className="text-xs px-2 py-1 rounded bg-blue-600">{t('기본', 'Default')}</span> : '-'}</td><td className="px-4 py-3">{target.paperType}</td><td className="px-4 py-3">{target.createdAt}</td></tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        {(current !== 'total-picking') && (
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
        )}
      </div>
    </Layout>
  )
}
