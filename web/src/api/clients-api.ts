import api from './api'

export interface Client {
  id: string
  companyId: string
  name: string
  document: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateClientInput {
  name: string
  document?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export async function getClient(companyId: string, clientId: string): Promise<Client> {
  const res = await api.get<Client>(`/companies/${companyId}/clients/${clientId}`)
  return res.data
}

export async function listClients(companyId: string): Promise<Client[]> {
  const res = await api.get<Client[]>(`/companies/${companyId}/clients`)
  return res.data
}

export interface UpdateClientInput {
  name?: string
  document?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export async function updateClient(
  companyId: string,
  clientId: string,
  input: UpdateClientInput,
): Promise<Client> {
  const res = await api.patch<Client>(
    `/companies/${companyId}/clients/${clientId}`,
    input,
  )
  return res.data
}

export async function createClient(
  companyId: string,
  input: CreateClientInput,
): Promise<Client> {
  const payload: CreateClientInput = { name: input.name }
  if (input.document) payload.document = input.document
  if (input.phone) payload.phone = input.phone
  if (input.email) payload.email = input.email
  if (input.address) payload.address = input.address
  if (input.notes) payload.notes = input.notes

  const res = await api.post<Client>(`/companies/${companyId}/clients`, payload)
  return res.data
}
