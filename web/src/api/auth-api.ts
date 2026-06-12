import api from './api'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterResponse {
  user: {
    id: string
    name: string
    email: string
  }
}

export function extractToken(data: unknown): string | null {
  if (data === null || typeof data !== 'object') return null

  const obj = data as Record<string, unknown>

  if (typeof obj['token'] === 'string') return obj['token']
  if (typeof obj['access_token'] === 'string') return obj['access_token']
  if (typeof obj['accessToken'] === 'string') return obj['accessToken']

  if (obj['data'] !== null && typeof obj['data'] === 'object') {
    const nested = obj['data'] as Record<string, unknown>
    if (typeof nested['token'] === 'string') return nested['token']
    if (typeof nested['access_token'] === 'string') return nested['access_token']
    if (typeof nested['accessToken'] === 'string') return nested['accessToken']
  }

  return null
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', input)
  return res.data
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>('/auth/signup', input)
  return res.data
}
