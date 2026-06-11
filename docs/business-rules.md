# Propostei — Regras de Negócio

## Visão geral

O Propostei é um aplicativo para prestadores de serviço criarem, enviarem e acompanharem propostas/orçamentos profissionais.

A estrutura principal do sistema é baseada em:

- User
- Company
- CompanyMember
- Subscription
- Client
- Quote
- QuoteItem

## Conceitos principais

### User

Representa a pessoa que faz login no sistema.

Exemplo:

- João
- Maria
- Felipe

Um usuário pode participar de uma ou mais empresas através de vínculos em `CompanyMember`.

### Company

Representa a empresa, negócio, workspace ou perfil profissional onde ficam os dados do sistema.

Exemplo:

- João Instalações Elétricas
- Maria Pinturas
- Agência Netto

Clientes, propostas, itens e assinatura pertencem à empresa.

### CompanyMember

Representa o vínculo entre um usuário e uma empresa.

Esse vínculo define qual papel o usuário possui dentro da empresa.

Papéis iniciais:

- OWNER
- ADMIN
- MEMBER

No MVP, quando um usuário cria uma empresa, ele automaticamente vira `OWNER`.

### Subscription

Representa o plano da empresa.

A assinatura pertence à `Company`, não ao `User`.

Isso permite que uma empresa tenha seu próprio plano, independentemente dos usuários vinculados a ela.

Planos iniciais:

- FREE
- PRO
- TEAM

Status iniciais:

- ACTIVE
- CANCELED

No MVP, toda empresa criada começa com plano `FREE` e status `ACTIVE`.

## Regras do MVP

### Criação de empresa

No MVP, um usuário pode criar apenas uma empresa gratuita.

Mesmo que o banco suporte múltiplas empresas por usuário, a interface e a regra de negócio inicial bloqueiam a criação de múltiplas empresas no plano grátis.

Regra:

- Se o usuário ainda não é `OWNER` de nenhuma empresa, pode criar uma empresa.
- Ao criar a empresa, o sistema cria automaticamente:
  - Company
  - CompanyMember com role `OWNER`
  - Subscription com plan `FREE` e status `ACTIVE`
- Se o usuário já for `OWNER` de uma empresa, a criação de nova empresa deve ser bloqueada no MVP.

Mensagem sugerida:

> Usuários do plano grátis podem criar apenas uma empresa.

### Acesso a empresas

Um usuário só pode acessar empresas onde possui vínculo em `CompanyMember`.

Regra:

- Para listar empresas, buscar apenas empresas onde o usuário logado é membro.
- Para acessar uma empresa específica, validar se existe `CompanyMember` para o usuário e a empresa.

### Edição de empresa

Apenas usuários com role `OWNER` ou `ADMIN` podem editar dados da empresa.

No MVP, como só existe `OWNER`, apenas o dono edita.

### Assinatura por empresa

A cobrança será feita por empresa, não por usuário.

Exemplo:

- Empresa A pode estar no plano FREE.
- Empresa B pode estar no plano PRO.
- O mesmo usuário pode participar das duas empresas no futuro.

### Plano FREE

Regras iniciais sugeridas:

- 1 empresa por usuário
- limite de propostas por mês
- PDF com marca d'água
- 1 usuário/membro no MVP

### Plano PRO

Regras futuras sugeridas:

- propostas ilimitadas
- PDF sem marca d'água
- logo da empresa
- link público da proposta
- envio facilitado pelo WhatsApp

### Plano TEAM

Regras futuras sugeridas:

- múltiplos membros
- permissões por usuário
- histórico de alterações
- recursos colaborativos

## Decisões de modelagem

### Por que User não tem companies direto?

A relação entre `User` e `Company` passa por `CompanyMember`.

Isso acontece porque o vínculo possui informações próprias, como:

- role
- data de criação
- permissões futuras

Portanto, o relacionamento correto é:

User → CompanyMember → Company

### Por que Subscription pertence à Company?

A assinatura pertence à empresa porque os dados e recursos principais do sistema pertencem à empresa:

- clientes
- propostas
- itens
- membros
- logo
- configurações

Isso permite cobrar por workspace/empresa, e não diretamente por usuário.

### Por que não permitir várias empresas grátis?

Se múltiplas empresas grátis fossem liberadas, um usuário poderia criar várias empresas para burlar limites do plano FREE.

Por isso, no MVP, o usuário grátis só pode criar uma empresa.

## Status de assinatura

### ACTIVE

A assinatura está ativa.

No plano FREE, significa que a empresa pode usar os recursos gratuitos.

No plano PRO ou TEAM, significa que a assinatura paga está válida.

### CANCELED

A assinatura foi cancelada.

No MVP, esse status será usado apenas de forma simples.

Status como `PAST_DUE`, `TRIALING` e `EXPIRED` podem ser adicionados futuramente quando houver integração real com meio de pagamento.

## Próximas entidades

### Client

Representa o cliente da empresa.

Todo cliente pertence a uma empresa.

### Quote

Representa uma proposta/orçamento.

Toda proposta pertence a uma empresa e pode estar vinculada a um cliente.

### QuoteItem

Representa os itens da proposta.

Exemplo:

- Instalação de tomada
- Pintura de parede
- Mão de obra
- Material