# Zenit Finance API

API REST para gerenciamento de finanças pessoais, desenvolvida com **Node.js 24**, **Fastify**, **TypeScript** e **Prisma**. Permite o controle de movimentações financeiras (receitas e despesas) organizadas por categorias, com autenticação segura via e-mail/senha e login social com Google.

## Índice

- [Zenit Finance API](#zenit-finance-api)
  - [Índice](#índice)
  - [Tecnologias](#tecnologias)
  - [Funcionalidades](#funcionalidades)
    - [Autenticação](#autenticação)
    - [Movimentações (Transactions)](#movimentações-transactions)
    - [Categorias](#categorias)
  - [Estrutura de Pastas](#estrutura-de-pastas)
  - [Pré-requisitos](#pré-requisitos)
  - [Como Executar](#como-executar)
    - [1. Clone o repositório](#1-clone-o-repositório)
    - [2. Instale as dependências](#2-instale-as-dependências)
    - [3. Configure as variáveis de ambiente](#3-configure-as-variáveis-de-ambiente)
    - [4. Suba o banco de dados com Docker](#4-suba-o-banco-de-dados-com-docker)
    - [5. Execute as migrations do Prisma](#5-execute-as-migrations-do-prisma)
    - [6. Inicie o servidor de desenvolvimento](#6-inicie-o-servidor-de-desenvolvimento)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Scripts Disponíveis](#scripts-disponíveis)
  - [Documentação da API](#documentação-da-api)

## Tecnologias

| Tecnologia | Descrição |
| --- | --- |
| [Node.js 24](https://nodejs.org/) | Runtime JavaScript |
| [Fastify](https://fastify.dev/) | Framework web de alta performance |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Prisma](https://www.prisma.io/) | ORM para acesso ao banco de dados |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados relacional |
| [Better Auth](https://www.better-auth.com/) | Autenticação (e-mail/senha + OAuth) |
| [Zod](https://zod.dev/) | Validação de schemas e dados |
| [Swagger + Scalar](https://scalar.com/) | Documentação interativa da API |
| [Biome](https://biomejs.dev/) | Linter e formatter |
| [Docker](https://www.docker.com/) | Containerização do banco de dados |

## Funcionalidades

### Autenticação
- Cadastro e login com e-mail e senha
- Login social com Google
- Gerenciamento de sessões

### Movimentações (Transactions)
- Criar movimentação (receita ou despesa)
- Listar movimentações por mês
- Editar movimentação
- Excluir movimentação

### Categorias
- Cadastrar categoria (com escopo: receita, despesa ou ambos)
- Listar categorias do usuário
- Editar categoria
- Excluir categoria

## Estrutura de Pastas

```
├── prisma/
│   ├── schema.prisma          # Modelagem do banco de dados
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── env.ts                 # Validação das variáveis de ambiente (Zod)
│   ├── server.ts              # Configuração e inicialização do Fastify
│   ├── generated/
│   │   └── prisma/            # Código gerado pelo Prisma Client
│   ├── lib/
│   │   ├── auth.ts            # Configuração do Better Auth
│   │   └── prisma.ts          # Instância do Prisma Client
│   └── routes/
│       └── auth.ts            # Rotas de autenticação
├── biome.json                 # Configuração do Biome (linter/formatter)
├── docker-compose.yml         # Container do PostgreSQL
├── package.json
├── prisma.config.ts           # Configuração do Prisma
└── tsconfig.json              # Configuração do TypeScript
```

## Pré-requisitos

- [Node.js 24](https://nodejs.org/)
- [pnpm](https://pnpm.io/) (gerenciador de pacotes)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) (para o banco de dados)

## Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/zenit-finance-api.git
cd zenit-finance-api
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no exemplo abaixo (veja a seção [Variáveis de Ambiente](#variáveis-de-ambiente)):

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://docker:docker@localhost:5432/zenit
BETTER_AUTH_SECRET=sua-chave-secreta
API_BASE_URL=http://localhost:8080
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
```

### 4. Suba o banco de dados com Docker

```bash
docker compose up -d
```

### 5. Execute as migrations do Prisma

```bash
pnpm prisma migrate dev
```

### 6. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:8080`.

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória | Padrão |
| --- | --- | --- | --- |
| `NODE_ENV` | Ambiente de execução (`development`, `production`, `test`) | Não | `development` |
| `PORT` | Porta do servidor | Não | `8080` |
| `DATABASE_URL` | URL de conexão com o PostgreSQL | Sim | — |
| `BETTER_AUTH_SECRET` | Chave secreta para autenticação | Sim | — |
| `API_BASE_URL` | URL base da API | Não | `http://localhost:8080` |
| `GOOGLE_CLIENT_ID` | Client ID do Google OAuth | Sim | — |
| `GOOGLE_CLIENT_SECRET` | Client Secret do Google OAuth | Sim | — |

## Scripts Disponíveis

| Script | Comando | Descrição |
| --- | --- | --- |
| `dev` | `pnpm dev` | Inicia o servidor em modo de desenvolvimento com hot-reload |
| `lint` | `pnpm lint` | Executa a verificação de lint com o Biome |
| `format` | `pnpm format` | Formata o código com o Biome |
| `check-types` | `pnpm check-types` | Verifica os tipos do TypeScript |

## Documentação da API

Com o servidor rodando, a documentação interativa da API (Scalar UI) está disponível em:

```
http://localhost:8080/docs
```
