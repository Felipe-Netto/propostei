import { NavLink, useLocation } from 'react-router-dom'
import { Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  companyId: string
}

export function CompanyTabs({ companyId }: Props) {
  const location = useLocation()
  const state = location.state as Record<string, unknown> | null

  const tabs = [
    { to: `/empresas/${companyId}/clientes`, label: 'Clientes', icon: Users },
    { to: `/empresas/${companyId}/propostas`, label: 'Propostas', icon: FileText },
  ]

  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          state={state}
          className={({ isActive }) =>
            cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </div>
  )
}
