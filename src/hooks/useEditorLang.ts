import { useMemo, useState } from 'react'
import { DEFAULT_LANG, ui, type Lang } from '../site/i18n'

/** Editor copy follows the page route: English on /editor, Spanish on /es/editor. */
export function editorLangFromLocation(pathname: string, htmlLang: string): Lang {
  const lang = htmlLang.toLowerCase()
  if (lang.startsWith('es')) return 'es'
  if (lang.startsWith('en')) return 'en'
  return pathname === '/es' || pathname.startsWith('/es/') ? 'es' : DEFAULT_LANG
}

function detectEditorLang(): Lang {
  if (typeof document === 'undefined') return DEFAULT_LANG
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  return editorLangFromLocation(pathname, document.documentElement.lang)
}

export function useEditorLang() {
  const [lang] = useState(detectEditorLang)
  const strings = useMemo(() => ui[lang].collageExport, [lang])
  return { lang, strings }
}

export type CollageExportStrings = (typeof ui)[Lang]['collageExport']
