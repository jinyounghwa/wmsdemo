import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function QualityControl() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const inspections = useExtendedModulesStore((state) => state.qcInspections)
  const addQcInspection = useExtendedModulesStore((state) => state.addQcInspection)

  const [refNo, setRefNo] = useState('PO-NEW-001')
  const [samplingRate, setSamplingRate] = useState(10)
  const [criteria, setCriteria] = useState(isKo ? '외관/기능/포장' : 'Appearance/Function/Label')
  const [inspector, setInspector] = useState('QC-A')
  const [result, setResult] = useState<'pass' | 'fail' | 'hold'>('hold')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? 'QC/품질 관리' : 'Quality Control'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '검사 기준, 샘플링 비율, 판정 결과 및 QC 이력을 관리합니다.' : 'Manage inspection criteria, sampling rate, result decisions, and QC audit history.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input value={refNo} onChange={(e) => setRefNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder="Ref" />
          <input type="number" value={samplingRate} onChange={(e) => setSamplingRate(Number(e.target.value))} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input value={criteria} onChange={(e) => setCriteria(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '검사기준' : 'Criteria'} />
          <input value={inspector} onChange={(e) => setInspector(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '검사자' : 'Inspector'} />
          <select value={result} onChange={(e) => setResult(e.target.value as 'pass' | 'fail' | 'hold')} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="pass">pass</option>
            <option value="fail">fail</option>
            <option value="hold">hold</option>
          </select>
          <button onClick={() => addQcInspection({ refNo, samplingRate, criteria, inspector, result })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '검사 등록' : 'Add Inspection'}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Ref</th>
                <th className="text-right px-4 py-3 font-medium">Sampling(%)</th>
                <th className="text-left px-4 py-3 font-medium">Criteria</th>
                <th className="text-left px-4 py-3 font-medium">Inspector</th>
                <th className="text-left px-4 py-3 font-medium">Result</th>
                <th className="text-left px-4 py-3 font-medium">At</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((inspection) => (
                <tr key={inspection.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{inspection.refNo}</td>
                  <td className="px-4 py-3 text-right">{inspection.samplingRate}</td>
                  <td className="px-4 py-3">{inspection.criteria}</td>
                  <td className="px-4 py-3">{inspection.inspector}</td>
                  <td className="px-4 py-3">{inspection.result}</td>
                  <td className="px-4 py-3">{inspection.inspectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
