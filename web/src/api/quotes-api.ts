import api from './api'
import type { CreateQuoteInput, Quote, UpdateQuoteInput } from '@/types/quotes'

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
