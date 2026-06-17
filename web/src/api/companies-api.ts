import api from './api'

export type CompanyRole = 'OWNER' | 'ADMIN' | 'MEMBER'
export type PlanType = 'FREE' | 'PRO' | 'TEAM'

export interface Company {
  id: string
  name: string
  document?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  logoUrl?: string | null
  members: { role: CompanyRole }[]
  subscription: { plan: PlanType; status: string }
}

export interface CreateCompanyInput {
  name: string
  document?: string
  phone?: string
  email?: string
  address?: string
  logoUrl?: string
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>

export async function listCompanies(): Promise<Company[]> {
  const res = await api.get<Company[]>('/companies')
  return res.data
}

export async function getCompany(id: string): Promise<Company> {
  const res = await api.get<Company>(`/companies/${id}`)
  return res.data
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const payload: CreateCompanyInput = { name: input.name }
  if (input.document) payload.document = input.document
  if (input.phone) payload.phone = input.phone
  if (input.email) payload.email = input.email
  if (input.address) payload.address = input.address
  if (input.logoUrl) payload.logoUrl = input.logoUrl

  const res = await api.post<Company>('/companies', payload)
  return res.data
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company> {
  const res = await api.patch<Company>(`/companies/${id}`, input)
  return res.data
}
