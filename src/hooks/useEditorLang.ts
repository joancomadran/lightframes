import { useMemo, useState } from 'react'
import { DEFAULT_LANG, ui, type Lang } from '../site/i18n'

const LANG_KEY = 'lightframes:lang'

function detectEditorLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    // Ignore storage errors.
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : ''
  return nav === 'es' ? 'es' : DEFAULT_LANG
}

export function useEditorLang() {
  const [lang] = useState(detectEditorLang)
  const strings = useMemo(() => ui[lang].collageExport, [lang])
  return { lang, strings }
}

export type CollageExportStrings = (typeof ui)[Lang]['collageExport']
