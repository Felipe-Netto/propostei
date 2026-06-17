import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { listCompanies, type Company } from '@/api/companies-api'

const STORAGE_KEY = 'propostei:selectedCompanyId'

interface CompanyContextType {
  companies: Company[]
  selectedId: string
  setSelectedId: (id: string) => void
  selectedCompany: Company | undefined
  loading: boolean
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | null>(null)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedId, setSelectedIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? '',
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listCompanies()
      .then((data) => {
        setCompanies(data)
        setSelectedIdState((prev) => {
          const exists = data.some((c) => c.id === prev)
          if (exists) return prev
          return data[0]?.id ?? ''
        })
      })
      .finally(() => setLoading(false))
  }, [])

  function setSelectedId(id: string) {
    localStorage.setItem(STORAGE_KEY, id)
    setSelectedIdState(id)
  }

  async function refreshCompanies(): Promise<void> {
    const data = await listCompanies()
    setCompanies(data)
  }

  const selectedCompany = companies.find((c) => c.id === selectedId)

  return (
    <CompanyContext.Provider value={{ companies, selectedId, setSelectedId, selectedCompany, loading, refreshCompanies }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used inside CompanyProvider')
  return ctx
}
