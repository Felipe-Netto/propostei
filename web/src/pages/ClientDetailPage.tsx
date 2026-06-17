import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, FileText, Plus, ChevronRight, Pencil } from 'lucide-react'
import { useCompany } from '@/context/CompanyContext'
import { getClient, updateClient, type Client } from '@/api/clients-api'
import { listClientQuotes, type Quote, type QuoteStatus } from '@/api/quotes-api'
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
import { extractApiError, formatBRL, formatDate } from '@/lib/utils'
import { maskPhone, maskDocument } from '@/lib/masks'

const statusLabel: Record<QuoteStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviada',
  VIEWED: 'Visualizada',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  CANCELED: 'Cancelada',
  EXPIRED: 'Expirada',
}

const statusColor: Record<QuoteStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-500',
  SENT: 'bg-blue-50 text-blue-700',
  VIEWED: 'bg-violet-50 text-violet-700',
  APPROVED: 'bg-teal-50 text-teal-700',
  REJECTED: 'bg-red-50 text-red-600',
  CANCELED: 'bg-slate-100 text-slate-400',
  EXPIRED: 'bg-amber-50 text-amber-700',
}

export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { selectedId: companyId } = useCompany()

  const [client, setClient] = useState<Client | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', document: '', phone: '', email: '', address: '', notes: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId || !clientId) return
    let cancelled = false

    async function load() {
      try {
        const [clientData, clientQuotes] = await Promise.all([
          getClient(companyId, clientId!),
          listClientQuotes(companyId, clientId!),
        ])
        if (!cancelled) {
          setClient(clientData)
          setQuotes(clientQuotes)
        }
      } catch (err) {
        if (!cancelled) setError(extractApiError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [companyId, clientId])

  function openEdit() {
    if (!client) return
    setEditForm({
      name: client.name,
      document: client.document ?? '',
      phone: client.phone ?? '',
      email: client.email ?? '',
      address: client.address ?? '',
      notes: client.notes ?? '',
    })
    setUpdateError(null)
    setEditOpen(true)
  }

  function handleEditField(field: keyof typeof editForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleEditMasked(field: keyof typeof editForm, maskFn: (v: string) => string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((prev) => ({ ...prev, [field]: maskFn(e.target.value) }))
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !clientId) return
    setUpdateError(null)
    setIsUpdating(true)
    try {
      const updated = await updateClient(companyId, clientId, {
        name: editForm.name.trim(),
        document: editForm.document.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        address: editForm.address.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
      })
      setClient(updated)
      setEditOpen(false)
    } catch (err) {
      setUpdateError(extractApiError(err))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Carregando...
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        {error ?? 'Cliente não encontrado.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <button
        onClick={() => navigate('/clientes')}
        className="flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Clientes
      </button>

      {/* Client header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-500">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
            {client.document && (
              <p className="text-sm text-slate-400">{client.document}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openEdit}
                variant="outline"
                className="h-9 gap-1.5 border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>Atualize os dados do cliente.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ed-name" className="font-medium text-slate-700">
                    Nome <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ed-name"
                    value={editForm.name}
                    onChange={handleEditField('name')}
                    required
                    maxLength={120}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ed-doc" className="font-medium text-slate-700">CPF / Documento</Label>
                    <Input
                      id="ed-doc"
                      placeholder="000.000.000-00"
                      value={editForm.document}
                      onChange={handleEditMasked('document', maskDocument)}
                      inputMode="numeric"
                      maxLength={18}
                      className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ed-phone" className="font-medium text-slate-700">Telefone</Label>
                    <Input
                      id="ed-phone"
                      placeholder="(17) 99999-9999"
                      value={editForm.phone}
                      onChange={handleEditMasked('phone', maskPhone)}
                      inputMode="numeric"
                      maxLength={15}
                      className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ed-email" className="font-medium text-slate-700">E-mail</Label>
                  <Input
                    id="ed-email"
                    type="email"
                    placeholder="joao@email.com"
                    value={editForm.email}
                    onChange={handleEditField('email')}
                    maxLength={120}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ed-addr" className="font-medium text-slate-700">Endereço</Label>
                  <Input
                    id="ed-addr"
                    placeholder="Rua Exemplo, 123"
                    value={editForm.address}
                    onChange={handleEditField('address')}
                    maxLength={255}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ed-notes" className="font-medium text-slate-700">Observações</Label>
                  <Input
                    id="ed-notes"
                    placeholder="Informações adicionais"
                    value={editForm.notes}
                    onChange={handleEditField('notes')}
                    maxLength={500}
                    className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                  />
                </div>

                {updateError && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
                    <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <span className="text-sm text-red-600">{updateError}</span>
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isUpdating || !editForm.name.trim()}
                    className="bg-teal-600 font-semibold text-white hover:bg-teal-700"
                  >
                    {isUpdating ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button
            onClick={() =>
              navigate('/propostas/nova', {
                state: { backTo: `/clientes/${clientId}`, backLabel: client.name, preselectedClientId: client.id },
              })
            }
            className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Button>
        </div>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-slate-700">Informações</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {client.phone && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {client.phone}
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              {client.email}
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              {client.address}
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2.5 text-sm text-slate-600 sm:col-span-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span className="whitespace-pre-line">{client.notes}</span>
            </div>
          )}
          {!client.phone && !client.email && !client.address && !client.notes && (
            <p className="text-sm text-slate-400">Nenhuma informação adicional.</p>
          )}
        </div>
      </div>

      {/* Quotes */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-700">
          Propostas{' '}
          <span className="font-normal text-slate-400">({quotes.length})</span>
        </p>

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12">
            <p className="text-sm text-slate-400">Nenhuma proposta para este cliente.</p>
            <Button
              onClick={() =>
                navigate('/propostas/nova', {
                  state: { backTo: `/clientes/${clientId}`, backLabel: client.name, preselectedClientId: client.id },
                })
              }
              variant="outline"
              className="gap-1.5 border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {quotes.map((quote) => (
                <li key={quote.id}>
                  <button
                    onClick={() =>
                      navigate(`/propostas/${quote.id}`, {
                        state: { backTo: `/clientes/${clientId}`, backLabel: client.name },
                      })
                    }
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {quote.title}
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[quote.status]}`}>
                          {statusLabel[quote.status]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(quote.createdAt)}
                        {quote.validUntil && ` · válida até ${formatDate(quote.validUntil)}`}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatBRL(quote.total)}
                    </p>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
