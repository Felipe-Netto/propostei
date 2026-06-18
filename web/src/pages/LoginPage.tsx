import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthMarketingPanel } from '@/components/AuthMarketingPanel'
import { Logo } from '@/components/Logo'
import { extractApiError } from '@/lib/utils'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/home')
    } catch (err: unknown) {
      const message = extractApiError(err)

      setError(message ?? 'Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left marketing panel (lg+) ───────────────────────────────────── */}
      <AuthMarketingPanel>
        <div className="flex flex-col gap-9">
          <div>
            <h2 className="text-[2.5rem] font-bold leading-[1.2] text-white">
              Transforme orçamentos<br />
              em{' '}
              <span className="text-teal-400">oportunidades.</span>
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-slate-300/90">
              Gerencie clientes, empresas e propostas<br />
              de forma simples e eficiente.
            </p>
          </div>

          {/* Decorative proposal card */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.07] shadow-2xl backdrop-blur-md">
            <div className="h-0.5 bg-gradient-to-r from-teal-400/60 via-teal-300/40 to-transparent" />
            <div className="p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-teal-400/80">
                    Orçamento
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white/50">#ORC-2024-001</p>
                </div>
                <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/20">
                  Aprovado
                </span>
              </div>
              <div className="mb-5 divide-y divide-white/[0.07]">
                {[
                  { label: 'Serviço de instalação', value: 'R$ 1.250,00' },
                  { label: 'Mão de obra especializada', value: 'R$ 980,00' },
                  { label: 'Materiais e insumos', value: 'R$ 2.350,00' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 text-[0.8125rem]">
                    <span className="text-slate-300/80">{label}</span>
                    <span className="font-semibold tabular-nums text-white/90">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-teal-500/[0.12] px-4 py-3 ring-1 ring-teal-400/20">
                <span className="text-sm font-semibold text-white/80">Total</span>
                <span className="text-xl font-bold tabular-nums text-teal-300">R$ 4.580,00</span>
              </div>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/15 text-xs font-bold text-teal-300 ring-1 ring-teal-400/20">
                R$
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Receita</p>
                <p className="text-[0.7rem] text-teal-300/80">+12% este mês</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-400/15 ring-1 ring-blue-400/20">
                <svg className="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Propostas</p>
                <p className="text-[0.7rem] text-blue-300/80">23 este mês</p>
              </div>
            </div>
          </div>
        </div>
      </AuthMarketingPanel>

      {/* ── Right login panel ────────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/60 px-5 py-10 sm:px-10 sm:py-16 lg:w-1/2">
        <div className="w-full max-w-[440px]">

          {/* Mobile brand */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white px-8 py-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)]">

            <div className="mb-8">
              <h1 className="text-[1.625rem] font-bold leading-tight text-slate-900">
                Entrar no{' '}
                <span className="text-teal-600">Propostei</span>
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Acesse sua conta para gerenciar suas propostas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="font-medium text-slate-700">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="font-medium text-slate-700">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
                  <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-11 w-full bg-teal-600 text-[0.9375rem] font-semibold text-white shadow-sm hover:bg-teal-700 active:bg-teal-800"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Não tem conta?{' '}
              <Link
                to="/register"
                className="font-semibold text-teal-600 underline underline-offset-4 hover:text-teal-700"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
