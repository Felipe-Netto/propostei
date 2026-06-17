import api from './api'
import type { QuoteStatus } from './quotes-api'

export interface DashboardRecentQuote {
  id: string
  title: string
  status: QuoteStatus
  total: string
  createdAt: string
  client: {
    id: string
    name: string
  }
}

export interface DashboardData {
  clientCount: number
  quoteCounts: Partial<Record<QuoteStatus, number>>
  approvedTotal: string
  recentQuotes: DashboardRecentQuote[]
}

export async function getDashboard(companyId: string): Promise<DashboardData> {
  const res = await api.get<DashboardData>(`/companies/${companyId}/dashboard`)
  return res.data
}
