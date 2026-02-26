import { useState } from 'react'
import Layout from '../components/Layout'
import { usePartnerStore } from '../store/partnerStore'

function Section({
  title,
  items,
  value,
  onChange,
  onAdd,
}: {
  title: string
  items: string[]
  value: string
  onChange: (value: string) => void
  onAdd: () => void
}) {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5 space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white outline-none focus:border-blue-500"
          placeholder={`${title}명 입력`}
        />
        <button
          onClick={onAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
        >
          추가
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="text-xs px-2.5 py-1 bg-slate-700 border border-slate-600 rounded-full text-slate-200">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MasterData() {
  const { vendors, customers, carriers, addVendor, addCustomer, addCarrier } = usePartnerStore()
  const [vendorInput, setVendorInput] = useState('')
  const [customerInput, setCustomerInput] = useState('')
  const [carrierInput, setCarrierInput] = useState('')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">마스터 관리</h1>
          <p className="text-slate-400 text-sm mt-1">공급사, 고객사, 운송사를 관리합니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Section
            title="공급사"
            items={vendors}
            value={vendorInput}
            onChange={setVendorInput}
            onAdd={() => {
              addVendor(vendorInput)
              setVendorInput('')
            }}
          />
          <Section
            title="고객사"
            items={customers}
            value={customerInput}
            onChange={setCustomerInput}
            onAdd={() => {
              addCustomer(customerInput)
              setCustomerInput('')
            }}
          />
          <Section
            title="운송사"
            items={carriers}
            value={carrierInput}
            onChange={setCarrierInput}
            onAdd={() => {
              addCarrier(carrierInput)
              setCarrierInput('')
            }}
          />
        </div>
      </div>
    </Layout>
  )
}
