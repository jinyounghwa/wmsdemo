import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useLogisticsSettingsStore } from '../store/logisticsSettingsStore'

const pages = [
  { path: '/logistics/warehouse', key: 'warehouse' },
  { path: '/logistics/user', key: 'user' },
  { path: '/logistics/shipper', key: 'shipper' },
  { path: '/logistics/carrier', key: 'carrier' },
  { path: '/logistics/role', key: 'role' },
] as const

type PageKey = (typeof pages)[number]['key']
const PAGE_SIZES = [20, 50, 100]

export default function LogisticsSettings() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)
  const location = useLocation()

  const current = (pages.find((entry) => location.pathname === entry.path)?.key ?? 'warehouse') as PageKey

  const warehouses = useLogisticsSettingsStore((state) => state.warehouses)
  const users = useLogisticsSettingsStore((state) => state.users)
  const shippers = useLogisticsSettingsStore((state) => state.shippers)
  const carriers = useLogisticsSettingsStore((state) => state.carriers)
  const roles = useLogisticsSettingsStore((state) => state.roles)
  const requestIntegration = useLogisticsSettingsStore((state) => state.requestShipperIntegration)
  const syncShipper = useLogisticsSettingsStore((state) => state.syncShipper)

  const [warehouseKeyword, setWarehouseKeyword] = useState('')
  const [shipperKeyword, setShipperKeyword] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')

  const titleMap: Record<PageKey, string> = {
    warehouse: t('창고 관리', 'Warehouse Management'),
    user: t('사용자 관리', 'User Management'),
    shipper: t('화주 관리', 'Shipper Management'),
    carrier: t('운송사 관리', 'Carrier Management'),
    role: t('통합 권한 관리', 'Unified Role Management'),
  }

  const filteredWarehouses = useMemo(() => warehouses.filter((row) => !warehouseKeyword || row.name.toLowerCase().includes(warehouseKeyword.toLowerCase())), [warehouses, warehouseKeyword])
  const filteredShippers = useMemo(() => shippers.filter((row) => !shipperKeyword || row.name.toLowerCase().includes(shipperKeyword.toLowerCase())), [shippers, shipperKeyword])
  const totalRows = current === 'warehouse' ? filteredWarehouses.length : current === 'shipper' ? filteredShippers.length : current === 'user' ? users.length : current === 'carrier' ? carriers.length : roles.length
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage))

  const paginate = <T,>(rows: T[]) => rows.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{titleMap[current]}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{t('물류사 전사 설정(창고/사용자/화주/운송사/권한)을 관리합니다.', 'Manage enterprise settings for logistics provider.')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pages.map((entry) => (
            <Link key={entry.path} to={entry.path} className={`px-3 py-2 rounded text-sm ${current === entry.key ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {titleMap[entry.key]}
            </Link>
          ))}
        </div>

        {current === 'warehouse' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-2">
              <input value={warehouseKeyword} onChange={(e) => { setWarehouseKeyword(e.target.value); setPage(1) }} placeholder={t('창고명', 'Warehouse name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button onClick={() => setMessage(t('필터 추가(데모)', 'Add filter (demo)'))} className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('필터추가', 'Add Filter')}</button>
              <button onClick={() => setMessage(t('창고 등록(데모)', 'Warehouse registration (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('창고 등록', 'Register Warehouse')}</button>
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredWarehouses.length}건`, `Total ${filteredWarehouses.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">{t('창고명', 'Warehouse')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('창고 코드', 'Code')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('창고 주소', 'Address')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('담당자명', 'Manager')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('담당자 연락처', 'Phone')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredWarehouses).map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3 font-mono text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline inline-flex items-center gap-1">{row.name}<span>↗</span></a></td>
                      <td className="px-4 py-3">{row.code}</td>
                      <td className="px-4 py-3">{row.address}</td>
                      <td className="px-4 py-3">{row.manager}</td>
                      <td className="px-4 py-3">{row.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'user' && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">{t(`총 ${users.length}명`, `Total ${users.length} users`)}</div>
              <div className="flex gap-2">
                <button onClick={() => setMessage(t('사용자 분류 설정(데모)', 'User category settings (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('사용자 분류 설정', 'User Category')}</button>
                <button onClick={() => setMessage(t('초대 현황(데모)', 'Invitation status (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('초대 현황', 'Invitations')}</button>
                <button onClick={() => setMessage(t('사용자 초대(데모)', 'Invite user (demo)'))} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('사용자 초대', 'Invite User')}</button>
              </div>
            </div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">{t('사용자명', 'Name')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('연락처', 'Phone')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('아이디(이메일)', 'Email')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('사용자 분류', 'Type')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('사용자 코드', 'Code')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('권한', 'Role')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('가입일', 'Joined')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(users).map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{row.name}</a></td>
                      <td className="px-4 py-3">{row.phone}</td>
                      <td className="px-4 py-3 font-mono">{row.email}</td>
                      <td className="px-4 py-3">{row.userType}</td>
                      <td className="px-4 py-3">{row.userCode}</td>
                      <td className="px-4 py-3">{row.roleName}</td>
                      <td className="px-4 py-3">{row.joinedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'shipper' && (
          <>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-4 gap-2">
              <input value={shipperKeyword} onChange={(e) => { setShipperKeyword(e.target.value); setPage(1) }} placeholder={t('화주명', 'Shipper name')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button onClick={() => setMessage(t('화주 등록(데모)', 'Register shipper (demo)'))} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('화주 등록', 'Register Shipper')}</button>
            </div>
            <div className="text-sm text-slate-300">{t(`총 ${filteredShippers.length}건`, `Total ${filteredShippers.length}`)}</div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Shipper')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('도메인명', 'Domain')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('담당자명', 'Manager')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('이메일', 'Email')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('휴대폰 전화번호', 'Phone')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('연동 상태', 'Integration')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('기능', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(filteredShippers).map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{row.name}</a></td>
                      <td className="px-4 py-3">{row.domain}</td>
                      <td className="px-4 py-3">{row.manager}</td>
                      <td className="px-4 py-3 font-mono">{row.email}</td>
                      <td className="px-4 py-3">{row.phone}</td>
                      <td className="px-4 py-3">{row.integration === 'required' ? t('필요', 'Required') : t('완료', 'Completed')}</td>
                      <td className="px-4 py-3 flex gap-1">
                        {row.integration === 'required' ? (
                          <button onClick={() => { requestIntegration(row.id); setMessage(t('연결 요청 전송(데모)', 'Integration request sent (demo)')) }} className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded text-xs">{t('연결 요청', 'Request')}</button>
                        ) : (
                          <button onClick={() => { syncShipper(row.id); setMessage(t('동기화 실행(데모)', 'Sync executed (demo)')) }} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs">{t('동기화', 'Sync')}</button>
                        )}
                        <button onClick={() => setMessage(t('창고 설정(데모)', 'Warehouse setup (demo)'))} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">{t('창고 설정', 'Warehouse')}</button>
                        <button onClick={() => setMessage(t('운송사 설정(데모)', 'Carrier setup (demo)'))} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">{t('운송사 설정', 'Carrier')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'carrier' && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">{t(`총 ${carriers.length}건`, `Total ${carriers.length}`)}</div>
              <div className="flex gap-2">
                <button onClick={() => setMessage(t('운송장 양식 관리(데모)', 'Waybill templates (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('운송장 양식 관리', 'Waybill Templates')}</button>
                <button onClick={() => setMessage(t('기본 운송사 관리(데모)', 'Default carrier management (demo)'))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('기본 운송사 관리', 'Default Carriers')}</button>
                <button onClick={() => setMessage(t('운송사 등록(데모)', 'Register carrier (demo)'))} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('운송사 등록', 'Register Carrier')}</button>
              </div>
            </div>
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">{t('운송 유형', 'Type')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('운송사명', 'Carrier')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('사용자 관리명', 'Manager Name')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('운송사 코드', 'Code')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('담당자명', 'Manager')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('담당자 연락처', 'Phone')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('기능', 'Actions')}</th>
                    <th className="text-left px-4 py-3 font-medium">{t('비고', 'Note')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(carriers).map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                      <td className="px-4 py-3">{row.type === 'parcel' ? t('택배', 'Parcel') : row.type === 'same-day' ? t('당일', 'Same-day') : row.type === 'overseas' ? t('해외', 'Overseas') : t('기타', 'Other')}</td>
                      <td className="px-4 py-3">{row.name}</td>
                      <td className="px-4 py-3 text-blue-300"><a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{row.managerName}</a></td>
                      <td className="px-4 py-3 font-mono">{row.carrierCode}</td>
                      <td className="px-4 py-3">{row.manager}</td>
                      <td className="px-4 py-3">{row.phone}</td>
                      <td className="px-4 py-3"><button onClick={() => setMessage(t('연동 설정(데모)', 'Integration setup (demo)'))} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">{t('연동 설정', 'Integration')}</button></td>
                      <td className="px-4 py-3">{row.note ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {current === 'role' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t('권한 목록', 'Role List')}</h2>
                <button onClick={() => setMessage(t('권한 생성(데모)', 'Create role (demo)'))} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs">{t('권한 생성', 'Create')}</button>
              </div>
              {roles.map((row) => (
                <div key={row.id} className="p-3 rounded border border-slate-700 bg-slate-800/40">
                  <div className="font-medium">{row.name}</div>
                  {row.locked && <div className="text-xs text-amber-300 mt-1">{t('최고 권한은 수정할 수 없습니다.', 'Top role is locked and cannot be edited.')}</div>}
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-4">
              <h2 className="font-semibold">{t('권한 상세 설정', 'Role Permission Details')}</h2>
              <div>
                <div className="text-sm text-slate-400 mb-2">{t('페이지 접근 권한', 'Page Permissions')}</div>
                <div className="flex flex-wrap gap-2">
                  {roles[0]?.pagePermissions.map((permission) => (
                    <span key={permission} className="text-xs px-2 py-1 bg-slate-700 rounded border border-slate-600">{permission}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400 mb-2">{t('주요 기능 접근 권한', 'Feature Permissions')}</div>
                <div className="flex flex-wrap gap-2">
                  {roles[0]?.featurePermissions.map((permission) => (
                    <span key={permission} className="text-xs px-2 py-1 bg-slate-700 rounded border border-slate-600">{permission}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

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
      </div>
    </Layout>
  )
}
