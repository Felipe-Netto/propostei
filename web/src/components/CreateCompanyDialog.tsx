import { useState } from 'react'
import { maskPhone, maskDocument } from '@/lib/masks'
import { createCompany, type Company, type CreateCompanyInput } from '@/api/companies-api'
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (company: Company) => void
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

export function CreateCompanyDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
    if (!value) {
      setForm(emptyForm)
      setSubmitError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const company = await createCompany(input)
      handleOpenChange(false)
      onCreated(company)
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
          <DialogTitle>Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados da empresa. Apenas o nome é obrigatório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
  )
}
