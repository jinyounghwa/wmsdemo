import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useReturnOpsStore } from '../store/returnOpsStore'
import { useInventoryStore } from '../store/inventoryStore'

type VoiceType = 'female' | 'male' | 'child' | 'rapper'

type ScanRow = {
  sku: string
  name: string
  receivedQty: number
  inboundQty: number
  expiry: string
  lot: string
}

export default function ReturnB2CExecution() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'
  const t = (ko: string, en: string) => (isKo ? ko : en)

  const orders = useReturnOpsStore((state) => state.b2cOrders)
  const confirmOrder = useReturnOpsStore((state) => state.confirmB2COrder)
  const items = useInventoryStore((state) => state.items)
  const adjustStock = useInventoryStore((state) => state.adjustStock)

  const [barcode, setBarcode] = useState('')
  const [orderKeyword, setOrderKeyword] = useState('')
  const [currentOrderId, setCurrentOrderId] = useState('')
  const [scanRows, setScanRows] = useState<ScanRow[]>([])
  const [voiceOn, setVoiceOn] = useState(true)
  const [voiceType, setVoiceType] = useState<VoiceType>('female')
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [message, setMessage] = useState('')

  const currentOrder = useMemo(() => orders.find((order) => order.id === currentOrderId) ?? null, [orders, currentOrderId])

  const speak = (text: string) => {
    if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = isKo ? 'ko-KR' : 'en-US'
    utter.rate = voiceType === 'rapper' ? 1.25 : voiceType === 'child' ? 1.1 : 1
    utter.pitch = voiceType === 'female' ? 1.3 : voiceType === 'male' ? 0.9 : voiceType === 'child' ? 1.6 : 1
    window.speechSynthesis.speak(utter)
  }

  const findOrderByTracking = (code: string) => {
    const order = orders.find((row) => row.trackingNo.toUpperCase() === code || row.salesOrderNo.toUpperCase() === code)
    if (!order) return null
    setCurrentOrderId(order.id)
    setScanRows([])
    return order
  }

  const handleScan = () => {
    const code = barcode.trim().toUpperCase()
    if (!code) return

    if (!currentOrder) {
      const order = findOrderByTracking(code)
      if (!order) {
        const msg = t(`반품 송장/주문 없음: ${code}`, `Tracking/order not found: ${code}`)
        setMessage(msg)
        speak(msg)
        return
      }
      const msg = t(`반품 오더 확인: ${order.id}`, `Order loaded: ${order.id}`)
      setMessage(msg)
      setBarcode('')
      speak(msg)
      return
    }

    const item = items.find((row) => row.sku.toUpperCase() === code)
    if (!item || item.sku !== currentOrder.sku) {
      const msg = t(`품목 바코드 불일치: ${code}`, `Item barcode mismatch: ${code}`)
      setMessage(msg)
      speak(msg)
      return
    }

    setScanRows((prev) => {
      const existing = prev.find((row) => row.sku === item.sku)
      if (existing) {
        return prev.map((row) => (row.sku === item.sku ? { ...row, receivedQty: row.receivedQty + 1, inboundQty: row.inboundQty + 1 } : row))
      }
      return [
        ...prev,
        {
          sku: item.sku,
          name: item.name,
          receivedQty: 1,
          inboundQty: 1,
          expiry: `2026-12-${String((item.sku.length % 27) + 1).padStart(2, '0')}`,
          lot: `LOT-${item.sku.replace('SKU-', '')}-01`,
        },
      ]
    })
    setBarcode('')
    const msg = t(`품목 스캔: ${item.sku}`, `Item scanned: ${item.sku}`)
    setMessage(msg)
    speak(msg)
  }

  const searchOrder = () => {
    const key = orderKeyword.trim().toLowerCase()
    if (!key) return
    const target = orders.find((row) => row.salesOrderNo.toLowerCase().includes(key) || row.recipient.toLowerCase().includes(key) || row.id.toLowerCase().includes(key))
    if (!target) {
      setMessage(t('주문 검색 결과가 없습니다.', 'No matching order found.'))
      return
    }
    setCurrentOrderId(target.id)
    setScanRows([])
    setMessage(t(`주문 검색 완료: ${target.id}`, `Order selected: ${target.id}`))
  }

  const confirmReturn = () => {
    if (!currentOrder || scanRows.length === 0) return
    const qty = scanRows.reduce((sum, row) => sum + row.inboundQty, 0)
    confirmOrder(currentOrder.id, qty)
    scanRows.forEach((row) => {
      adjustStock({
        sku: row.sku,
        qtyChange: row.inboundQty,
        type: 'inbound',
        reason: isKo ? `B2C 반품 확정 (${currentOrder.id})` : `B2C return confirmed (${currentOrder.id})`,
      })
    })
    setMessage(t(`반품 확정 완료: ${currentOrder.id}`, `Return confirmed: ${currentOrder.id}`))
    speak(t('반품 확정 완료', 'Return confirmed'))
    setCurrentOrderId('')
    setScanRows([])
    setBarcode('')
    setOrderKeyword('')
  }

  return (
    <Layout>
      <div className="p-6 pb-28 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{t('B2C 반품 실행', 'B2C Return Execution')}</h1>
              <LanguageToggle />
            </div>
            <p className="text-sm text-slate-400 mt-1">{t('스캔 순서: 반품 송장 → 품목', 'Scan order: Return tracking -> Item')}</p>
          </div>
          <button onClick={() => setVoiceModalOpen(true)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
            {t('음성 설정', 'Voice Settings')}
          </button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-300">{t('반품 송장/ 품목 바코드 스캔 또는 입력 후 Enter 하여 진행해 주세요. (스캔 순서 : 반품 송장→품목)', 'Scan or type return tracking/item barcode then press Enter. (Order: Return tracking -> Item)')}</p>
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleScan()
              }
            }}
            placeholder={t('바코드 입력', 'Barcode input')}
            className="w-full px-3 py-2.5 bg-yellow-200 text-slate-900 border border-yellow-500 rounded-lg text-sm"
          />
        </div>

        {message && <div className="text-sm text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
            <h2 className="font-semibold">{t('주문', 'Order')}</h2>
            <div className="flex gap-2">
              <input value={orderKeyword} onChange={(e) => setOrderKeyword(e.target.value)} placeholder={t('판매주문번호/수령자 검색', 'Search sales order/recipient')} className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm" />
              <button onClick={searchOrder} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('주문 검색', 'Search Order')}</button>
            </div>
            {!currentOrder ? (
              <div className="text-sm text-slate-400 border border-dashed border-slate-600 rounded p-4">
                {t('주문 정보 확인을 위해 반품 송장을 스캔(입력)해 주세요. 반품 송장이 없는 경우, 주문 검색을 통해 주문을 입력해 주세요.', 'Scan return tracking to load order. If there is no tracking, use order search.')}
              </div>
            ) : (
              <div className="text-sm space-y-2">
                <div>{t('반품 오더 번호', 'Return order no.')}: <span className="font-mono text-blue-300">{currentOrder.id}</span></div>
                <div>{t('판매 주문 번호', 'Sales order no.')}: <span className="font-mono">{currentOrder.salesOrderNo}</span></div>
                <div>{t('반품 송장', 'Return tracking')}: <span className="font-mono">{currentOrder.trackingNo}</span></div>
                <div>{t('수령자', 'Recipient')}: {currentOrder.recipient}</div>
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('품목', 'Items')}</h2>
              <button onClick={() => setScanRows([])} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">{t('스캔 초기화', 'Reset Scans')}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="text-left px-2 py-2 font-medium">{t('순번', 'No.')}</th>
                    <th className="text-left px-2 py-2 font-medium">{t('품목 정보', 'Item')}</th>
                    <th className="text-right px-2 py-2 font-medium">{t('접수 수량', 'Received')}</th>
                    <th className="text-right px-2 py-2 font-medium">{t('입고 수량', 'Inbound')}</th>
                    <th className="text-left px-2 py-2 font-medium">{t('유통기한·로트번호', 'Expiry/Lot')}</th>
                  </tr>
                </thead>
                <tbody>
                  {scanRows.map((row, idx) => (
                    <tr key={row.sku} className="border-b border-slate-700/40">
                      <td className="px-2 py-2">{idx + 1}</td>
                      <td className="px-2 py-2"><div className="font-mono text-blue-300">{row.sku}</div><div>{row.name}</div></td>
                      <td className="px-2 py-2 text-right">{row.receivedQty}</td>
                      <td className="px-2 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          value={row.inboundQty}
                          onChange={(e) => setScanRows((prev) => prev.map((target) => (target.sku === row.sku ? { ...target, inboundQty: Number(e.target.value) } : target)))}
                          className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-right"
                        />
                      </td>
                      <td className="px-2 py-2">{row.expiry} / {row.lot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {scanRows.length === 0 && <div className="text-sm text-slate-400 py-6 text-center">{t('주문 정보 확인 후, 품목 확인이 가능합니다.', 'Items are available after order is loaded.')}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-60 right-0 z-20 bg-[#0f172a] border-t border-slate-700 p-3">
        <button onClick={confirmReturn} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium">
          {t('반품 확정', 'Confirm Return')}
        </button>
      </div>

      {voiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">{t('음성 설정', 'Voice Settings')}</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setVoiceType('female'); setVoiceOn(true) }} className={`px-3 py-2 rounded text-sm ${voiceType === 'female' ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('여성', 'Female')}</button>
              <button onClick={() => { setVoiceType('male'); setVoiceOn(true) }} className={`px-3 py-2 rounded text-sm ${voiceType === 'male' ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('남성', 'Male')}</button>
              <button onClick={() => { setVoiceType('child'); setVoiceOn(true) }} className={`px-3 py-2 rounded text-sm ${voiceType === 'child' ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('어린이', 'Child')}</button>
              <button onClick={() => { setVoiceType('rapper'); setVoiceOn(true) }} className={`px-3 py-2 rounded text-sm ${voiceType === 'rapper' ? 'bg-blue-600' : 'bg-slate-700'}`}>{t('랩퍼', 'Rapper')}</button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{voiceOn ? t('음성 켬', 'Voice On') : t('음성 끔', 'Voice Off')}</span>
              <button onClick={() => setVoiceOn((prev) => !prev)} className="px-3 py-1.5 bg-slate-700 rounded text-sm">{t('토글', 'Toggle')}</button>
            </div>
            <button onClick={() => setVoiceModalOpen(false)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">{t('닫기', 'Close')}</button>
          </div>
        </div>
      )}
    </Layout>
  )
}
