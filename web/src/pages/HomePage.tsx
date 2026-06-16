import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Building2, Users, FileText, CheckCircle, DollarSign, ChevronDown, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { listCompanies, type Company } from '@/api/companies-api'
import { listClients } from '@/api/clients-api'
import { listQuotes, type Quote, type QuoteStatus } from '@/api/quotes-api'
import { extractApiError } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string }> = {
  DRAFT:    { label: 'Rascunho',    color: '#94a3b8' },
  SENT:     { label: 'Enviada',     color: '#3b82f6' },
  VIEWED:   { label: 'Visualizada', color: '#8b5cf6' },
  APPROVED: { label: 'Aprovada',    color: '#14b8a6' },
  REJECTED: { label: 'Rejeitada',   color: '#ef4444' },
  CANCELED: { label: 'Cancelada',   color: '#f97316' },
  EXPIRED:  { label: 'Expirada',    color: '#64748b' },
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartEntry {
  label: string
  count: number
  color: string
}

interface Stats {
  clients: number
  quotes: number
  approved: number
  approvedTotal: number
  pending: number
  donutData: ChartEntry[]
  barData: ChartEntry[]
  recentQuotes: Quote[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function buildStats(clients: { length: number }, quotes: Quote[]): Stats {
  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map((s) => [s, 0]),
  ) as Record<QuoteStatus, number>

  for (const q of quotes) {
    statusCounts[q.status]++
  }

  const approved = quotes.filter((q) => q.status === 'APPROVED')

  const donutData = (Object.keys(STATUS_CONFIG) as QuoteStatus[])
    .map((s) => ({ label: STATUS_CONFIG[s].label, count: statusCounts[s], color: STATUS_CONFIG[s].color }))
    .filter((d) => d.count > 0)

  const barData: ChartEntry[] = [
    { label: 'Clientes',    count: clients.length,               color: '#3b82f6' },
    ...(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map((s) => ({
      label: STATUS_CONFIG[s].label,
      count: statusCounts[s],
      color: STATUS_CONFIG[s].color,
    })),
  ]

  const recentQuotes = [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return {
    clients:       clients.length,
    quotes:        quotes.length,
    approved:      approved.length,
    approvedTotal: approved.reduce((sum, q) => sum + parseFloat(q.total), 0),
    pending:       statusCounts.DRAFT + statusCounts.SENT + statusCounts.VIEWED,
    donutData,
    barData,
    recentQuotes,
  }
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: ChartEntry }[]
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-slate-500">{entry.payload.label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-900">{entry.value}</p>
    </div>
  )
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function DonutLegend({ data }: { data: ChartEntry[] }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {data.map((entry) => (
        <div key={entry.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-500">{entry.label}</span>
          <span className="text-xs font-semibold text-slate-700">{entry.count}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingStats, setLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await listCompanies()
        if (!cancelled) {
          setCompanies(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
      } catch (err) {
        if (!cancelled) setError(extractApiError(err))
      } finally {
        if (!cancelled) setLoadingCompanies(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!selectedId) return

    let cancelled = false
    setLoadingStats(true)
    setStats(null)

    async function load() {
      try {
        const [clients, quotes] = await Promise.all([
          listClients(selectedId),
          listQuotes(selectedId),
        ])
        if (!cancelled) setStats(buildStats(clients, quotes))
      } catch (err) {
        if (!cancelled) setError(extractApiError(err))
      } finally {
        if (!cancelled) setLoadingStats(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [selectedId])

  const navigate = useNavigate()
  const selectedCompany = companies.find((c) => c.id === selectedId)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header + company select ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Visão geral</h1>
          <p className="mt-1 text-sm text-slate-500">
            Selecione uma empresa para ver as informações.
          </p>
        </div>

        {!loadingCompanies && companies.length > 0 && (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Building2 className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Loading companies ── */}
      {loadingCompanies && (
        <div className="flex items-center justify-center py-20 text-sm text-slate-400">
          Carregando empresas...
        </div>
      )}

      {/* ── No companies ── */}
      {!loadingCompanies && companies.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Building2 className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Nenhuma empresa encontrada</p>
          <p className="text-sm text-slate-400">
            Crie uma empresa para começar a usar o Propostei.
          </p>
        </div>
      )}

      {/* ── Dashboard ── */}
      {selectedCompany && (
        <>
          {/* Company label */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
              <Building2 className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700">{selectedCompany.name}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={Users}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              label="Clientes"
              value={loadingStats ? '—' : String(stats?.clients ?? 0)}
              loading={loadingStats}
            />
            <StatCard
              icon={FileText}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              label="Propostas"
              value={loadingStats ? '—' : String(stats?.quotes ?? 0)}
              loading={loadingStats}
              sub={stats ? `${stats.pending} em aberto` : undefined}
            />
            <StatCard
              icon={CheckCircle}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              label="Aprovadas"
              value={loadingStats ? '—' : String(stats?.approved ?? 0)}
              loading={loadingStats}
            />
            <StatCard
              icon={DollarSign}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              label="Total aprovado"
              value={loadingStats ? '—' : formatCurrency(stats?.approvedTotal ?? 0)}
              loading={loadingStats}
            />
          </div>

          {/* Charts + recent quotes */}
          {loadingStats ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-400">
              Carregando dados...
            </div>
          ) : stats && (
            <>
              {/* ── Charts row ── */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Donut: status das propostas */}
                <Card className="col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Status das Propostas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.donutData.length === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                        Nenhuma proposta ainda
                      </div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={stats.donutData}
                              dataKey="count"
                              nameKey="label"
                              cx="50%"
                              cy="50%"
                              innerRadius={56}
                              outerRadius={88}
                              paddingAngle={2}
                              strokeWidth={0}
                            >
                              {stats.donutData.map((entry) => (
                                <Cell key={entry.label} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <DonutLegend data={stats.donutData} />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Bar: comparação geral */}
                <Card className="col-span-1 lg:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Comparação Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.quotes === 0 && stats.clients === 0 ? (
                      <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                        Nenhum dado ainda
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={stats.barData}
                          layout="vertical"
                          margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                          barCategoryGap="30%"
                        >
                          <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                          />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={80}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            content={<ChartTooltip />}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                            {stats.barData.map((entry) => (
                              <Cell key={entry.label} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* ── Recent quotes ── */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      Últimas Propostas
                    </CardTitle>
                    <button
                      onClick={() => navigate(`/empresas/${selectedId}/propostas`)}
                      className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Ver todas
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {stats.recentQuotes.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-sm text-slate-400">
                      Nenhuma proposta ainda
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {stats.recentQuotes.map((quote) => (
                        <button
                          key={quote.id}
                          onClick={() =>
                            navigate(`/empresas/${selectedId}/propostas/${quote.id}`)
                          }
                          className="group flex w-full items-center gap-4 px-6 py-3.5 text-left transition-colors hover:bg-slate-50"
                        >
                          {/* Title + client */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-teal-700">
                              {quote.title}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              {quote.client.name}
                            </p>
                          </div>

                          {/* Status badge */}
                          <span
                            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: STATUS_CONFIG[quote.status].color + '18',
                              color: STATUS_CONFIG[quote.status].color,
                            }}
                          >
                            {STATUS_CONFIG[quote.status].label}
                          </span>

                          {/* Total + date */}
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold tabular-nums text-slate-800">
                              {formatCurrency(parseFloat(quote.total))}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-teal-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string
  loading: boolean
  sub?: string
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, loading, sub }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardTitle
          className={`text-2xl font-bold tabular-nums transition-opacity ${
            loading ? 'opacity-40' : 'text-slate-900'
          }`}
        >
          {value}
        </CardTitle>
        {sub && !loading && (
          <p className="mt-1 text-xs text-slate-400">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}
