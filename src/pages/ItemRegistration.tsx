import { useMemo, useState, type ReactNode } from 'react'
import { CopyPlus, ImagePlus, PackagePlus, Plus, Save, Upload } from 'lucide-react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useInventoryStore } from '../store/inventoryStore'
import {
  defaultProductOptions,
  productRecords,
  supplierSummaries,
  type ProductOptionRow,
  type ProductRecord,
} from '../data/commerceManagementData'

type RegistrationTab =
  | 'single'
  | 'csv'
  | 'makeshop'
  | 'cafe24'
  | 'wisa'
  | 'godomall'
  | 'smartstore'
  | 'history'

type FormState = {
  productName: string
  category: string
  tag: string
  brand: string
  productYear: string
  season: string
  origin: string
  supplier: string
  purchaseName: string
  composition: string
  washMethod: string
  productCode: string
  internalCode: string
  channelCode: string
  salePrice: number
  consumerPrice: number
  costPrice: number
  marketPrice: number
  brandCommissionRate: number
  legacyInboundMode: 'not-selected' | 'excluded' | 'included'
  description: string
  heroImage: string
  detailImages: string[]
  memos: string[]
  designer: string
  registrar: string
  publishedAt: string
  warehouse: string
  stockWorkType: string
  optionComposition: string
  englishName: string
  englishCategory: string
  overseasPrice: number
  currency: string
  widthCm: number
  depthCm: number
  heightCm: number
  weightGram: number
  unitsPerBox: number
  taxType: 'taxable' | 'tax-free'
  knitType: string
}

const initialFormState: FormState = {
  productName: 'WMS 스커트',
  category: '분류1',
  tag: 'new, best',
  brand: '자사',
  productYear: '2026',
  season: 'SS',
  origin: 'Korea',
  supplier: '자사',
  purchaseName: 'WMS skirt buying name',
  composition: 'POLY 80 / SPAN 20',
  washMethod: '드라이클리닝 권장',
  productCode: 'C123596',
  internalCode: 'WMS-SKIRT-001',
  channelCode: 'GODO-C123596',
  salePrice: 17000,
  consumerPrice: 22000,
  costPrice: 9880,
  marketPrice: 25000,
  brandCommissionRate: 11,
  legacyInboundMode: 'included',
  description: '셀메이트 문서 기준 상품 상세 설명과 해외 물류용 필드를 함께 등록합니다.',
  heroImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
  detailImages: ['', '', '', ''],
  memos: Array.from({ length: 15 }, (_, index) => (index === 0 ? '대표 컬러 우선노출' : '')),
  designer: 'opsmanager',
  registrar: 'younghwa',
  publishedAt: '2026-03-17',
  warehouse: '기본창고',
  stockWorkType: '정상',
  optionComposition: '색상 / 사이즈',
  englishName: 'WMS Skirt',
  englishCategory: 'Skirts',
  overseasPrice: 19,
  currency: 'USD',
  widthCm: 32,
  depthCm: 28,
  heightCm: 4,
  weightGram: 380,
  unitsPerBox: 12,
  taxType: 'taxable',
  knitType: 'woven',
}

const registrationTabs: Array<{ id: RegistrationTab; ko: string; en: string }> = [
  { id: 'single', ko: '개별상품등록', en: 'Single Item' },
  { id: 'csv', ko: 'CSV 상품등록', en: 'CSV Import' },
  { id: 'makeshop', ko: '메이크샵상품등록', en: 'Makeshop Import' },
  { id: 'cafe24', ko: 'cafe24상품등록', en: 'Cafe24 Import' },
  { id: 'wisa', ko: 'Wisa상품등록', en: 'Wisa Import' },
  { id: 'godomall', ko: '고도몰5API상품등록', en: 'GodoMall5 API' },
  { id: 'smartstore', ko: 'Smartstore상품등록', en: 'Smartstore Import' },
  { id: 'history', ko: '차수별 상품등록내역', en: 'Import History' },
]

const sectionCard = 'rounded-2xl border border-slate-700/60 bg-[#1e293b] p-5'
const baseProductCount = 188
const basePricedCount = 93
const sampledPricedCount = productRecords.filter((record) => record.salePrice > 0).length

const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat('ko-KR').format(value)}원`

const toOptionSku = (baseCode: string, option: ProductOptionRow, fallbackIndex: number) => {
  const token =
    option.optionCode.trim() ||
    `${baseCode}-${option.color}-${option.size || fallbackIndex + 1}`
  return token.replace(/\s+/g, '-').toUpperCase()
}

export default function ItemRegistration() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const addItem = useInventoryStore((state) => state.addItem)
  const findBySku = useInventoryStore((state) => state.findBySku)

  const [activeTab, setActiveTab] = useState<RegistrationTab>('single')
  const [records, setRecords] = useState<ProductRecord[]>(productRecords)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [options, setOptions] = useState<ProductOptionRow[]>(defaultProductOptions)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return records
    return records.filter((record) =>
      [record.name, record.supplier, record.category, record.code]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    )
  }, [records, search])

  const salesRegisteredCount = useMemo(
    () => records.filter((record) => record.salePrice > 0).length,
    [records],
  )
  const displayProductCount = baseProductCount - productRecords.length + records.length
  const displayPricedCount = basePricedCount - sampledPricedCount + salesRegisteredCount

  const supplyPrice = useMemo(
    () => Math.max(0, Math.round(form.salePrice - (form.salePrice * form.brandCommissionRate) / 100)),
    [form.brandCommissionRate, form.salePrice],
  )
  const marginAmount = useMemo(() => Math.max(0, supplyPrice - form.costPrice), [form.costPrice, supplyPrice])
  const cubicVolume = useMemo(
    () => Number(((form.widthCm * form.depthCm * form.heightCm) / 6000).toFixed(2)),
    [form.depthCm, form.heightCm, form.widthCm],
  )

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateOption = (id: string, key: keyof ProductOptionRow, value: string | number) => {
    setOptions((current) =>
      current.map((option) => (option.id === id ? { ...option, [key]: value } : option)),
    )
  }

  const addOptionRow = () => {
    setOptions((current) => [
      ...current,
      {
        id: `OPT-${Date.now()}`,
        optionName: '',
        color: '',
        size: '',
        cost: form.costPrice,
        currentStock: 0,
        safetyStock: 10,
        barcode: '',
        optionCode: '',
        location: `${form.warehouse} A-01-01`,
      },
    ])
  }

  const removeOptionRow = (id: string) => {
    setOptions((current) => (current.length === 1 ? current : current.filter((option) => option.id !== id)))
  }

  const saveProduct = () => {
    if (!form.productName.trim()) {
      setMessage(isKo ? '상품명은 필수입니다.' : 'Product name is required.')
      return
    }

    const duplicateSkus = options
      .map((option, index) => toOptionSku(form.productCode || form.internalCode || 'NEW', option, index))
      .filter((sku, index, all) => all.indexOf(sku) !== index || Boolean(findBySku(sku)))

    if (duplicateSkus.length > 0) {
      setMessage(
        isKo
          ? `중복 SKU를 확인하세요: ${Array.from(new Set(duplicateSkus)).join(', ')}`
          : `Check duplicate SKUs: ${Array.from(new Set(duplicateSkus)).join(', ')}`,
      )
      return
    }

    const nextId = Math.max(...records.map((record) => record.id)) + 1
    const nextRecord: ProductRecord = {
      id: nextId,
      name: form.productName,
      inventoryManaged: true,
      supplier: form.supplier || '자사',
      category: form.category || '미입력',
      code: form.productCode || '미입력',
      salePrice: form.salePrice,
      costPrice: form.costPrice,
      supplyPrice,
      margin: marginAmount,
      registeredAt: `${form.publishedAt} 09:00`,
    }
    setRecords((current) => [nextRecord, ...current])

    options.forEach((option, index) => {
      addItem({
        sku: toOptionSku(form.productCode || form.internalCode || 'NEW', option, index),
        name: `${form.productName} ${option.color} ${option.size}`.trim(),
        category: form.category || '미입력',
        zone: option.location.split(' ')[1]?.split('-')[0] ?? 'A',
        rack: option.location.split('-')[1] ?? '01',
        bin: option.location.split('-')[2] ?? '01',
        currentQty: option.currentStock,
        safetyQty: option.safetyStock,
        lastMovedAt: form.publishedAt,
        seasonCode: `${form.season}${form.productYear.slice(-2)}`,
        collection: form.brand || 'DEFAULT',
        storageType: 'shelf',
        styleCode: form.internalCode || form.productCode,
        color: option.color,
        size: option.size,
      })
    })

    setMessage(
      isKo
        ? `상품 ${form.productName} 및 옵션 ${options.length}건을 등록했습니다.`
        : `Registered ${form.productName} with ${options.length} option rows.`,
    )
  }

  const importSummary = {
    single: isKo ? '개별 상품과 옵션/재고를 한 화면에서 등록합니다.' : 'Register product master, options, and stock in one screen.',
    csv: isKo ? 'CSV 컬럼 매핑과 사전 검증을 통해 대량 업로드를 준비합니다.' : 'Prepare bulk uploads with CSV column mapping and validation.',
    makeshop: isKo ? '메이크샵 상품코드와 판매처별 상품코드를 동기화합니다.' : 'Synchronize Makeshop item codes and channel codes.',
    cafe24: isKo ? '카페24 카테고리 및 대표이미지 규칙을 반영합니다.' : 'Apply Cafe24 category and hero-image rules.',
    wisa: isKo ? 'Wisa 상품 데이터 포맷에 맞춘 가져오기 구조입니다.' : 'Import flow tailored to Wisa product data format.',
    godomall: isKo ? '고도몰5 API 기준 옵션/재고 연동을 준비합니다.' : 'Prepare option and stock sync based on GodoMall5 API.',
    smartstore: isKo ? '스마트스토어 해외통화/브랜드/통관 필드를 점검합니다.' : 'Validate Smartstore cross-border price and brand fields.',
    history: isKo ? '차수별 등록 내역과 누락 필드를 회차 단위로 점검합니다.' : 'Review import history and missing fields by batch.',
  }[activeTab]

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                {isKo ? '상품 관리 / 상품등록' : 'Product Management / Registration'}
              </h1>
              <LanguageToggle />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {isKo
                ? '상품 목록 188건, 공급처 현황, 가격 요약, 등록 양식 구조와 영문 필드를 셀메이트 문서 기준으로 통합 구현했습니다.'
                : 'Implements list, supplier summary, pricing summary, registration structure, and English fields from the Cellmate documents.'}
            </p>
          </div>
          <button
            type="button"
            onClick={saveProduct}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Save className="h-4 w-4" />
            {isKo ? '상품 저장' : 'Save Product'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
            {[
            { label: isKo ? '전체 상품 수' : 'Total Products', value: `${displayProductCount}`, tone: 'text-blue-300' },
            { label: isKo ? '판매가 등록 상품' : 'Priced Items', value: `${displayPricedCount}`, tone: 'text-emerald-300' },
            { label: isKo ? '재고관리 적용' : 'Inventory Managed', value: `${displayProductCount}`, tone: 'text-amber-300' },
            { label: isKo ? '공급처 수' : 'Suppliers', value: `${supplierSummaries.length}`, tone: 'text-violet-300' },
          ].map((card) => (
            <div key={card.label} className={`${sectionCard} space-y-2`}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
              <p className={`text-3xl font-bold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className={`${sectionCard} space-y-4`}>
          <div className="flex flex-wrap gap-2">
            {registrationTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 bg-blue-500/15 text-blue-200'
                    : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isKo ? tab.ko : tab.en}
              </button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-sm font-semibold text-white">
                {isKo ? '탭별 구현 범위' : 'Implemented Scope by Tab'}
              </p>
              <p className="mt-2 text-sm text-slate-300">{importSummary}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
              <p className="text-sm font-semibold text-white">
                {isKo ? '자동 계산 로직' : 'Auto Calculation Logic'}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div>
                  <p className="text-slate-500">{isKo ? '공급가' : 'Supply Price'}</p>
                  <p>{formatCurrency(supplyPrice)}</p>
                </div>
                <div>
                  <p className="text-slate-500">{isKo ? '마진금액' : 'Margin'}</p>
                  <p>{formatCurrency(marginAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-500">{isKo ? '부피' : 'Volume'}</p>
                  <p>{cubicVolume}</p>
                </div>
                <div>
                  <p className="text-slate-500">{isKo ? '박스당수량' : 'Units / Box'}</p>
                  <p>{form.unitsPerBox}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className={sectionCard}>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{isKo ? '상품 목록' : 'Product List'}</h2>
                  <p className="text-sm text-slate-400">
                    {isKo ? '문서 기준 대표 상품 행을 샘플링해 표시합니다.' : 'Representative rows sampled from the source document.'}
                  </p>
                </div>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={isKo ? '상품명/공급처/코드 검색' : 'Search name / supplier / code'}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm md:max-w-xs"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-400">
                    <tr className="border-b border-slate-700">
                      <th className="px-3 py-3">#</th>
                      <th className="px-3 py-3">{isKo ? '상품명' : 'Product'}</th>
                      <th className="px-3 py-3">{isKo ? '공급처' : 'Supplier'}</th>
                      <th className="px-3 py-3">{isKo ? '분류' : 'Category'}</th>
                      <th className="px-3 py-3">{isKo ? '코드' : 'Code'}</th>
                      <th className="px-3 py-3">{isKo ? '판매가' : 'Sale'}</th>
                      <th className="px-3 py-3">{isKo ? '원가' : 'Cost'}</th>
                      <th className="px-3 py-3">{isKo ? '등록일' : 'Registered'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-slate-800 text-slate-200">
                        <td className="px-3 py-3">{record.id}</td>
                        <td className="px-3 py-3">{record.name}</td>
                        <td className="px-3 py-3">{record.supplier}</td>
                        <td className="px-3 py-3">{record.category}</td>
                        <td className="px-3 py-3 font-mono text-xs">{record.code}</td>
                        <td className="px-3 py-3">{formatCurrency(record.salePrice)}</td>
                        <td className="px-3 py-3">{formatCurrency(record.costPrice)}</td>
                        <td className="px-3 py-3">{record.registeredAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className={sectionCard}>
                <h2 className="text-lg font-semibold">{isKo ? '공급처 현황' : 'Supplier Summary'}</h2>
                <div className="mt-4 space-y-3">
                  {supplierSummaries.map((summary) => (
                    <div key={summary.supplier} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
                      <span>{summary.supplier}</span>
                      <span className="font-semibold text-blue-300">{summary.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={sectionCard}>
                <h2 className="text-lg font-semibold">{isKo ? '가격 현황 요약' : 'Pricing Summary'}</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
                    <p className="text-slate-400">{isKo ? '전체 상품 수' : 'Total Products'}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{displayProductCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
                    <p className="text-slate-400">{isKo ? '판매가 등록 상품' : 'Products with Sale Price'}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{displayPricedCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-3">
                    <p className="text-slate-400">{isKo ? '재고관리 미적용' : 'Inventory Not Applied'}</p>
                    <p className="mt-1 text-xl font-semibold text-white">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={sectionCard}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{isKo ? '개별상품등록 양식' : 'Single Product Form'}</h2>
                <button
                  type="button"
                  onClick={addOptionRow}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4" />
                  {isKo ? '옵션 추가' : 'Add Option'}
                </button>
              </div>

              <div className="mt-5 space-y-6">
                <FormSection title={isKo ? '기본정보 / Basic' : 'Basic Info / Basic'}>
                  <Field label={isKo ? '* 상품명' : '* Product Name'}>
                    <input value={form.productName} onChange={(event) => updateForm('productName', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품분류' : 'Category'}>
                    <input value={form.category} onChange={(event) => updateForm('category', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품태그' : 'Product Tag'}>
                    <input value={form.tag} onChange={(event) => updateForm('tag', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '브랜드' : 'Brand'}>
                    <input value={form.brand} onChange={(event) => updateForm('brand', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품 연도' : 'Product Year'}>
                    <input value={form.productYear} onChange={(event) => updateForm('productYear', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품 시즌' : 'Season'}>
                    <input value={form.season} onChange={(event) => updateForm('season', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '원산지' : 'Origin'}>
                    <input value={form.origin} onChange={(event) => updateForm('origin', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '공급처' : 'Supplier'}>
                    <input value={form.supplier} onChange={(event) => updateForm('supplier', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '사입상품명' : 'Buying Name'}>
                    <input value={form.purchaseName} onChange={(event) => updateForm('purchaseName', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '혼용률' : 'Composition'}>
                    <input value={form.composition} onChange={(event) => updateForm('composition', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '세탁방법' : 'Wash Method'}>
                    <input value={form.washMethod} onChange={(event) => updateForm('washMethod', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품코드' : 'Product Code'}>
                    <input value={form.productCode} onChange={(event) => updateForm('productCode', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '자체상품코드' : 'Internal Code'}>
                    <input value={form.internalCode} onChange={(event) => updateForm('internalCode', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '판매처별 상품코드' : 'Channel Code'}>
                    <input value={form.channelCode} onChange={(event) => updateForm('channelCode', event.target.value)} className="input" />
                  </Field>
                </FormSection>

                <FormSection title={isKo ? '가격 / Pricing' : 'Pricing'}>
                  <NumberField label={isKo ? '판매가(대표)' : 'Sale Price'} value={form.salePrice} onChange={(value) => updateForm('salePrice', value)} />
                  <NumberField label={isKo ? '소비자가' : 'Consumer Price'} value={form.consumerPrice} onChange={(value) => updateForm('consumerPrice', value)} />
                  <NumberField label={isKo ? '원가' : 'Cost Price'} value={form.costPrice} onChange={(value) => updateForm('costPrice', value)} />
                  <ReadonlyField label={isKo ? '공급가(자동)' : 'Supply Price (Auto)'} value={formatCurrency(supplyPrice)} />
                  <ReadonlyField label={isKo ? '마진금액(자동)' : 'Margin (Auto)'} value={formatCurrency(marginAmount)} />
                  <NumberField label={isKo ? '시중가' : 'Market Price'} value={form.marketPrice} onChange={(value) => updateForm('marketPrice', value)} />
                  <NumberField label={isKo ? '브랜드 수수료율(%)' : 'Brand Fee %'} value={form.brandCommissionRate} onChange={(value) => updateForm('brandCommissionRate', value)} />
                  <Field label={isKo ? '구 입고예정목록 반영여부' : 'Legacy Inbound Reflection'}>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        ['not-selected', isKo ? '선택안함' : 'Not Selected'],
                        ['excluded', isKo ? '미반영' : 'Excluded'],
                        ['included', isKo ? '반영' : 'Included'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateForm('legacyInboundMode', value as FormState['legacyInboundMode'])}
                          className={`rounded-lg border px-2 py-2 ${
                            form.legacyInboundMode === value ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </FormSection>

                <FormSection title={isKo ? '설명 / 이미지 / 메모' : 'Description / Images / Memo'}>
                  <Field label={isKo ? '상품설명텍스트' : 'Description Text'} fullWidth>
                    <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="input min-h-28" />
                  </Field>
                  <Field label={isKo ? '대표이미지' : 'Hero Image'} fullWidth>
                    <div className="flex gap-2">
                      <input value={form.heroImage} onChange={(event) => updateForm('heroImage', event.target.value)} className="input flex-1" />
                      <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2 text-sm">
                        <ImagePlus className="h-4 w-4" />
                        URL
                      </button>
                    </div>
                  </Field>
                  {form.detailImages.map((image, index) => (
                    <Field key={index} label={`${isKo ? '설명이미지' : 'Detail Image'} ${index + 1}`}>
                      <div className="flex gap-2">
                        <input
                          value={image}
                          onChange={(event) =>
                            updateForm(
                              'detailImages',
                              form.detailImages.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                            )
                          }
                          className="input flex-1"
                        />
                        <button type="button" className="rounded-lg border border-slate-600 px-3 py-2">
                          <Upload className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>
                  ))}
                  <Field label={isKo ? '상품디자이너' : 'Designer'}>
                    <input value={form.designer} onChange={(event) => updateForm('designer', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품등록자' : 'Registrar'}>
                    <input value={form.registrar} onChange={(event) => updateForm('registrar', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '상품게시일' : 'Publish Date'}>
                    <input type="date" value={form.publishedAt} onChange={(event) => updateForm('publishedAt', event.target.value)} className="input" />
                  </Field>
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm text-slate-400">{isKo ? '상품메모 1~15' : 'Memo 1~15'}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {form.memos.map((memo, index) => (
                        <input
                          key={index}
                          value={memo}
                          onChange={(event) =>
                            updateForm(
                              'memos',
                              form.memos.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                            )
                          }
                          placeholder={`${isKo ? '메모' : 'Memo'} ${index + 1}`}
                          className="input"
                        />
                      ))}
                    </div>
                  </div>
                </FormSection>

                <FormSection title={isKo ? '옵션 / 재고 / 물류' : 'Options / Stock / Logistics'}>
                  <Field label={isKo ? '재고입력창고' : 'Warehouse'}>
                    <input value={form.warehouse} onChange={(event) => updateForm('warehouse', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '재고작업구분' : 'Stock Work Type'}>
                    <input value={form.stockWorkType} onChange={(event) => updateForm('stockWorkType', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '옵션명구성' : 'Option Composition'}>
                    <div className="flex gap-2">
                      <input value={form.optionComposition} onChange={(event) => updateForm('optionComposition', event.target.value)} className="input flex-1" />
                      <button type="button" className="rounded-lg border border-slate-600 px-3 py-2">
                        <CopyPlus className="h-4 w-4" />
                      </button>
                    </div>
                  </Field>
                  <Field label={isKo ? '영문상품명' : 'English Name'}>
                    <input value={form.englishName} onChange={(event) => updateForm('englishName', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '영문상품카테고리명' : 'English Category'}>
                    <input value={form.englishCategory} onChange={(event) => updateForm('englishCategory', event.target.value)} className="input" />
                  </Field>
                  <Field label={isKo ? '해외통화상품가 / 통화' : 'Overseas Price / Currency'}>
                    <div className="grid grid-cols-[1fr_90px] gap-2">
                      <input type="number" value={form.overseasPrice} onChange={(event) => updateForm('overseasPrice', Number(event.target.value))} className="input" />
                      <input value={form.currency} onChange={(event) => updateForm('currency', event.target.value)} className="input" />
                    </div>
                  </Field>
                  <NumberField label={isKo ? '가로(cm)' : 'Width (cm)'} value={form.widthCm} onChange={(value) => updateForm('widthCm', value)} />
                  <NumberField label={isKo ? '세로(cm)' : 'Depth (cm)'} value={form.depthCm} onChange={(value) => updateForm('depthCm', value)} />
                  <NumberField label={isKo ? '높이(cm)' : 'Height (cm)'} value={form.heightCm} onChange={(value) => updateForm('heightCm', value)} />
                  <NumberField label={isKo ? '무게(g)' : 'Weight (g)'} value={form.weightGram} onChange={(value) => updateForm('weightGram', value)} />
                  <ReadonlyField label={isKo ? '부피(자동)' : 'Volume (Auto)'} value={`${cubicVolume}`} />
                  <NumberField label={isKo ? '박스당수량' : 'Units Per Box'} value={form.unitsPerBox} onChange={(value) => updateForm('unitsPerBox', value)} />
                  <Field label={isKo ? '면세여부' : 'Tax Type'}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ['taxable', isKo ? '과세' : 'Taxable'],
                        ['tax-free', isKo ? '면세' : 'Tax-free'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateForm('taxType', value as FormState['taxType'])}
                          className={`rounded-lg border px-2 py-2 ${
                            form.taxType === value ? 'border-blue-500 bg-blue-500/15 text-blue-200' : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label={isKo ? '편직정보' : 'Knit Info'}>
                    <input value={form.knitType} onChange={(event) => updateForm('knitType', event.target.value)} className="input" />
                  </Field>
                </FormSection>
              </div>
            </div>

            <div className={sectionCard}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{isKo ? '옵션/재고 테이블' : 'Option / Stock Table'}</h2>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
                  <PackagePlus className="h-4 w-4" />
                  {isKo ? `${options.length}개 옵션` : `${options.length} options`}
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {options.map((option) => (
                  <div key={option.id} className="rounded-2xl border border-slate-700 bg-slate-800/40 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label={isKo ? '옵션명' : 'Option Name'}>
                        <input value={option.optionName} onChange={(event) => updateOption(option.id, 'optionName', event.target.value)} className="input" />
                      </Field>
                      <Field label={isKo ? '옵션코드' : 'Option Code'}>
                        <input value={option.optionCode} onChange={(event) => updateOption(option.id, 'optionCode', event.target.value)} className="input" />
                      </Field>
                      <Field label={isKo ? '색상' : 'Color'}>
                        <input value={option.color} onChange={(event) => updateOption(option.id, 'color', event.target.value)} className="input" />
                      </Field>
                      <Field label={isKo ? '사이즈' : 'Size'}>
                        <input value={option.size} onChange={(event) => updateOption(option.id, 'size', event.target.value)} className="input" />
                      </Field>
                      <NumberField label={isKo ? '원가' : 'Cost'} value={option.cost} onChange={(value) => updateOption(option.id, 'cost', value)} />
                      <NumberField label={isKo ? '현재재고' : 'Current Stock'} value={option.currentStock} onChange={(value) => updateOption(option.id, 'currentStock', value)} />
                      <NumberField label={isKo ? '안정재고' : 'Safety Stock'} value={option.safetyStock} onChange={(value) => updateOption(option.id, 'safetyStock', value)} />
                      <Field label={isKo ? '바코드' : 'Barcode'}>
                        <input value={option.barcode} onChange={(event) => updateOption(option.id, 'barcode', event.target.value)} className="input" />
                      </Field>
                      <Field label={isKo ? '상품위치' : 'Location'} fullWidth>
                        <div className="flex gap-2">
                          <input value={option.location} onChange={(event) => updateOption(option.id, 'location', event.target.value)} className="input flex-1" />
                          <button type="button" onClick={() => removeOptionRow(option.id)} className="rounded-lg border border-rose-500/40 px-3 py-2 text-xs text-rose-200">
                            {isKo ? '삭제' : 'Remove'}
                          </button>
                        </div>
                      </Field>
                    </div>
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

function FormSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
  fullWidth = false,
}: {
  label: string
  children: ReactNode
  fullWidth?: boolean
}) {
  return (
    <label className={fullWidth ? 'md:col-span-2' : ''}>
      <span className="mb-2 block text-sm text-slate-400">{label}</span>
      {children}
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <Field label={label}>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="input" />
    </Field>
  )
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-200">
        {value}
      </div>
    </Field>
  )
}
