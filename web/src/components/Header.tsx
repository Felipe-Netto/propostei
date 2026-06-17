import { useState } from 'react'
import { LogOut, Menu, Building2, ChevronDown, Plus, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useCompany } from '@/context/CompanyContext'
import { Button } from '@/components/ui/button'
import { CreateCompanyDialog } from '@/components/CreateCompanyDialog'
import { EditCompanyDialog } from '@/components/EditCompanyDialog'
import type { Company } from '@/api/companies-api'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { companies, selectedId, setSelectedId, loading, refreshCompanies } = useCompany()
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  async function handleCompanyCreated(company: Company) {
    await refreshCompanies()
    setSelectedId(company.id)
  }

  async function handleCompanyUpdated() {
    await refreshCompanies()
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">

      {/* Left: menu button + company select */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {!loading && companies.length > 0 && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        )}

        {!loading && selectedId && (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Editar empresa"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-teal-600 text-white transition-colors hover:bg-teal-700"
          aria-label="Nova empresa"
        >
          <Plus className="h-4 w-4" />
        </button>

        <CreateCompanyDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleCompanyCreated}
        />

        {selectedId && (
          <EditCompanyDialog
            companyId={selectedId}
            open={editOpen}
            onOpenChange={setEditOpen}
            onUpdated={handleCompanyUpdated}
          />
        )}
      </div>

      {/* Right: user area + logout */}
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            U
          </div>
          <span className="text-sm text-slate-600">Conta</span>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-slate-500 hover:text-slate-800"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  )
}
