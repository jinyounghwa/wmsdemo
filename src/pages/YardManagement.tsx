import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function YardManagement() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const yardAppointments = useExtendedModulesStore((state) => state.yardAppointments)
  const createYardAppointment = useExtendedModulesStore((state) => state.createYardAppointment)
  const updateYardStatus = useExtendedModulesStore((state) => state.updateYardStatus)
  const updateYardWaiting = useExtendedModulesStore((state) => state.updateYardWaiting)

  const [truckNo, setTruckNo] = useState('12나3456')
  const [carrier, setCarrier] = useState('CJ대한통운')
  const [dockDoor, setDockDoor] = useState('DOOR-01')
  const [slot, setSlot] = useState('10:00-10:30')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '야드 관리 (Yard Management)' : 'Yard Management'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '도착 예약, 야드 위치, 도크 도어 스케줄 및 대기 시간을 통제합니다.' : 'Control truck appointment, yard position, dock scheduling, and waiting time.'}</p>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={truckNo} onChange={(e) => setTruckNo(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '차량번호' : 'Truck No'} />
          <input value={carrier} onChange={(e) => setCarrier(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '운송사' : 'Carrier'} />
          <input value={dockDoor} onChange={(e) => setDockDoor(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '도어' : 'Door'} />
          <input value={slot} onChange={(e) => setSlot(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" placeholder={isKo ? '예약 슬롯' : 'Time Slot'} />
          <button onClick={() => createYardAppointment({ id: `YARD-${Date.now()}`, truckNo, carrier, dockDoor, slot })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '예약 등록' : 'Create Appointment'}</button>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">Truck</th>
                <th className="text-left px-4 py-3 font-medium">Carrier</th>
                <th className="text-left px-4 py-3 font-medium">Door/Slot</th>
                <th className="text-right px-4 py-3 font-medium">Waiting(min)</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {yardAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{appointment.truckNo}</td>
                  <td className="px-4 py-3">{appointment.carrier}</td>
                  <td className="px-4 py-3">{appointment.dockDoor} / {appointment.slot}</td>
                  <td className="px-4 py-3 text-right">{appointment.waitingMinutes}</td>
                  <td className="px-4 py-3">{appointment.status}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    {['arrived', 'atYard', 'atDock', 'completed'].map((status) => (
                      <button key={status} onClick={() => updateYardStatus(appointment.id, status as 'arrived' | 'atYard' | 'atDock' | 'completed')} className="text-xs px-2 py-1.5 bg-slate-700 rounded">{status}</button>
                    ))}
                    <button onClick={() => updateYardWaiting(appointment.id, appointment.waitingMinutes + 10)} className="text-xs px-2 py-1.5 bg-amber-600 rounded">+10</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
