import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { usePartnerStore } from '../store/partnerStore'
import { useInventoryStore } from '../store/inventoryStore'
import { useDispatchStore } from '../store/dispatchStore'

type ScanLine = {
  sku: string
  name: string
  owner: string
  vendor: string
  expiry: string
  lot: string
  qty: number
  note: string
}

export default function DispatchExecutionBarcode() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const customers = usePartnerStore((state) => state.customers)
  const vendors = usePartnerStore((state) => state.vendors)
  const items = useInventoryStore((state) => state.items)
  const adjustStock = useInventoryStore((state) => state.adjustStock)
  const getReservedQty = useInventoryStore((state) => state.getReservedQty)
  const createDispatch = useDispatchStore((state) => state.createDispatch)

  const [owner, setOwner] = useState('')
  const [location, setLocation] = useState('')
  const [barcodeInput, setBarcodeInput] = useState('')
  const [voiceOn, setVoiceOn] = useState(true)
  const [lines, setLines] = useState<ScanLine[]>([])
  const [message, setMessage] = useState('')

  const speak = (text: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = isKo ? 'ko-KR' : 'en-US'
    window.speechSynthesis.speak(utter)
  }

  const handleScan = () => {
    const code = barcodeInput.trim().toUpperCase()
    if (!code) return
    if (!owner) {
      const msg = t('화주를 먼저 선택하세요.', 'Select owner first.')
      setMessage(msg)
      speak(msg)
      return
    }

    if (!location) {
      setLocation(code)
      setBarcodeInput('')
      const msg = t(`로케이션 스캔 완료: ${code}`, `Location scanned: ${code}`)
      setMessage(msg)
      speak(msg)
      return
    }

    const item = items.find((row) => row.sku.toUpperCase() === code)
    if (!item) {
      const msg = t(`품목 바코드 없음: ${code}`, `Unknown item barcode: ${code}`)
      setMessage(msg)
      speak(msg)
      return
    }

    const existing = lines.find((line) => line.sku === item.sku)
    if (existing) {
      setLines((prev) => prev.map((line) => (line.sku === item.sku ? { ...line, qty: line.qty + 1 } : line)))
    } else {
      const idx = lines.length
      setLines((prev) => [
        ...prev,
        {
          sku: item.sku,
          name: item.name,
          owner,
          vendor: vendors[idx % Math.max(1, vendors.length)] ?? '-',
          expiry: `2026-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 27) + 1).padStart(2, '0')}`,
          lot: `LOT-${item.sku.replace('SKU-', '')}-${String(idx % 9).padStart(2, '0')}`,
          qty: 1,
          note: '',
        },
      ])
    }

    setBarcodeInput('')
    const msg = t(`품목 스캔 완료: ${item.sku}`, `Item scanned: ${item.sku}`)
    setMessage(msg)
    speak(msg)
  }

  const totalQty = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines])

  const executeDispatch = () => {
    if (!owner || !location || lines.length === 0) return

    lines.forEach((line) => {
      const item = items.find((target) => target.sku === line.sku)
      if (!item) return
      const available = Math.max(0, item.currentQty - getReservedQty(line.sku))
      const qty = Math.max(0, Math.min(line.qty, available))
      if (qty <= 0) return

      adjustStock({
        sku: line.sku,
        qtyChange: -qty,
        type: 'outbound',
        reason: isKo ? `반출 바코드 실행 (${location})` : `Dispatch barcode execution (${location})`,
      })
      createDispatch({
        owner,
        sku: line.sku,
        name: line.name,
        qty,
        location,
        note: line.note || (isKo ? '바코드 반출' : 'Barcode dispatch'),
      })
    })

    setMessage(t(`반출 완료: ${lines.length}건 / 총 ${totalQty}EA`, `Dispatch completed: ${lines.length} lines / ${totalQty}EA`))
    speak(t('반출 처리 완료', 'Dispatch completed'))
    setLines([])
    setLocation('')
    setBarcodeInput('')
  }

  return (
    <Layout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t('반출 실행(바코드)', 'Dispatch Execution (Barcode)')}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">{t('스캔 순서: 로케이션 → 품목', 'Scan order: Location -> Item')}</p>
          </div>
          <button onClick={() => setVoiceOn((prev) => !prev)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
            {voiceOn ? t('음성: 켬', 'Voice: On') : t('음성: 끔', 'Voice: Off')}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 lg:grid-cols-4 gap-2">
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">{t('1. 화주 선택(필수)', '1. Select owner (required)')}</option>
            {customers.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={location} readOnly placeholder={t('2. 반출 로케이션(스캔)', '2. Dispatch location (scan)')} className="px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm" />
          <input
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleScan()
              }
            }}
            placeholder={t('3. 품목 바코드 입력 후 Enter', '3. Scan/enter item barcode and press Enter')}
            className="px-3 py-2.5 bg-yellow-200 text-slate-900 border border-yellow-500 rounded-lg text-sm"
          />
          <button onClick={handleScan} className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">{t('스캔 적용', 'Apply Scan')}</button>
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">{t(`총 ${lines.length}건 / 수량 ${totalQty}EA`, `Total ${lines.length} lines / Qty ${totalQty}EA`)}</div>
          <div className="flex gap-2">
            <button onClick={() => setLines((prev) => prev.map((line) => ({ ...line, qty: 1 })))} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('수량 초기화', 'Reset Quantities')}</button>
            <button onClick={executeDispatch} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm">{t('반출 실행', 'Execute Dispatch')}</button>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">{t('순번', 'No.')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('화주명', 'Owner')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('품목 정보', 'Item')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('공급처', 'Vendor')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('유통기한/로트번호', 'Expiry/Lot')}</th>
                <th className="text-right px-4 py-3 font-medium">{t('반출 수량', 'Dispatch qty')}</th>
                <th className="text-left px-4 py-3 font-medium">{t('메모', 'Memo')}</th>
                <th className="text-center px-4 py-3 font-medium">{t('제거', 'Remove')}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr key={line.sku} className="border-b border-slate-700/40 hover:bg-slate-700/30">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{line.owner}</td>
                  <td className="px-4 py-3"><div className="font-mono text-blue-300">{line.sku}</div><div>{line.name}</div></td>
                  <td className="px-4 py-3">{line.vendor}</td>
                  <td className="px-4 py-3">{line.expiry} / {line.lot}</td>
                  <td className="px-4 py-3 text-right">
                    <input type="number" min={1} value={line.qty} onChange={(e) => setLines((prev) => prev.map((target) => (target.sku === line.sku ? { ...target, qty: Number(e.target.value) } : target)))} className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-right" />
                  </td>
                  <td className="px-4 py-3">
                    <input value={line.note} onChange={(e) => setLines((prev) => prev.map((target) => (target.sku === line.sku ? { ...target, note: e.target.value } : target)))} className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setLines((prev) => prev.filter((target) => target.sku !== line.sku))} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">{t('삭제', 'Remove')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lines.length === 0 && <div className="p-10 text-center text-slate-500">{t('스캔된 품목이 없습니다.', 'No scanned items.')}</div>}
        </div>
      </div>
    </Layout>
  )
}
