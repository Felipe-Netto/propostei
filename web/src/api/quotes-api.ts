import api from './api'

export type QuoteStatus =
  | 'DRAFT'
  | 'SENT'
  | 'VIEWED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'EXPIRED'

export interface QuoteItem {
  id: string
  quoteId: string
  description: string
  quantity: string
  unitPrice: string
  total: string
  createdAt: string
  updatedAt: string
}

export interface QuoteClient {
  id: string
  name: string
  document: string | null
  phone?: string | null
  email?: string | null
}

export interface Quote {
  id: string
  companyId: string
  clientId: string
  title: string
  description: string | null
  status: QuoteStatus
  subtotal: string
  discount: string
  total: string
  validUntil: string | null
  approvedAt: string | null
  rejectedAt: string | null
  createdAt: string
  updatedAt: string
  client: QuoteClient
  items?: QuoteItem[]
}

export interface CreateQuoteItemInput {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateQuoteInput {
  clientId: string
  title: string
  description?: string
  discount?: number
  validUntil?: string
  items: CreateQuoteItemInput[]
}

export async function listQuotes(companyId: string): Promise<Quote[]> {
  const res = await api.get<Quote[]>(`/companies/${companyId}/quotes`)
  return res.data
}

export async function listClientQuotes(companyId: string, clientId: string): Promise<Quote[]> {
  const res = await api.get<Quote[]>(`/companies/${companyId}/clients/${clientId}/quotes`)
  return res.data
}

export async function createQuote(
  companyId: string,
  input: CreateQuoteInput,
): Promise<Quote> {
  const res = await api.post<Quote>(`/companies/${companyId}/quotes`, input)
  return res.data
}

export async function getQuote(companyId: string, quoteId: string): Promise<Quote> {
  const res = await api.get<Quote>(`/companies/${companyId}/quotes/${quoteId}`)
  return res.data
}

export interface UpdateQuoteInput {
  title?: string
  description?: string
  discount?: number
  validUntil?: string
  items?: CreateQuoteItemInput[]
}

export async function updateQuote(
  companyId: string,
  quoteId: string,
  input: UpdateQuoteInput,
): Promise<Quote> {
  const res = await api.patch<Quote>(`/companies/${companyId}/quotes/${quoteId}`, input)
  return res.data
}

async function patchStatus(companyId: string, quoteId: string, action: string): Promise<Quote> {
  const res = await api.patch<Quote>(`/companies/${companyId}/quotes/${quoteId}/${action}`)
  return res.data
}

export const sendQuote = (companyId: string, quoteId: string) =>
  patchStatus(companyId, quoteId, 'send')

export const approveQuote = (companyId: string, quoteId: string) =>
  patchStatus(companyId, quoteId, 'approve')

export const rejectQuote = (companyId: string, quoteId: string) =>
  patchStatus(companyId, quoteId, 'reject')

export const cancelQuote = (companyId: string, quoteId: string) =>
  patchStatus(companyId, quoteId, 'cancel')
