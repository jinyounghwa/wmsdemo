import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useBillingStore } from '../store/billingStore'
import { usePartnerStore } from '../store/partnerStore'

export default function Billing() {
  const customers = usePartnerStore((state) => state.customers)
  const { rules, records, upsertRule, generateBill } = useBillingStore()

  const [customer, setCustomer] = useState(customers[0] ?? '')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [palletStorageRate, setPalletStorageRate] = useState(1200)
  const [cbmStorageRate, setCbmStorageRate] = useState(350)
  const [inboundFee, setInboundFee] = useState(1800)
  const [outboundFee, setOutboundFee] = useState(2200)
  const [packagingFee, setPackagingFee] = useState(400)
  const [vasTagFee, setVasTagFee] = useState(120)
  const [vasIronFee, setVasIronFee] = useState(450)
  const [vasGiftWrapFee, setVasGiftWrapFee] = useState(700)

  const [palletDays, setPalletDays] = useState(0)
  const [cbmDays, setCbmDays] = useState(0)
  const [inboundCount, setInboundCount] = useState(0)
  const [outboundCount, setOutboundCount] = useState(0)
  const [packagingCount, setPackagingCount] = useState(0)
  const [vasTagCount, setVasTagCount] = useState(0)
  const [vasIronCount, setVasIronCount] = useState(0)
  const [vasGiftWrapCount, setVasGiftWrapCount] = useState(0)

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">정산 관리 (3PL)</h1>
            <LanguageToggle />
          </div>
          <p className="text-slate-400 text-sm mt-1">화주사별 보관료/작업료/부자재 사용료 기준을 관리하고 월 청구 데이터를 생성합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-3">
            <h2 className="text-sm font-semibold">정산 단가 설정</h2>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {customers.map((name) => <option key={name}>{name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={palletStorageRate} onChange={(e) => setPalletStorageRate(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="팔렛트 보관료" />
              <input type="number" value={cbmStorageRate} onChange={(e) => setCbmStorageRate(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="체적 보관료" />
              <input type="number" value={inboundFee} onChange={(e) => setInboundFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="입고 작업료" />
              <input type="number" value={outboundFee} onChange={(e) => setOutboundFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="출고 작업료" />
              <input type="number" value={packagingFee} onChange={(e) => setPackagingFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm col-span-2" placeholder="부자재 사용료" />
              <input type="number" value={vasTagFee} onChange={(e) => setVasTagFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="택부착 단가" />
              <input type="number" value={vasIronFee} onChange={(e) => setVasIronFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="다림질 단가" />
              <input type="number" value={vasGiftWrapFee} onChange={(e) => setVasGiftWrapFee(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm col-span-2" placeholder="기프트랩 단가" />
            </div>
            <button
              onClick={() => upsertRule({ customer, palletStorageRate, cbmStorageRate, inboundFee, outboundFee, packagingFee, vasTagFee, vasIronFee, vasGiftWrapFee })}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm"
            >
              단가 저장
            </button>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-3">
            <h2 className="text-sm font-semibold">월 정산 생성</h2>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={palletDays} onChange={(e) => setPalletDays(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="팔렛트-일" />
              <input type="number" value={cbmDays} onChange={(e) => setCbmDays(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="CBM-일" />
              <input type="number" value={inboundCount} onChange={(e) => setInboundCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="입고 건수" />
              <input type="number" value={outboundCount} onChange={(e) => setOutboundCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="출고 건수" />
              <input type="number" value={packagingCount} onChange={(e) => setPackagingCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm col-span-2" placeholder="부자재 사용 수량" />
              <input type="number" value={vasTagCount} onChange={(e) => setVasTagCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="택부착 건수" />
              <input type="number" value={vasIronCount} onChange={(e) => setVasIronCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="다림질 건수" />
              <input type="number" value={vasGiftWrapCount} onChange={(e) => setVasGiftWrapCount(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm col-span-2" placeholder="기프트랩 건수" />
            </div>
            <button
              onClick={() => generateBill({ month, customer, palletDays, cbmDays, inboundCount, outboundCount, packagingCount, vasTagCount, vasIronCount, vasGiftWrapCount, vasAmount: 0 })}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
            >
              청구 데이터 생성
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">화주사</th>
                  <th className="text-right px-4 py-3 font-medium">보관(팔렛/CBM)</th>
                  <th className="text-right px-4 py-3 font-medium">입출고</th>
                  <th className="text-right px-4 py-3 font-medium">부자재</th>
                  <th className="text-right px-4 py-3 font-medium">VAS(택/다림/랩)</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.customer} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{rule.customer}</td>
                    <td className="px-4 py-3 text-right">{rule.palletStorageRate} / {rule.cbmStorageRate}</td>
                    <td className="px-4 py-3 text-right">{rule.inboundFee} / {rule.outboundFee}</td>
                    <td className="px-4 py-3 text-right">{rule.packagingFee}</td>
                    <td className="px-4 py-3 text-right">{rule.vasTagFee} / {rule.vasIronFee} / {rule.vasGiftWrapFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">월/화주</th>
                  <th className="text-right px-4 py-3 font-medium">VAS 매출</th>
                  <th className="text-right px-4 py-3 font-medium">총 청구액</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{record.month} · {record.customer}</td>
                    <td className="px-4 py-3 text-right text-blue-300">{record.vasAmount.toLocaleString()} 원</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-300">{record.totalAmount.toLocaleString()} 원</td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-500">생성된 정산 데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
