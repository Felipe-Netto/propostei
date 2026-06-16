import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

const navItems = [
  { to: '/home', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/empresas', label: 'Empresas', icon: Building2, end: false },
  { to: '/configuracoes', label: 'Configurações', icon: Settings, end: false },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/90">

      {/* Logo */}
      <div className="flex items-center px-5 py-4">
        <Logo white />
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-white/[0.08]" />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-500/20 text-teal-300 shadow-sm ring-1 ring-teal-500/20'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mx-4 mt-3 h-px bg-white/[0.08]" />
      <div className="px-5 py-5">
        <p className="text-xs font-semibold text-slate-400">Propostei</p>
        <p className="mt-0.5 text-[0.7rem] text-slate-600">Gestão de propostas</p>
      </div>
    </div>
  )
}
