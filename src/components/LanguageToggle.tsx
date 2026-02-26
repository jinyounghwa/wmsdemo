import { Languages } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

type LanguageToggleProps = {
  mode?: 'inline' | 'floating-right'
}

export default function LanguageToggle({ mode = 'inline' }: LanguageToggleProps) {
  const { locale, setLocale } = useLanguage()

  return (
    <div className={mode === 'floating-right' ? 'fixed right-5 top-4 z-[9999]' : ''}>
      <div className={`inline-flex items-center gap-1 rounded-xl border p-1 ${mode === 'floating-right' ? 'border-slate-700 bg-slate-900/90 shadow-lg backdrop-blur' : 'border-slate-600/70 bg-slate-800/70'}`}>
        <Languages className="h-4 w-4 text-slate-400 ml-1.5" />
        <button
          type="button"
          onClick={() => setLocale('ko')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            locale === 'ko' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          KO
        </button>
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            locale === 'en' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          EN
        </button>
      </div>
    </div>
  )
}
