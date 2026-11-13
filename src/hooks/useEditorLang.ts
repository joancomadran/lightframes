import { useMemo, useState } from 'react'
import { editorCopy, editorLangFromLocation, type EditorCopy } from '../lib/editorCopy'
import { DEFAULT_LANG, ui, type Lang } from '../site/i18n'

export { editorLangFromLocation }

function detectEditorLang(): Lang {
  if (typeof document === 'undefined') return DEFAULT_LANG
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  return editorLangFromLocation(pathname, document.documentElement.lang)
}

export function useEditorLang() {
  const [lang] = useState(detectEditorLang)
  const strings = useMemo(() => ui[lang].collageExport, [lang])
  const copy = useMemo(() => editorCopy(lang), [lang])
  return { lang, strings, copy }
}

export type { EditorCopy }

export type CollageExportStrings = (typeof ui)[Lang]['collageExport']
