import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, ChevronRight } from 'lucide-react'
import { maskPhone, maskDocument } from '@/lib/masks'
import {
  listCompanies,
  createCompany,
  type Company,
  type CompanyRole,
  type PlanType,
  type CreateCompanyInput,
} from '@/api/companies-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
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
  TEAM: 'bg-amber-50 text-amber-700',
}

interface FormState {
  name: string
  document: string
  phone: string
  email: string
  address: string
  logoUrl: string
}

const emptyForm: FormState = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  logoUrl: '',
}

export function CompaniesPage() {
  const navigate = useNavigate()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      try {
        const data = await listCompanies()
        if (!cancelled) setCompanies(data)
      } catch (err) {
        if (!cancelled) setFetchError(extractApiError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetch()
    return () => { cancelled = true }
  }, [])

  function handleField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleMasked(field: keyof FormState, maskFn: (v: string) => string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: maskFn(e.target.value) }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    const input: CreateCompanyInput = { name: form.name }
    if (form.document.trim()) input.document = form.document.trim()
    if (form.phone.trim()) input.phone = form.phone.trim()
    if (form.email.trim()) input.email = form.email.trim()
    if (form.address.trim()) input.address = form.address.trim()
    if (form.logoUrl.trim()) input.logoUrl = form.logoUrl.trim()

    try {
      await createCompany(input)
      const refreshed = await listCompanies()
      setCompanies(refreshed)
      setDialogOpen(false)
      setForm(emptyForm)
    } catch (err) {
      setSubmitError(extractApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setForm(emptyForm)
      setSubmitError(null)
    }
  }

  const createButton = (
    <Button className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700">
      <Plus className="h-4 w-4" />
      Nova Empresa
    </Button>
  )

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

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>{createButton}</DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Empresa</DialogTitle>
              <DialogDescription>
                Preencha os dados da empresa. Apenas o nome é obrigatório.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-name" className="font-medium text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="c-name"
                  placeholder="Ex: Netto Elétrica"
                  value={form.name}
                  onChange={handleField('name')}
                  required
                  maxLength={120}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-doc" className="font-medium text-slate-700">
                    CNPJ / Documento
                  </Label>
                  <Input
                    id="c-doc"
                    placeholder="00.000.000/0001-00"
                    value={form.document}
                    onChange={handleMasked('document', maskDocument)}
                    inputMode="numeric"
                    maxLength={18}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="c-phone" className="font-medium text-slate-700">
                    Telefone
                  </Label>
                  <Input
                    id="c-phone"
                    placeholder="(17) 99999-9999"
                    value={form.phone}
                    onChange={handleMasked('phone', maskPhone)}
                    inputMode="numeric"
                    maxLength={15}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-email" className="font-medium text-slate-700">
                  E-mail da empresa
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={form.email}
                  onChange={handleField('email')}
                  maxLength={120}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-addr" className="font-medium text-slate-700">
                  Endereço
                </Label>
                <Input
                  id="c-addr"
                  placeholder="Rua Exemplo, 123 - Cidade, UF"
                  value={form.address}
                  onChange={handleField('address')}
                  maxLength={255}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-logo" className="font-medium text-slate-700">
                  URL do logo
                </Label>
                <Input
                  id="c-logo"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  value={form.logoUrl}
                  onChange={handleField('logoUrl')}
                  maxLength={500}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
                  <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="text-sm text-red-600">{submitError}</span>
                </div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.name.trim()}
                  className="bg-teal-600 font-semibold text-white hover:bg-teal-700"
                >
                  {isSubmitting ? 'Criando...' : 'Criar empresa'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="mt-1 gap-1.5 bg-teal-600 font-semibold text-white hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                Nova Empresa
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => {
            const role = company.members[0]?.role ?? 'MEMBER'
            const plan = company.subscription?.plan ?? 'FREE'

            return (
              <button
                key={company.id}
                onClick={() =>
                  navigate(`/empresas/${company.id}/clientes`, {
                    state: { companyName: company.name },
                  })
                }
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-teal-200 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-teal-50">
                    <Building2 className="h-5 w-5 text-slate-500 transition-colors group-hover:text-teal-600" />
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
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-teal-500" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
