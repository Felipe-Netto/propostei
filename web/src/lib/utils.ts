import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function extractApiError(err: unknown): string {
  if (err !== null && typeof err === 'object' && 'response' in err) {
    const res = (err as { response: unknown }).response
    if (res !== null && typeof res === 'object' && 'data' in res) {
      const data = (res as { data: unknown }).data
      if (data !== null && typeof data === 'object' && 'message' in data) {
        const msg = (data as { message: unknown }).message
        if (typeof msg === 'string') return msg
      }
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.'
}
