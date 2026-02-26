import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function SystemConfiguration() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const config = useExtendedModulesStore((state) => state.systemConfig)
  const updateSystemConfig = useExtendedModulesStore((state) => state.updateSystemConfig)

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '시스템 설정/환경설정' : 'System Configuration'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '창고 기본정보, 단위, 바코드, 자동채번, 인터페이스 설정을 관리합니다.' : 'Manage warehouse profile, units, barcode policy, auto numbering, and integration setup.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={config.warehouseCode} onChange={(e) => updateSystemConfig({ warehouseCode: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '창고코드' : 'Warehouse Code'} />
          <input value={config.warehouseName} onChange={(e) => updateSystemConfig({ warehouseName: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '창고명' : 'Warehouse Name'} />
          <input value={config.address} onChange={(e) => updateSystemConfig({ address: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm md:col-span-2" placeholder={isKo ? '주소' : 'Address'} />
          <input value={config.operationHours} onChange={(e) => updateSystemConfig({ operationHours: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '운영시간' : 'Operation Hours'} />
          <input value={config.barcodePrefix} onChange={(e) => updateSystemConfig({ barcodePrefix: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '바코드 Prefix' : 'Barcode Prefix'} />
          <select value={config.weightUnit} onChange={(e) => updateSystemConfig({ weightUnit: e.target.value as 'kg' | 'lb' })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
          <select value={config.volumeUnit} onChange={(e) => updateSystemConfig({ volumeUnit: e.target.value as 'cbm' | 'ft3' })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="cbm">cbm</option>
            <option value="ft3">ft3</option>
          </select>
          <input value={config.autoNumberPattern} onChange={(e) => updateSystemConfig({ autoNumberPattern: e.target.value })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '자동채번 규칙' : 'Auto Number Pattern'} />
          <select value={config.interfaceMode} onChange={(e) => updateSystemConfig({ interfaceMode: e.target.value as 'mock' | 'api' })} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="mock">mock</option>
            <option value="api">api</option>
          </select>
        </div>
      </div>
    </Layout>
  )
}
