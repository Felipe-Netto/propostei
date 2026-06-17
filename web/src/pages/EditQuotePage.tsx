import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useCompany } from '@/context/CompanyContext'
import { getQuote, updateQuote, type CreateQuoteItemInput } from '@/api/quotes-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { extractApiError, formatBRL } from '@/lib/utils'

function newId(): string {
  return Math.random().toString(36).slice(2)
}

interface ItemRow {
  id: string
  description: string
  quantity: string
  unitPrice: string
}

const inputCls =
  'h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500'

export function EditQuotePage() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedId: companyId } = useCompany()
  const state = location.state as { backTo?: string; backLabel?: string } | null

  const [isLoadingQuote, setIsLoadingQuote] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [discount, setDiscount] = useState('')
  const [items, setItems] = useState<ItemRow[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyId || !quoteId) return

    getQuote(companyId, quoteId)
      .then((quote) => {
        setClientName(quote.client.name)
        setTitle(quote.title)
        setDescription(quote.description ?? '')
        setValidUntil(
          quote.validUntil ? quote.validUntil.slice(0, 10) : '',
        )
        setDiscount(
          parseFloat(quote.discount) > 0 ? String(parseFloat(quote.discount)) : '',
        )
        setItems(
          (quote.items ?? []).map((item) => ({
            id: newId(),
            description: item.description,
            quantity: String(parseFloat(item.quantity)),
            unitPrice: String(parseFloat(item.unitPrice)),
          })),
        )
      })
      .catch((err) => setLoadError(extractApiError(err)))
      .finally(() => setIsLoadingQuote(false))
  }, [companyId, quoteId])

  function updateItem(id: string, field: keyof Omit<ItemRow, 'id'>, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    )
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: newId(), description: '', quantity: '', unitPrice: '' },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const itemTotals = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0
    const price = parseFloat(item.unitPrice) || 0
    return qty * price
  })

  const subtotal = itemTotals.reduce((acc, t) => acc + t, 0)
  const discountNum = parseFloat(discount) || 0
  const total = Math.max(0, subtotal - discountNum)

  const canSubmit =
    title.trim() &&
    items.length > 0 &&
    items.every(
      (i) => i.description.trim() && parseFloat(i.quantity) > 0 && parseFloat(i.unitPrice) >= 0,
    )

  const backPath = `/propostas/${quoteId}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !quoteId || !canSubmit) return

    setSubmitError(null)
    setIsSubmitting(true)

    const quoteItems: CreateQuoteItemInput[] = items.map((item) => ({
      description: item.description.trim(),
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
    }))

    try {
      await updateQuote(companyId, quoteId, {
        title: title.trim(),
        description: description.trim() || undefined,
        discount: discountNum > 0 ? discountNum : undefined,
        validUntil: validUntil || undefined,
        items: quoteItems,
      })
      navigate(backPath, { state })
    } catch (err) {
      setSubmitError(extractApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingQuote) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-400">
        Carregando...
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-500">
        {loadError}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Back */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => navigate(backPath)}
          className="flex w-fit items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-600 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Proposta
        </button>
        <h1 className="text-xl font-bold text-slate-900">Editar Proposta</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Section: Dados */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-slate-700">Dados da proposta</p>
          <div className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <Label className="font-medium text-slate-700">Cliente</Label>
              <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                {clientName}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-title" className="font-medium text-slate-700">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="e-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={120}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-desc" className="font-medium text-slate-700">
                Descrição
              </Label>
              <textarea
                id="e-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-valid" className="font-medium text-slate-700">
                Válida até
              </Label>
              <Input
                id="e-valid"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={inputCls}
              />
            </div>

          </div>
        </div>

        {/* Section: Itens */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Itens</p>
            <Button
              type="button"
              onClick={addItem}
              variant="outline"
              className="h-8 gap-1.5 border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar item
            </Button>
          </div>

          <div className="mb-2 hidden grid-cols-[1fr_80px_100px_80px_36px] gap-2 text-xs font-medium text-slate-400 sm:grid">
            <span>Descrição</span>
            <span>Qtd.</span>
            <span>Preço unit.</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_100px_80px_36px]">
                <Input
                  placeholder="Descrição do item"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  required
                  maxLength={255}
                  className={inputCls}
                />
                <Input
                  type="number"
                  placeholder="Qtd."
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  min="0.01"
                  step="0.01"
                  required
                  className={inputCls}
                />
                <Input
                  type="number"
                  placeholder="0,00"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className={inputCls}
                />
                <div className="flex h-10 items-center justify-end text-sm font-medium text-slate-700">
                  {formatBRL(itemTotals[idx] ?? 0)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="flex h-10 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Totais */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-slate-700">Totais</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium text-slate-900">{formatBRL(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="shrink-0 text-sm text-slate-500">Desconto</span>
              <div className="w-36">
                <Input
                  type="number"
                  placeholder="0,00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  step="0.01"
                  className={`${inputCls} text-right`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <span className="font-semibold text-slate-700">Total</span>
              <span className="text-base font-bold text-teal-700">{formatBRL(total)}</span>
            </div>
          </div>
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

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(backPath)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="bg-teal-600 font-semibold text-white hover:bg-teal-700"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
