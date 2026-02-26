import { useState } from 'react'
import Layout from '../components/Layout'
import LanguageToggle from '../components/LanguageToggle'
import { useLanguage } from '../i18n/LanguageContext'
import { useExtendedModulesStore } from '../store/extendedModulesStore'

export default function NotificationCenter() {
  const { locale } = useLanguage()
  const isKo = locale === 'ko'

  const rules = useExtendedModulesStore((state) => state.notificationRules)
  const notifications = useExtendedModulesStore((state) => state.notifications)
  const addNotificationRule = useExtendedModulesStore((state) => state.addNotificationRule)
  const toggleRule = useExtendedModulesStore((state) => state.toggleRule)
  const addNotification = useExtendedModulesStore((state) => state.addNotification)
  const markNotificationRead = useExtendedModulesStore((state) => state.markNotificationRead)

  const [eventType, setEventType] = useState('SLA')
  const [condition, setCondition] = useState(isKo ? '출고 지연 +1일' : 'Outbound delay +1d')
  const [recipient, setRecipient] = useState('Ops Manager')
  const [message, setMessage] = useState(isKo ? '재고 부족 알림 테스트' : 'Low stock alert test')

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{isKo ? '알림/이벤트 센터' : 'Notification & Alert Center'}</h1>
            <LanguageToggle />
          </div>
          <p className="text-sm text-slate-400 mt-1">{isKo ? '알림 읽음/미읽음과 알림 룰(조건/수신자)을 함께 관리합니다.' : 'Manage read/unread alerts and notification rules (condition/recipient) in one place.'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">{isKo ? '알림 룰 설정' : 'Notification Rule Setup'}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input value={eventType} onChange={(e) => setEventType(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input value={condition} onChange={(e) => setCondition(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className="px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button onClick={() => addNotificationRule({ eventType, condition, recipient, enabled: true })} className="px-4 py-2.5 bg-blue-600 rounded-lg text-sm">{isKo ? '룰 추가' : 'Add Rule'}</button>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">{isKo ? '알림 발생 테스트' : 'Trigger Alert'}</p>
            <div className="flex gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              <button onClick={() => addNotification({ eventType, message, severity: 'warn' })} className="px-4 py-2.5 bg-amber-600 rounded-lg text-sm">{isKo ? '알림 추가' : 'Add Alert'}</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Condition</th>
                  <th className="text-left px-4 py-3 font-medium">Recipient</th>
                  <th className="text-center px-4 py-3 font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{rule.eventType}</td>
                    <td className="px-4 py-3">{rule.condition}</td>
                    <td className="px-4 py-3">{rule.recipient}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleRule(rule.id)} className={`text-xs px-2 py-1.5 rounded ${rule.enabled ? 'bg-emerald-600' : 'bg-slate-700'}`}>{rule.enabled ? 'ON' : 'OFF'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Message</th>
                  <th className="text-left px-4 py-3 font-medium">Severity</th>
                  <th className="text-center px-4 py-3 font-medium">Read</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50">
                    <td className="px-4 py-3">{item.message}</td>
                    <td className="px-4 py-3">{item.severity}</td>
                    <td className="px-4 py-3 text-center">
                      {item.read ? <span className="text-xs text-slate-400">read</span> : <button onClick={() => markNotificationRead(item.id)} className="text-xs px-2 py-1.5 bg-blue-600 rounded">{isKo ? '읽음 처리' : 'Mark Read'}</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
