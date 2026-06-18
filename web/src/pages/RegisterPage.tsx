import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthMarketingPanel } from '@/components/AuthMarketingPanel'
import { Logo } from '@/components/Logo'

export function RegisterPage() {
  usePageTitle('Criar conta')
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const hasToken = await register(name, email, password)
      if (hasToken) {
        navigate('/home')
      } else {
        navigate('/login')
      }
    } catch {
      setError('Não foi possível criar sua conta. Tente novamente.')
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
              Comece a criar propostas{' '}
              <span className="text-teal-400">profissionais.</span>
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-slate-300/90">
              Cadastre-se para organizar clientes,<br />
              empresas e orçamentos em poucos minutos.
            </p>
          </div>

          {/* Decorative proposal card */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.07] shadow-2xl backdrop-blur-md">
            <div className="h-0.5 bg-gradient-to-r from-teal-400/60 via-teal-300/40 to-transparent" />
            <div className="p-6">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-teal-400/80">
                    Proposta
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-white/50">#PROP-2024-012</p>
                </div>
                <span className="rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/20">
                  Em análise
                </span>
              </div>
              <div className="mb-5 divide-y divide-white/[0.07]">
                {[
                  { label: 'Instalação elétrica', value: 'R$ 750,00' },
                  { label: 'Materiais', value: 'R$ 1.200,00' },
                  { label: 'Mão de obra', value: 'R$ 980,00' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 text-[0.8125rem]">
                    <span className="text-slate-300/80">{label}</span>
                    <span className="font-semibold tabular-nums text-white/90">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-teal-500/[0.12] px-4 py-3 ring-1 ring-teal-400/20">
                <span className="text-sm font-semibold text-white/80">Total</span>
                <span className="text-xl font-bold tabular-nums text-teal-300">R$ 2.930,00</span>
              </div>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.07] px-4 py-2.5 backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/15 ring-1 ring-teal-400/20">
                <svg className="h-4 w-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Clientes</p>
                <p className="text-[0.7rem] text-teal-300/80">+18 este mês</p>
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

      {/* ── Right register panel ─────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100/60 px-5 py-10 sm:px-10 sm:py-16 lg:w-1/2">
        <div className="w-full max-w-[440px]">

          {/* Mobile brand */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo height={120} />
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white px-8 py-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)]">

            <div className="mb-8">
              <h1 className="text-[1.625rem] font-bold leading-tight text-slate-900">
                Criar conta
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Comece a organizar seus clientes e propostas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="font-medium text-slate-700">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-teal-500"
                />
              </div>

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
                  autoComplete="new-password"
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
                {isSubmitting ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Já tem conta?{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-600 underline underline-offset-4 hover:text-teal-700"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
