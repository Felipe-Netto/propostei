import { useEffect, useState } from 'react'
import { Building2, Plus, ChevronRight } from 'lucide-react'
import {
  listCompanies,
  type Company,
  type CompanyRole,
  type PlanType,
} from '@/api/companies-api'
import { Button } from '@/components/ui/button'
import { CreateCompanyDialog } from '@/components/CreateCompanyDialog'
import { extractApiError } from '@/lib/utils'

const roleLabelMap: Record<CompanyRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MEMBER: 'Membro',
}

const roleColorMap: Record<CompanyRole, string> = {
  OWNER: 'bg-teal-50 text-teal-700 ring-teal-200',
  ADMIN: 'bg-blue-50 text-blue-700 ring-blue-200',
  MEMBER: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const planLabelMap: Record<PlanType, string> = {
  FREE: 'Grátis',
  PRO: 'Pro',
  TEAM: 'Team',
}

const planColorMap: Record<PlanType, string> = {
  FREE: 'bg-slate-100 text-slate-500',
  PRO: 'bg-purple-50 text-purple-700',
  TEAM: 'bg-blue-50 text-blue-700',
}

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    listCompanies()
      .then((data) => { if (!cancelled) setCompanies(data) })
      .catch((err) => { if (!cancelled) setFetchError(extractApiError(err)) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [])

  function handleCreated(company: Company) {
    setCompanies((prev) => [...prev, company])
  }

  return (
    <div className="flex flex-col gap-7">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Empresas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie suas empresas e dados cadastrais.
          </p>
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Nova Empresa
        </Button>
      </div>

      <CreateCompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">
          Carregando empresas...
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center py-20 text-sm text-red-500">
          {fetchError}
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Building2 className="h-7 w-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Nenhuma empresa ainda</p>
            <p className="mt-1 text-sm text-slate-400">
              Crie sua primeira empresa para começar a gerenciar propostas.
            </p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-1 gap-1.5 bg-teal-600 font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => {
            const role = company.members[0]?.role ?? 'MEMBER'
            const plan = company.subscription?.plan ?? 'FREE'

            return (
              <div
                key={company.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 className="h-5 w-5 text-slate-500" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${planColorMap[plan]}`}>
                    {planLabelMap[plan]}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{company.name}</p>
                    <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${roleColorMap[role]}`}>
                      {roleLabelMap[role]}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
