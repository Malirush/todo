# Pomodoro Tasks - Advanced To-Do List

Sistema avançado de gerenciamento de tarefas com Pomodoro tracking, chatbot AI e integração WhatsApp.

## Tecnologias

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: n8n Webhook ou Vercel AI Gateway
- **WhatsApp**: Evolution API

## Instalação Local (VSCode)

### 1. Clone e instale dependências

```bash
git clone <seu-repositorio>
cd pomodoro-tasks
npm install
```

### 2. Configure variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha os valores no `.env.local`:

```env
# Supabase (obrigatório) - Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Postgres (obrigatório) - Dashboard > Settings > Database
POSTGRES_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...

# n8n AI Chatbot (opcional)
N8N_WEBHOOK_URL=https://seu-n8n.app.n8n.cloud/webhook/...

# WhatsApp Evolution API (opcional)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE_NAME=nome-da-instancia
```

### 3. Configure o banco de dados

Execute o script SQL no Supabase SQL Editor ou via CLI:

```bash
# Via Supabase CLI
supabase db push
```

Ou copie o conteúdo de `scripts/001-create-tables.sql` e execute no SQL Editor do Supabase Dashboard.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── chat/              # API do chatbot AI
│   │   └── whatsapp/          # Webhooks WhatsApp
│   ├── auth/                  # Páginas de autenticação
│   ├── dashboard/             # Dashboard principal
│   └── page.tsx               # Landing page
├── components/
│   ├── chat/                  # Componente do chatbot
│   ├── dashboard/             # Componentes do dashboard
│   └── ui/                    # Componentes shadcn/ui
├── hooks/                     # React hooks customizados
├── lib/
│   └── supabase/              # Clientes Supabase
├── scripts/                   # Scripts SQL
├── services/                  # Serviços externos (WhatsApp)
└── types/                     # TypeScript types
```

## Funcionalidades

### Gerenciamento de Tarefas
- Criar, editar, excluir tarefas
- Contador de Pomodoros (estimado vs real)
- Notas por tarefa
- Organização por projetos

### Pomodoro Tracking
- Timer integrado (25 min trabalho / 5 min pausa)
- Estatísticas no footer
- Estimativa de tempo de conclusão

### AI Chatbot
- Assistente para gerenciar tarefas
- Integração com n8n para workflows customizados
- Fallback para Vercel AI Gateway

### WhatsApp Integration
- Comandos: `#todolist`, `#summary`, `[número]`
- Resumo diário automático
- Marcar tarefas como concluídas via mensagem

## Comandos WhatsApp

| Comando | Descrição |
|---------|-----------|
| `#todolist` | Lista todas as tarefas ativas |
| `#summary` | Resumo com estatísticas do dia |
| `1`, `2`, etc | Marca a tarefa N como concluída |

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Adicione as variáveis de ambiente
3. Deploy automático

## Licença

MIT
