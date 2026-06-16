import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, FileText, Plus } from 'lucide-react'
import { getClient, type Client } from '@/api/clients-api'
import { listClientQuotes, type Quote, type QuoteStatus } from '@/api/quotes-api'
import { Button } from '@/components/ui/button'
import { extractApiError, formatBRL, formatDate } from '@/lib/utils'

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
  const { companyId, clientId } = useParams<{ companyId: string; clientId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const companyName = (location.state as { companyName?: string } | null)?.companyName

  const [client, setClient] = useState<Client | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId || !clientId) return
    let cancelled = false

    async function load() {
      try {
        const [clientData, clientQuotes] = await Promise.all([
          getClient(companyId!, clientId!),
          listClientQuotes(companyId!, clientId!),
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

  const backState = { companyName }

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
      <div className="flex flex-col gap-2">
        <button
          onClick={() =>
            navigate(`/empresas/${companyId!}/clientes`, { state: backState })
          }
          className="flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Clientes
        </button>
        {companyName && (
          <p className="text-xs text-slate-400">{companyName}</p>
        )}
      </div>

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
        <Button
          onClick={() =>
            navigate(`/empresas/${companyId!}/propostas/nova`, {
              state: {
                companyName,
                backTo: `/empresas/${companyId!}/clientes/${client.id}`,
                backLabel: client.name,
              },
            })
          }
          className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Nova Proposta
        </Button>
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
                navigate(`/empresas/${companyId!}/propostas/nova`, {
                  state: { companyName, preselectedClientId: client.id },
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
                <li key={quote.id} className="flex items-center gap-4 px-5 py-4">
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
