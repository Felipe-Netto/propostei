import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'

interface AuthMarketingPanelProps {
  children: ReactNode
}

export function AuthMarketingPanel({ children }: AuthMarketingPanelProps) {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-14">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-teal-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/3 h-40 w-40 rounded-full bg-teal-400/5" />

      {/* Brand */}
      <div className="relative z-10">
        <Logo white size="lg" />
      </div>

      {/* Page-specific content */}
      <div className="relative z-10">{children}</div>

      {/* Footer */}
      <span className="relative z-10 text-xs text-slate-500/70">
        © {new Date().getFullYear()} Propostei
      </span>
    </div>
  )
}
