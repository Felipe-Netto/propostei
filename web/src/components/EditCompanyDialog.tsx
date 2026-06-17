import { useEffect, useState } from 'react'
import { maskPhone, maskDocument } from '@/lib/masks'
import { getCompany, updateCompany, type Company } from '@/api/companies-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { extractApiError } from '@/lib/utils'

interface Props {
  companyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (company: Company) => void
}

interface FormState {
  name: string
  document: string
  phone: string
  email: string
  address: string
  logoUrl: string
}

export function EditCompanyDialog({ companyId, open, onOpenChange, onUpdated }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '', document: '', phone: '', email: '', address: '', logoUrl: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setIsLoading(true)
    setSubmitError(null)

    getCompany(companyId)
      .then((company) => {
        setForm({
          name: company.name,
          document: company.document ?? '',
          phone: company.phone ?? '',
          email: company.email ?? '',
          address: company.address ?? '',
          logoUrl: company.logoUrl ?? '',
        })
      })
      .finally(() => setIsLoading(false))
  }, [open, companyId])

  function handleField(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleMasked(field: keyof FormState, maskFn: (v: string) => string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: maskFn(e.target.value) }))
  }

  function handleOpenChange(value: boolean) {
    onOpenChange(value)
    if (!value) setSubmitError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const updated = await updateCompany(companyId, {
        name: form.name.trim() || undefined,
        document: form.document.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        logoUrl: form.logoUrl.trim() || undefined,
      })
      handleOpenChange(false)
      onUpdated(updated)
    } catch (err) {
      setSubmitError(extractApiError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Atualize os dados da empresa.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-sm text-slate-400">
            Carregando...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-name" className="font-medium text-slate-700">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="e-name"
                value={form.name}
                onChange={handleField('name')}
                required
                maxLength={120}
                className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="e-doc" className="font-medium text-slate-700">
                  CNPJ / Documento
                </Label>
                <Input
                  id="e-doc"
                  placeholder="00.000.000/0001-00"
                  value={form.document}
                  onChange={handleMasked('document', maskDocument)}
                  inputMode="numeric"
                  maxLength={18}
                  className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="e-phone" className="font-medium text-slate-700">
                  Telefone
                </Label>
                <Input
                  id="e-phone"
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
              <Label htmlFor="e-email" className="font-medium text-slate-700">
                E-mail da empresa
              </Label>
              <Input
                id="e-email"
                type="email"
                placeholder="contato@empresa.com"
                value={form.email}
                onChange={handleField('email')}
                maxLength={120}
                className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-addr" className="font-medium text-slate-700">
                Endereço
              </Label>
              <Input
                id="e-addr"
                placeholder="Rua Exemplo, 123 - Cidade, UF"
                value={form.address}
                onChange={handleField('address')}
                maxLength={255}
                className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-logo" className="font-medium text-slate-700">
                URL do logo
              </Label>
              <Input
                id="e-logo"
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
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
