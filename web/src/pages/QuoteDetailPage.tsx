import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Pencil, User, Calendar, AlignLeft } from 'lucide-react'
import { useCompany } from '@/context/CompanyContext'
import {
  getQuote,
  sendQuote,
  approveQuote,
  rejectQuote,
  cancelQuote,
  type Quote,
  type QuoteStatus,
} from '@/api/quotes-api'
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

const editableStatuses: QuoteStatus[] = ['DRAFT', 'SENT', 'VIEWED']

export function QuoteDetailPage() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedId: companyId } = useCompany()
  const state = location.state as { backTo?: string; backLabel?: string } | null
  const backTo = state?.backTo ?? '/propostas'
  const backLabel = state?.backLabel ?? 'Propostas'

  const [quote, setQuote] = useState<Quote | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId || !quoteId) return
    let cancelled = false

    getQuote(companyId, quoteId)
      .then((data) => { if (!cancelled) setQuote(data) })
      .catch((err) => { if (!cancelled) setError(extractApiError(err)) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [companyId, quoteId])

  async function handleAction(
    action: (c: string, q: string) => Promise<Quote>,
    label: string,
  ) {
    if (!companyId || !quoteId) return
    setActionError(null)
    setLoadingAction(label)
    try {
      const updated = await action(companyId, quoteId)
      setQuote(updated)
    } catch (err) {
      setActionError(extractApiError(err))
    } finally {
      setLoadingAction(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Carregando...
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        {error ?? 'Proposta não encontrada.'}
      </div>
    )
  }

  const canEdit = editableStatuses.includes(quote.status)
  const items = quote.items ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <button
        onClick={() => navigate(backTo)}
        className="flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </button>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900">{quote.title}</h1>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[quote.status]}`}>
              {statusLabel[quote.status]}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {quote.client.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(quote.createdAt)}
            </span>
            {quote.validUntil && (
              <span className="text-slate-400">
                válida até {formatDate(quote.validUntil)}
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <Button
            onClick={() => navigate(`/propostas/${quoteId}/editar`, { state: { backTo, backLabel } })}
            variant="outline"
            className="h-9 gap-1.5 border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </div>

      {/* Status actions */}
      {quote.status === 'DRAFT' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="flex-1 text-sm text-blue-700">Proposta em rascunho. Envie para o cliente quando estiver pronta.</p>
          <Button
            onClick={() => handleAction(sendQuote, 'send')}
            disabled={loadingAction !== null}
            className="h-8 bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {loadingAction === 'send' ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      )}

      {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="flex-1 text-sm text-slate-600">Aguardando resposta do cliente.</p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleAction(approveQuote, 'approve')}
              disabled={loadingAction !== null}
              className="h-8 bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700"
            >
              {loadingAction === 'approve' ? 'Aprovando...' : 'Aprovar'}
            </Button>
            <Button
              onClick={() => handleAction(rejectQuote, 'reject')}
              disabled={loadingAction !== null}
              variant="outline"
              className="h-8 border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              {loadingAction === 'reject' ? 'Rejeitando...' : 'Rejeitar'}
            </Button>
            <Button
              onClick={() => handleAction(cancelQuote, 'cancel')}
              disabled={loadingAction !== null}
              variant="outline"
              className="h-8 border-slate-200 px-4 text-sm text-slate-500 hover:bg-slate-100"
            >
              {loadingAction === 'cancel' ? 'Cancelando...' : 'Cancelar'}
            </Button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600">
          {actionError}
        </div>
      )}

      {/* Description */}
      {quote.description && (
        <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <AlignLeft className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm text-slate-600">{quote.description}</p>
        </div>
      )}

      {/* Items */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-semibold text-slate-700">Itens</p>
        </div>

        <div className="hidden grid-cols-[1fr_80px_110px_110px] gap-4 border-b border-slate-100 px-5 py-2.5 text-xs font-medium text-slate-400 sm:grid">
          <span>Descrição</span>
          <span className="text-right">Qtd.</span>
          <span className="text-right">Preço unit.</span>
          <span className="text-right">Total</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[1fr_80px_110px_110px] sm:gap-4 sm:items-center">
              <span className="text-sm text-slate-800">{item.description}</span>
              <span className="text-right text-sm text-slate-500">{parseFloat(item.quantity).toLocaleString('pt-BR')}</span>
              <span className="text-right text-sm text-slate-500">{formatBRL(item.unitPrice)}</span>
              <span className="text-right text-sm font-medium text-slate-800">{formatBRL(item.total)}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-end gap-2 border-t border-slate-100 px-5 py-4">
          <div className="flex w-56 items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-800">{formatBRL(quote.subtotal)}</span>
          </div>
          {parseFloat(quote.discount) > 0 && (
            <div className="flex w-56 items-center justify-between text-sm">
              <span className="text-slate-500">Desconto</span>
              <span className="text-slate-800">− {formatBRL(quote.discount)}</span>
            </div>
          )}
          <div className="flex w-56 items-center justify-between border-t border-slate-100 pt-2 text-sm">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="text-base font-bold text-teal-700">{formatBRL(quote.total)}</span>
          </div>
        </div>
      </div>

    </div>
  )
}
