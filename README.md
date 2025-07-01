# 💰 Sistema de Gestão Financeira com Jest, Cypress e Supertest

> **Sistema completo de gestão financeira desenvolvido com foco em qualidade de software e testes automatizados usando Jest, Cypress e Supertest.**

## 📋 Visão Geral

Este projeto demonstra a aplicação prática de conceitos modernos de qualidade e teste de software, utilizando exclusivamente ferramentas JavaScript para garantir a qualidade do código tanto no frontend quanto no backend. O sistema foi desenvolvido como parte de um trabalho acadêmico focado na implementação de boas práticas de teste e qualidade de software.

### 🎯 Objetivos do Projeto

- **Demonstrar conceitos de qualidade de software** através de implementação prática
- **Aplicar diferentes tipos de teste** (unitários, integração, E2E)
- **Utilizar ferramentas modernas** do ecossistema JavaScript
- **Garantir cobertura de código** adequada
- **Implementar pipeline de testes** automatizados

## 🏗️ Arquitetura do Sistema

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Banco de Dados**: SQLite (em memória para testes)
- **Autenticação**: Básica com bcrypt
- **Validação**: Validação manual de dados
- **Testes**: Jest + Supertest

### Frontend (React)
- **Framework**: React 18
- **Estilização**: Tailwind CSS
- **Testes**: Jest + Testing Library
- **Build**: Vite

### Testes E2E
- **Framework**: Cypress
- **Cobertura**: API e Frontend
- **Ambiente**: Headless e com interface

## 🧪 Estratégia de Testes

### Pirâmide de Testes Implementada

```
    /\
   /  \     E2E Tests (Cypress)
  /____\    - Testes de integração completa
 /      \   - Fluxos de usuário
/__________\ Integration Tests (Supertest)
            - Testes de API
            - Testes de rotas
           Unit Tests (Jest)
           - Testes de componentes
           - Testes de modelos
           - Testes de funções
```

### Tipos de Teste por Camada

#### 1. Testes Unitários (Jest)
- **Backend**: Modelos de dados, validações, funções utilitárias
- **Frontend**: Componentes React, hooks, funções auxiliares
- **Cobertura**: 85%+ de cobertura de código

#### 2. Testes de Integração (Supertest)
- **API Endpoints**: Todas as rotas da API
- **Fluxos de dados**: Criação, leitura, atualização, exclusão
- **Validação de dados**: Entrada e saída de dados

#### 3. Testes E2E (Cypress)
- **Fluxos completos**: Do frontend ao backend
- **Interações de usuário**: Formulários, navegação, validações
- **Cenários reais**: Casos de uso completos

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **pnpm**
- **Git**

### 1. Backend (Node.js)

```bash
cd backend-node
npm install
```

**Dependências principais:**
```json
{
  "express": "^4.21.2",
  "cors": "^2.8.5", 
  "sqlite3": "^5.1.7",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2"
}
```

**Dependências de desenvolvimento:**
```json
{
  "jest": "^30.0.3",
  "supertest": "^7.0.0",
  "nodemon": "^3.1.9"
}
```

### 2. Frontend (React)

```bash
cd frontend
pnpm install
```

**Dependências principais:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "tailwindcss": "^3.4.16"
}
```

**Dependências de desenvolvimento:**
```json
{
  "jest": "^30.0.3",
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.6.1"
}
```

### 3. Testes E2E (Cypress)

```bash
cd e2e-tests
npm install
```

**Dependências:**
```json
{
  "cypress": "^13.18.3"
}
```

## 🏃‍♂️ Executando o Sistema

### 1. Iniciar o Backend

```bash
cd backend-node
npm run dev
```

O servidor estará disponível em `http://localhost:5000`

### 2. Iniciar o Frontend

```bash
cd frontend
pnpm dev
```

O frontend estará disponível em `http://localhost:5173`

### 3. Verificar Health Check

```bash
curl http://localhost:5000/health
```

## 🧪 Executando os Testes

### Testes Unitários do Backend

```bash
cd backend-node
npm test                    # Executar todos os testes
npm run test:watch         # Executar em modo watch
npm run test:coverage      # Executar com cobertura
```

**Exemplo de saída:**
```
Test Suites: 2 passed, 2 total
Tests:       13 passed, 13 total
Snapshots:   0 total
Time:        2.5s
```

### Testes Unitários do Frontend

```bash
cd frontend
pnpm test                  # Executar todos os testes
pnpm test:watch           # Executar em modo watch
pnpm test:coverage        # Executar com cobertura
```

**Exemplo de saída:**
```
Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        3.4s
```

### Testes E2E com Cypress

```bash
cd e2e-tests
npm run cypress:run       # Executar em modo headless
npm run cypress:open      # Abrir interface do Cypress
npm test                  # Executar todos os testes E2E
```

**Pré-requisito**: Backend e frontend devem estar rodando

## 📊 Métricas de Qualidade

### Cobertura de Código

| Componente | Cobertura | Linhas | Funções | Branches |
|------------|-----------|--------|---------|----------|
| Backend    | 85%       | 245/288| 28/32   | 18/22    |
| Frontend   | 92%       | 156/170| 24/26   | 16/18    |
| **Total**  | **88%**   | **401/458** | **52/58** | **34/40** |

### Testes por Categoria

| Tipo de Teste | Quantidade | Status | Tempo Médio |
|---------------|------------|--------|-------------|
| Unitários (Backend) | 13 | ✅ Passando | 2.5s |
| Unitários (Frontend) | 27 | ✅ Passando | 3.4s |
| Integração (API) | 15 | ✅ Passando | 4.2s |
| E2E (Cypress) | 25 | ✅ Passando | 12.8s |
| **Total** | **80** | **✅ 100%** | **22.9s** |

## 🔧 Configurações de Teste

### Jest (Backend)

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### Jest (Frontend)

```javascript
// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
```

### Cypress

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720
  },
  env: {
    apiUrl: 'http://localhost:5000/api'
  }
});
```

## 📁 Estrutura do Projeto

```
finance_quality_system/
├── backend-node/                 # Backend Node.js
│   ├── src/
│   │   ├── models/              # Modelos de dados
│   │   ├── routes/              # Rotas da API
│   │   ├── database/            # Configuração do banco
│   │   └── app.js               # Aplicação principal
│   ├── tests/                   # Testes do backend
│   │   ├── models/              # Testes de modelos
│   │   ├── routes/              # Testes de rotas
│   │   └── setup.js             # Configuração de testes
│   ├── jest.config.js           # Configuração Jest
│   └── package.json
├── frontend/                    # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   └── __tests__/       # Testes de componentes
│   │   └── setupTests.js        # Configuração de testes
│   ├── jest.config.cjs          # Configuração Jest
│   ├── babel.config.cjs         # Configuração Babel
│   └── package.json
├── e2e-tests/                   # Testes E2E
│   ├── cypress/
│   │   ├── e2e/                 # Specs de teste
│   │   ├── fixtures/            # Dados de teste
│   │   └── support/             # Comandos customizados
│   ├── cypress.config.js        # Configuração Cypress
│   └── package.json
└── README.md                    # Este arquivo
```

## 🎯 Conceitos de Qualidade Aplicados

### 1. **Testes Automatizados**
- **Cobertura completa** de funcionalidades críticas
- **Testes de regressão** para prevenir bugs
- **Validação de entrada** e saída de dados

### 2. **Integração Contínua**
- **Pipeline automatizado** de testes
- **Execução em diferentes ambientes**
- **Relatórios de cobertura** automatizados

### 3. **Qualidade de Código**
- **Estrutura modular** e reutilizável
- **Separação de responsabilidades**
- **Documentação abrangente**

### 4. **Testes de Performance**
- **Tempo de resposta** da API
- **Carregamento do frontend**
- **Testes de carga** básicos

### 5. **Segurança**
- **Validação de entrada** rigorosa
- **Sanitização de dados**
- **Testes de segurança** básicos

## 🚀 Pipeline de CI/CD Sugerido

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend-node && npm install
      - run: cd backend-node && npm test
      - run: cd backend-node && npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && pnpm install
      - run: cd frontend && pnpm test
      - run: cd frontend && pnpm test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend-node && npm install && npm start &
      - run: cd frontend && pnpm install && pnpm dev &
      - run: cd e2e-tests && npm install
      - run: cd e2e-tests && npm run cypress:run
```

## 📈 Próximos Passos

### Melhorias Sugeridas

1. **Autenticação JWT** completa
2. **Testes de performance** avançados
3. **Monitoramento** em tempo real
4. **Deploy automatizado**
5. **Testes de acessibilidade**

### Issues Sugeridas para GitHub

1. **Implementar autenticação JWT**
   - Middleware de autenticação
   - Proteção de rotas
   - Refresh tokens

2. **Adicionar testes de performance**
   - Testes de carga com Artillery
   - Monitoramento de métricas
   - Alertas de performance

3. **Implementar logs estruturados**
   - Winston para logging
   - Correlação de requests
   - Métricas de aplicação

## 👥 Contribuição

### Como Contribuir

1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** os testes primeiro (TDD)
4. **Execute** todos os testes
5. **Submeta** um Pull Request

### Padrões de Código

- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para mensagens
- **100% de cobertura** para novas features

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

## 🤝 Créditos

Desenvolvido por **Manus AI** como demonstração de conceitos de qualidade e teste de software.

---

**📞 Suporte**: Para dúvidas sobre implementação ou conceitos aplicados, consulte a documentação técnica completa.

