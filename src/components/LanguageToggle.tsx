import { Languages } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="fixed right-5 top-4 z-[9999]">
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 p-1 shadow-lg backdrop-blur">
        <Languages className="h-4 w-4 text-slate-400 ml-2" />
        <button
          type="button"
          onClick={() => setLocale('ko')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            locale === 'ko' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          한글
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            locale === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          ENG
        </button>
      </div>
    </div>
  )
}
