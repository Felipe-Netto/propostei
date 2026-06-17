import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Phone, Mail, FileText, ChevronRight, Building2 } from 'lucide-react'
import { useCompany } from '@/context/CompanyContext'
import { maskPhone, maskDocument } from '@/lib/masks'
import {
  listClients,
  createClient,
  type Client,
  type CreateClientInput,
} from '@/api/clients-api'
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

interface FormState {
  name: string
  document: string
  phone: string
  email: string
  address: string
  notes: string
}

const emptyForm: FormState = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

export function ClientsPage() {
  const navigate = useNavigate()
  const { selectedId, selectedCompany, loading: loadingCompany } = useCompany()

  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setIsLoading(true)
    setFetchError(null)

    async function load() {
      try {
        const data = await listClients(selectedId)
        if (!cancelled) setClients(data)
      } catch (err) {
        if (!cancelled) setFetchError(extractApiError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [selectedId])

  function handleField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleMasked(field: keyof FormState, maskFn: (v: string) => string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: maskFn(e.target.value) }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId) return

    setSubmitError(null)
    setIsSubmitting(true)

    const input: CreateClientInput = { name: form.name }
    if (form.document.trim()) input.document = form.document.trim()
    if (form.phone.trim()) input.phone = form.phone.trim()
    if (form.email.trim()) input.email = form.email.trim()
    if (form.address.trim()) input.address = form.address.trim()
    if (form.notes.trim()) input.notes = form.notes.trim()

    try {
      const created = await createClient(selectedId, input)
      setClients((prev) => [created, ...prev])
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

  if (loadingCompany) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Carregando...
      </div>
    )
  }

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Building2 className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Nenhuma empresa selecionada</p>
        <p className="text-sm text-slate-400">Crie uma empresa para começar.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? '...' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente. Apenas o nome é obrigatório.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cl-name" className="font-medium text-slate-700">
                  Nome <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cl-name"
                  placeholder="Ex: João da Silva"
                  value={form.name}
                  onChange={handleField('name')}
                  required
                  maxLength={120}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-doc" className="font-medium text-slate-700">
                    CPF / Documento
                  </Label>
                  <Input
                    id="cl-doc"
                    placeholder="000.000.000-00"
                    value={form.document}
                    onChange={handleMasked('document', maskDocument)}
                    inputMode="numeric"
                    maxLength={18}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-phone" className="font-medium text-slate-700">
                    Telefone
                  </Label>
                  <Input
                    id="cl-phone"
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
                <Label htmlFor="cl-email" className="font-medium text-slate-700">
                  E-mail
                </Label>
                <Input
                  id="cl-email"
                  type="email"
                  placeholder="joao@email.com"
                  value={form.email}
                  onChange={handleField('email')}
                  maxLength={120}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cl-addr" className="font-medium text-slate-700">
                  Endereço
                </Label>
                <Input
                  id="cl-addr"
                  placeholder="Rua Exemplo, 123 - Cidade, UF"
                  value={form.address}
                  onChange={handleField('address')}
                  maxLength={255}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cl-notes" className="font-medium text-slate-700">
                  Observações
                </Label>
                <Input
                  id="cl-notes"
                  placeholder="Informações adicionais sobre o cliente"
                  value={form.notes}
                  onChange={handleField('notes')}
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
                  {isSubmitting ? 'Criando...' : 'Criar cliente'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">
          Carregando clientes...
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center py-20 text-sm text-red-500">
          {fetchError}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-7 w-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Nenhum cliente ainda</p>
            <p className="mt-1 text-sm text-slate-400">
              Cadastre o primeiro cliente desta empresa.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="mt-1 gap-1.5 bg-teal-600 font-semibold text-white hover:bg-teal-700 cursor-pointer">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {clients.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => navigate(`/clientes/${client.id}`)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                    {client.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {client.name}
                    </p>
                    {client.document && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <FileText className="h-3 w-3 shrink-0" />
                        {client.document}
                      </p>
                    )}
                  </div>

                  <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                    {client.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone className="h-3 w-3 shrink-0" />
                        {client.phone}
                      </p>
                    )}
                    {client.email && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3 w-3 shrink-0" />
                        {client.email}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
