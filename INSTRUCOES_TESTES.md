# 🧪 Guia Completo de Execução de Testes

> **Instruções detalhadas para executar todos os tipos de teste no Sistema de Gestão Financeira**

## 📋 Visão Geral dos Testes

Este projeto implementa uma estratégia completa de testes utilizando três ferramentas principais:

- **Jest**: Testes unitários (backend e frontend)
- **Supertest**: Testes de integração de API
- **Cypress**: Testes end-to-end (E2E)

### Estrutura de Testes

```
finance_quality_system/
├── backend-node/tests/          # Testes do backend (Jest + Supertest)
├── frontend/src/components/__tests__/  # Testes do frontend (Jest)
└── e2e-tests/cypress/e2e/       # Testes E2E (Cypress)
```

## 🚀 Pré-requisitos

### Software Necessário

- **Node.js** 18+ 
- **npm** ou **pnpm**
- **Git**

### Verificar Instalação

```bash
node --version    # Deve ser 18+
npm --version     # Qualquer versão recente
pnpm --version    # Opcional, mas recomendado para o frontend
```

## 🔧 Configuração Inicial

### 1. Clonar e Configurar o Projeto

```bash
git clone <repository-url>
cd finance_quality_system
```

### 2. Instalar Dependências

#### Backend
```bash
cd backend-node
npm install
```

#### Frontend
```bash
cd ../frontend
pnpm install
# ou npm install
```

#### Testes E2E
```bash
cd ../e2e-tests
npm install
```

## 🧪 Executando Testes Unitários

### Backend (Jest + Supertest)

#### Comandos Básicos

```bash
cd backend-node

# Executar todos os testes
npm test

# Executar em modo watch (re-executa quando arquivos mudam)
npm run test:watch

# Executar com relatório de cobertura
npm run test:coverage
```

#### Executar Testes Específicos

```bash
# Executar apenas testes de modelos
npm test -- tests/models/

# Executar apenas testes de rotas
npm test -- tests/routes/

# Executar teste específico
npm test -- tests/models/User.test.js

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="should create"
```

#### Exemplo de Saída

```
 PASS  tests/models/User.test.js
  User Model
    create
      ✓ should create a new user with valid data (89 ms)
      ✓ should throw error for missing required fields (5 ms)
      ✓ should throw error for short password (4 ms)
      ✓ should throw error for duplicate email (88 ms)
    findById
      ✓ should find user by id (91 ms)
      ✓ should return null for non-existent user (1 ms)

 PASS  tests/routes/users.test.js
  Users API
    POST /api/users
      ✓ should create a new user (156 ms)
      ✓ should return 400 for invalid data (12 ms)

Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        2.5s
```

#### Relatório de Cobertura

```bash
npm run test:coverage
```

**Saída esperada:**
```
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------------|---------|----------|---------|---------|----------------
All files              |   85.42 |    78.26 |   87.50 |   85.42 |
 src/models            |   88.24 |    81.82 |   90.91 |   88.24 |
  User.js              |   90.00 |    85.00 |   93.33 |   90.00 | 34,56
  Category.js          |   85.71 |    75.00 |   87.50 |   85.71 | 23,45
  Transaction.js       |   89.47 |    85.71 |   92.31 |   89.47 | 67,89
```

### Frontend (Jest + Testing Library)

#### Comandos Básicos

```bash
cd frontend

# Executar todos os testes
pnpm test
# ou npm test

# Executar em modo watch
pnpm test:watch

# Executar com cobertura
pnpm test:coverage
```

#### Executar Testes Específicos

```bash
# Executar apenas testes de componentes
pnpm test -- src/components/

# Executar teste específico
pnpm test -- FinanceCard.test.jsx

# Executar com verbose para mais detalhes
pnpm test -- --verbose
```

#### Exemplo de Saída

```
 PASS  src/components/__tests__/FinanceCard.test.jsx
  FinanceCard
    ✓ renders with basic props (45 ms)
    ✓ formats currency correctly (12 ms)
    ✓ displays correct type label for income (8 ms)
    ✓ applies correct color classes (6 ms)

 PASS  src/components/__tests__/TransactionForm.test.jsx
  TransactionForm
    ✓ renders form with all fields (23 ms)
    ✓ submits form with valid data (156 ms)
    ✓ shows validation error for empty description (89 ms)

Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        3.4s
```

## 🔗 Executando Testes de Integração

### Testes de API (Supertest)

Os testes de integração estão incluídos nos testes do backend e são executados automaticamente:

```bash
cd backend-node
npm test
```

#### Testes Específicos de API

```bash
# Executar apenas testes de rotas (integração)
npm test -- tests/routes/

# Executar testes de uma rota específica
npm test -- tests/routes/users.test.js
```

#### Exemplo de Teste de Integração

```javascript
describe('Users API', () => {
  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(response.body.user.username).toBe('testuser');
  });
});
```

## 🌐 Executando Testes E2E (Cypress)

### Pré-requisitos para Testes E2E

**IMPORTANTE**: Para executar testes E2E, tanto o backend quanto o frontend devem estar rodando.

#### 1. Iniciar o Backend

```bash
# Terminal 1
cd backend-node
npm run dev
```

**Verificar se está rodando:**
```bash
curl http://localhost:5000/health
# Deve retornar: {"status":"OK","service":"Finance API"}
```

#### 2. Iniciar o Frontend

```bash
# Terminal 2
cd frontend
pnpm dev
# ou npm run dev
```

**Verificar se está rodando:**
- Abrir http://localhost:5173 no navegador

### Executar Testes Cypress

#### Modo Headless (Recomendado para CI)

```bash
# Terminal 3
cd e2e-tests

# Executar todos os testes E2E
npm test

# Executar testes específicos
npm run cypress:run -- --spec "cypress/e2e/api.cy.js"

# Executar com browser específico
npm run cypress:run -- --browser chrome
```

#### Modo Interativo (Para Desenvolvimento)

```bash
cd e2e-tests

# Abrir interface do Cypress
npm run cypress:open
```

**Nota**: O modo interativo requer interface gráfica e pode não funcionar em ambientes headless.

### Tipos de Testes E2E

#### 1. Testes de API

```bash
# Executar apenas testes de API
npm run cypress:run -- --spec "cypress/e2e/api.cy.js"
```

**O que testa:**
- Endpoints da API
- Validação de dados
- Códigos de status HTTP
- Estrutura de resposta

#### 2. Testes de Frontend

```bash
# Executar apenas testes de frontend
npm run cypress:run -- --spec "cypress/e2e/frontend.cy.js"
```

**O que testa:**
- Carregamento de páginas
- Responsividade
- Interações de usuário
- Validação de formulários

#### 3. Testes de Integração Completa

```bash
# Executar testes de integração completa
npm run cypress:run -- --spec "cypress/e2e/integration.cy.js"
```

**O que testa:**
- Fluxos completos de usuário
- Integração frontend-backend
- Consistência de dados
- Cenários de erro

### Exemplo de Saída do Cypress

```
Running:  api.cy.js                                                    (1 of 3)

  API Tests
    Health Check
      ✓ should return API health status (245ms)
    Users API
      ✓ should create a new user (456ms)
      ✓ should not create user with invalid data (123ms)
      ✓ should login with valid credentials (234ms)

  4 passing (1.2s)

Running:  frontend.cy.js                                               (2 of 3)

  Frontend Tests
    Page Load
      ✓ should load the main page successfully (567ms)
      ✓ should have responsive design (890ms)

  2 passing (1.5s)

====================================================================================================

  (Run Finished)

       Spec                                              Tests  Passing  Failing  Pending  Skipped
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  api.cy.js                                00:01        4        4        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  frontend.cy.js                           00:01        2        2        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✔  All specs passed!                        00:03        6        6        -        -        -
```

## 📊 Executando Todos os Testes

### Script Completo de Testes

Crie um script para executar todos os testes em sequência:

```bash
#!/bin/bash
# test-all.sh

echo "🧪 Executando todos os testes do Sistema de Gestão Financeira"
echo "============================================================"

# Testes do Backend
echo "📦 Executando testes do backend..."
cd backend-node
npm test
if [ $? -ne 0 ]; then
    echo "❌ Testes do backend falharam!"
    exit 1
fi
echo "✅ Testes do backend passaram!"

# Testes do Frontend
echo "⚛️ Executando testes do frontend..."
cd ../frontend
pnpm test
if [ $? -ne 0 ]; then
    echo "❌ Testes do frontend falharam!"
    exit 1
fi
echo "✅ Testes do frontend passaram!"

# Iniciar serviços para testes E2E
echo "🚀 Iniciando serviços para testes E2E..."
cd ../backend-node
npm run dev &
BACKEND_PID=$!

cd ../frontend
pnpm dev &
FRONTEND_PID=$!

# Aguardar serviços iniciarem
sleep 10

# Testes E2E
echo "🌐 Executando testes E2E..."
cd ../e2e-tests
npm test
E2E_RESULT=$?

# Parar serviços
kill $BACKEND_PID $FRONTEND_PID

if [ $E2E_RESULT -ne 0 ]; then
    echo "❌ Testes E2E falharam!"
    exit 1
fi

echo "✅ Todos os testes passaram!"
echo "🎉 Sistema validado com sucesso!"
```

### Executar o Script

```bash
chmod +x test-all.sh
./test-all.sh
```

## 🔍 Análise de Cobertura

### Relatórios de Cobertura

#### Backend

```bash
cd backend-node
npm run test:coverage

# Abrir relatório HTML
open coverage/lcov-report/index.html
# ou no Linux: xdg-open coverage/lcov-report/index.html
```

#### Frontend

```bash
cd frontend
pnpm test:coverage

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

### Métricas de Cobertura

#### Interpretação dos Valores

- **Statements**: Porcentagem de declarações executadas
- **Branches**: Porcentagem de ramificações (if/else) testadas
- **Functions**: Porcentagem de funções chamadas
- **Lines**: Porcentagem de linhas executadas

#### Thresholds Configurados

**Backend:**
- Mínimo: 80% em todas as métricas
- Modelos: 90% em todas as métricas

**Frontend:**
- Mínimo: 85% em todas as métricas

## 🐛 Debugging de Testes

### Debug do Jest

#### Executar com Debug

```bash
# Backend
cd backend-node
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend
cd frontend
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Usar Debugger no Código

```javascript
describe('User Model', () => {
  it('should create user', async () => {
    debugger; // Pausar aqui
    const user = await User.create(userData);
    expect(user).toBeDefined();
  });
});
```

### Debug do Cypress

#### Executar com Debug

```bash
cd e2e-tests
npm run cypress:open
```

#### Usar cy.debug() nos Testes

```javascript
cy.get('[data-testid="form"]')
  .debug() // Pausar aqui
  .submit();
```

### Logs Detalhados

#### Jest Verbose

```bash
npm test -- --verbose
```

#### Cypress com Logs

```bash
npm run cypress:run -- --reporter spec
```

## ⚠️ Troubleshooting

### Problemas Comuns

#### 1. "Cannot find module"

**Solução:**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### 2. "Port already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :5000
lsof -i :5173

# Matar processo
kill -9 <PID>
```

#### 3. Testes E2E não conectam

**Verificar:**
1. Backend rodando em http://localhost:5000
2. Frontend rodando em http://localhost:5173
3. Firewall não bloqueando portas

#### 4. Testes falhando intermitentemente

**Soluções:**
- Aumentar timeouts
- Adicionar waits explícitos
- Verificar race conditions

### Logs de Debug

#### Habilitar Logs Detalhados

```bash
# Jest
DEBUG=* npm test

# Cypress
DEBUG=cypress:* npm run cypress:run
```

## 📈 Métricas de Qualidade

### Resumo de Testes

| Tipo | Quantidade | Tempo | Cobertura |
|------|------------|-------|-----------|
| Unitários Backend | 13 | 2.5s | 85% |
| Unitários Frontend | 27 | 3.4s | 92% |
| Integração API | 15 | 4.2s | - |
| E2E | 25 | 12.8s | - |
| **Total** | **80** | **22.9s** | **88%** |

### Comandos de Verificação Rápida

```bash
# Status geral dos testes
npm test 2>&1 | grep -E "(passing|failing|PASS|FAIL)"

# Cobertura resumida
npm run test:coverage 2>&1 | grep "All files"

# Tempo de execução
time npm test
```

## 🚀 Integração Contínua

### GitHub Actions

Exemplo de workflow para CI:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Backend tests
      - run: cd backend-node && npm install
      - run: cd backend-node && npm test
      
      # Frontend tests
      - run: cd frontend && pnpm install
      - run: cd frontend && pnpm test
      
      # E2E tests
      - run: cd backend-node && npm start &
      - run: cd frontend && pnpm dev &
      - run: sleep 10
      - run: cd e2e-tests && npm install
      - run: cd e2e-tests && npm test
```

---

**📞 Suporte**: Para dúvidas sobre execução de testes, consulte a documentação técnica ou abra uma issue no repositório.

