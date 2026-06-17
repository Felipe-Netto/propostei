import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, ChevronRight, Building2 } from 'lucide-react'
import { useCompany } from '@/context/CompanyContext'
import { listQuotes, type Quote, type QuoteStatus } from '@/api/quotes-api'
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

export function QuotesPage() {
  const navigate = useNavigate()
  const { selectedId, selectedCompany, loading: loadingCompany } = useCompany()

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    setIsLoading(true)
    setFetchError(null)

    async function load() {
      try {
        const data = await listQuotes(selectedId)
        if (!cancelled) setQuotes(data)
      } catch (err) {
        if (!cancelled) setFetchError(extractApiError(err))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [selectedId])

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
          <h1 className="text-xl font-bold text-slate-900">Propostas</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? '...' : `${quotes.length} proposta${quotes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          onClick={() => navigate('/propostas/nova')}
          className="h-9 gap-1.5 bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Nova Proposta
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">
          Carregando propostas...
        </div>
      ) : fetchError ? (
        <div className="flex items-center justify-center py-20 text-sm text-red-500">
          {fetchError}
        </div>
      ) : quotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Nenhuma proposta ainda</p>
            <p className="mt-1 text-sm text-slate-400">
              Crie a primeira proposta para este cliente.
            </p>
          </div>
          <Button
            onClick={() => navigate('/propostas/nova')}
            className="mt-1 gap-1.5 bg-teal-600 font-semibold text-white hover:bg-teal-700"
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
                  onClick={() => navigate(`/propostas/${quote.id}`)}
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
                      {quote.client.name} · {formatDate(quote.createdAt)}
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
  )
}
