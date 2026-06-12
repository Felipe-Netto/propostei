import { Building2, Users, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const sections = [
  {
    title: 'Empresas',
    description: 'Gerencie suas empresas e dados cadastrais.',
    icon: Building2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    accent: 'group-hover:border-blue-200',
  },
  {
    title: 'Clientes',
    description: 'Cadastre e acompanhe seus clientes.',
    icon: Users,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    accent: 'group-hover:border-teal-200',
  },
  {
    title: 'Propostas',
    description: 'Crie e gerencie orçamentos e propostas.',
    icon: FileText,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    accent: 'group-hover:border-emerald-200',
  },
]

export function HomePage() {
  return (
    <div className="flex flex-col gap-7">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Bem-vindo ao Propostei</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gerencie empresas, clientes e propostas em um só lugar.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ title, description, icon: Icon, iconBg, iconColor, accent }) => (
          <Card
            key={title}
            className={`group cursor-default transition-colors ${accent}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <CardTitle className="text-slate-900">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{description}</CardDescription>
              <p className="mt-4 text-xs font-medium text-slate-400">Em breve</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
