# 🗺️ Roadmap

⏱️ **Estimativa total:** **2 semanas**  
🎯 **Objetivo:** Implementar uma API funcional, performática e escalável para consumo do frontend do Zenit Finance

---

## 🧱 FASE 1 — Setup do Projeto e Infraestrutura  
**Duração:** 1 dia

### Objetivos
- Criar base sólida e organizada
- Garantir consistência desde o início

### Tarefas
- [X] Criar repositório do projeto
- [X] Inicializar projeto Fastify
- [X] Configurar TypeScript
- [X] Configurar Biome
- [X] Configurar variáveis de ambiente
- [X] Configurar Prisma:
  - [X] Conexão com banco
  - [X] Estrutura inicial
  - [X] Migrations iniciais

---

## 🗄️ FASE 2 — Modelagem de Dados e Regras de Negócio  
**Duração:** 1 dia

### Objetivos
- Garantir integridade dos dados
- Preparar base para o backend

### Tarefas
- [X] Modelar entidade User
- [X] Modelar entidade Transaction
- [X] Modelar entidade Category
- [X] Definir relacionamentos entre tabelas
- [X] Criar migrations no Prisma

---

## 🔐 FASE 3 — Autenticação e Documentação  
**Duração:** 1 dia

### Objetivos
- Garantir acesso seguro
- Preparar documentação da API

### Tarefas
- [X] Configurar autenticação (Better Auth)
- [X] Configurar login social com o Google
- [X] Preparar documentação da API com Swagger e Scalar UI

---

## 📡 FASE 4 — Implementar as principais rotas
**Duração:** 3 a 5 dias

### Objetivos
- Implementar o core da aplicação

### Tarefas
- [ ] Criar rota para criar movimentação
- [ ] Criar rota para listar movimentações por mês
- [ ] Criar rota para editar movimentação
- [ ] Criar rota para excluir movimentação
- [ ] Criar rota para cadastro de categoria
- [ ] Criar rota para edição de categoria
- [ ] Criar rota para listagem de categorias
- [ ] Criar rota para exclusão de categorias

---

## 🚀 FASE 5 — Preparação para o Lançamento  
**Duração:** 2 a 3 dias

### Objetivos
- Colocar a API no ar

### Tarefas
- [ ] Configrar o banco de dados em nuvem
- [ ] Fazer o deploy da aplicação em alguma plataforma (Railway, Render, VPS)
- [ ] Configurar o domínio

---

## 🐞 FASE 6 — Testes automatizados
**Duração:** 3 a 9 dias

### Objetivos
- Criar testes automatizados para garantir o funcionamento adequado da aplicação

### Tarefas
- [ ] Implementar testes unitários com o Vitest (ou outra ferramenta)
- [ ] Implementar testes de API com Supertest + Vitest (ou outras ferramentas)
