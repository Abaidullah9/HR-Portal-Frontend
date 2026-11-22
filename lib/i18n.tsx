'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Language = 'en' | 'es' | 'fr'

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
]

/**
 * The shell is translated; page content stays in the organization's working
 * language. Keys are the English strings so an untranslated key degrades to
 * readable English instead of a missing-key token.
 */
const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    Dashboard: 'Panel',
    'My workspace': 'Mi espacio',
    Employees: 'Empleados',
    Attendance: 'Asistencia',
    Leave: 'Permisos',
    Payroll: 'Nómina',
    Recruitment: 'Reclutamiento',
    Performance: 'Desempeño',
    Organization: 'Organización',
    Reports: 'Informes',
    'Audit trail': 'Auditoría',
    Settings: 'Ajustes',
    'Jump to a page or person…': 'Ir a una página o persona…',
    'Search pages and people': 'Buscar páginas y personas',
    Page: 'Página',
    'Nothing matches': 'Sin coincidencias para',
  },
  fr: {
    Dashboard: 'Tableau de bord',
    'My workspace': 'Mon espace',
    Employees: 'Employés',
    Attendance: 'Présence',
    Leave: 'Congés',
    Payroll: 'Paie',
    Recruitment: 'Recrutement',
    Performance: 'Performance',
    Organization: 'Organisation',
    Reports: 'Rapports',
    'Audit trail': 'Journal d’audit',
    Settings: 'Paramètres',
    'Jump to a page or person…': 'Aller à une page ou une personne…',
    'Search pages and people': 'Rechercher des pages et des personnes',
    Page: 'Page',
    'Nothing matches': 'Aucun résultat pour',
  },
}

interface I18nValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nValue | null>(null)
const STORAGE_KEY = 'hr-language'

const isLanguage = (value: string | null): value is Language =>
  value === 'en' || value === 'es' || value === 'fr'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  // The stored choice is read after mount so the server-rendered shell and the
  // first client render agree; switching language then updates without reload.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isLanguage(stored)) setLanguageState(stored)
    } catch {
      // A blocked localStorage leaves the default language in place.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Preference still applies for this session.
    }
  }, [])

  const t = useCallback(
    (key: string) => DICTIONARY[language][key] ?? key,
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

const FALLBACK: I18nValue = { language: 'en', setLanguage: () => undefined, t: (key) => key }

/** Outside the provider (isolated component tests) English is the safe default. */
export function useI18n(): I18nValue {
  return useContext(I18nContext) ?? FALLBACK
}
