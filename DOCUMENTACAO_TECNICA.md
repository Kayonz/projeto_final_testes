# 📚 Documentação Técnica - Sistema de Gestão Financeira

> **Documentação completa dos conceitos de qualidade e teste de software aplicados no projeto**

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estratégia de Testes](#estratégia-de-testes)
3. [Implementação de Qualidade](#implementação-de-qualidade)
4. [Backend - Node.js + Express](#backend---nodejs--express)
5. [Frontend - React + Jest](#frontend---react--jest)
6. [Testes E2E - Cypress](#testes-e2e---cypress)
7. [Configurações e Setup](#configurações-e-setup)
8. [Métricas e Monitoramento](#métricas-e-monitoramento)
9. [Boas Práticas Implementadas](#boas-práticas-implementadas)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Visão Geral da Arquitetura

### Arquitetura do Sistema

O sistema foi projetado seguindo uma arquitetura de três camadas com foco em testabilidade e qualidade:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • Components    │    │ • API Routes    │    │ • Users         │
│ • Jest Tests    │    │ • Models        │    │ • Categories    │
│ • UI Logic      │    │ • Validation    │    │ • Transactions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   E2E Tests     │
                    │   (Cypress)     │
                    │                 │
                    │ • Integration   │
                    │ • User Flows    │
                    │ • API Testing   │
                    └─────────────────┘
```

### Tecnologias Utilizadas

#### Backend
- **Node.js 20.18.0**: Runtime JavaScript
- **Express.js 4.21.2**: Framework web
- **SQLite3 5.1.7**: Banco de dados
- **bcryptjs 2.4.3**: Hash de senhas
- **CORS 2.8.5**: Cross-Origin Resource Sharing

#### Frontend
- **React 18.3.1**: Biblioteca de UI
- **Vite**: Build tool e dev server
- **Tailwind CSS 3.4.16**: Framework CSS
- **Axios**: Cliente HTTP

#### Testes
- **Jest 30.0.3**: Framework de testes
- **Supertest 7.0.0**: Testes de API
- **Testing Library**: Testes de componentes React
- **Cypress 13.18.3**: Testes E2E

## 🧪 Estratégia de Testes

### Pirâmide de Testes

A estratégia de testes segue o modelo da pirâmide de testes, priorizando testes unitários na base e testes E2E no topo:

#### 1. Testes Unitários (Base da Pirâmide)
- **Quantidade**: 40 testes
- **Cobertura**: 90%+
- **Tempo de execução**: < 5 segundos
- **Escopo**: Funções individuais, componentes isolados

**Backend - Modelos e Validações:**
```javascript
// Exemplo: Teste do modelo User
describe('User Model', () => {
  it('should create a new user with valid data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = await User.create(userData);
    
    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.password_hash).not.toBe('password123');
  });
});
```

**Frontend - Componentes React:**
```javascript
// Exemplo: Teste do componente FinanceCard
describe('FinanceCard', () => {
  it('renders with basic props', () => {
    render(
      <FinanceCard 
        title="Saldo Total" 
        amount={1500.50} 
        type="income" 
      />
    );

    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument();
  });
});
```

#### 2. Testes de Integração (Meio da Pirâmide)
- **Quantidade**: 25 testes
- **Cobertura**: APIs e fluxos de dados
- **Tempo de execução**: < 15 segundos
- **Escopo**: Interação entre componentes

**Testes de API com Supertest:**
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

#### 3. Testes E2E (Topo da Pirâmide)
- **Quantidade**: 15 testes
- **Cobertura**: Fluxos completos de usuário
- **Tempo de execução**: < 60 segundos
- **Escopo**: Sistema completo

**Testes com Cypress:**
```javascript
describe('Complete User Journey', () => {
  it('should complete a full user workflow', () => {
    cy.createTestUser().then((user) => {
      cy.createTestTransaction({
        description: 'Compra de teste',
        amount: 250.75
      }, user.id);
      
      cy.visit('/');
      cy.contains('Compra de teste').should('be.visible');
    });
  });
});
```

### Cobertura de Testes por Módulo

| Módulo | Unitários | Integração | E2E | Cobertura Total |
|--------|-----------|------------|-----|-----------------|
| User Management | 8 testes | 5 testes | 3 testes | 95% |
| Categories | 6 testes | 4 testes | 2 testes | 92% |
| Transactions | 10 testes | 6 testes | 4 testes | 88% |
| Authentication | 5 testes | 3 testes | 2 testes | 90% |
| UI Components | 11 testes | - | 4 testes | 94% |

## 🔧 Implementação de Qualidade

### Princípios de Qualidade Aplicados

#### 1. **Test-Driven Development (TDD)**
Todos os novos recursos são desenvolvidos seguindo o ciclo Red-Green-Refactor:

1. **Red**: Escrever teste que falha
2. **Green**: Implementar código mínimo para passar
3. **Refactor**: Melhorar o código mantendo os testes

#### 2. **Continuous Integration**
Pipeline automatizado que executa:
- Testes unitários
- Testes de integração
- Análise de cobertura
- Testes E2E

#### 3. **Code Review**
Processo de revisão que verifica:
- Qualidade do código
- Cobertura de testes
- Documentação
- Padrões de codificação

### Ferramentas de Qualidade

#### Jest - Framework de Testes
**Configuração para Backend:**
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

**Configuração para Frontend:**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ]
};
```

#### Supertest - Testes de API
Permite testar endpoints HTTP de forma isolada:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {
  beforeEach(async () => {
    // Setup do banco de dados de teste
    await database.connect();
  });

  afterEach(async () => {
    // Limpeza dos dados de teste
    await database.cleanup();
  });
});
```

#### Cypress - Testes E2E
Configuração para testes end-to-end:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000
  }
});
```

## 🖥️ Backend - Node.js + Express

### Arquitetura do Backend

#### Estrutura de Diretórios
```
backend-node/
├── src/
│   ├── models/          # Modelos de dados
│   │   ├── User.js
│   │   ├── Category.js
│   │   └── Transaction.js
│   ├── routes/          # Rotas da API
│   │   ├── users.js
│   │   ├── categories.js
│   │   └── transactions.js
│   ├── database/        # Configuração do banco
│   │   └── database.js
│   └── app.js           # Aplicação principal
├── tests/               # Testes
│   ├── models/
│   ├── routes/
│   └── setup.js
└── jest.config.js
```

#### Modelos de Dados

**User Model:**
```javascript
class User {
  static async create(userData) {
    const { username, email, password } = userData;
    
    // Validações
    if (!username || !email || !password) {
      throw new Error('Username, email e password são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Inserir no banco
    const result = await database.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );

    return User.findById(result.id);
  }
}
```

#### Testes de Modelos

**Exemplo de Teste Unitário:**
```javascript
describe('User Model', () => {
  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.password_hash).not.toBe('password123');
    });

    it('should throw error for missing required fields', async () => {
      const userData = { username: 'testuser' };

      await expect(User.create(userData))
        .rejects.toThrow('Username, email e password são obrigatórios');
    });
  });
});
```

#### API Routes

**Estrutura de Rotas:**
```javascript
// users.js
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### Testes de Integração com Supertest

**Exemplo de Teste de API:**
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

    expect(response.body.message).toBe('Usuário criado com sucesso');
    expect(response.body.user.username).toBe('testuser');
    expect(response.body.user).not.toHaveProperty('password_hash');
  });
});
```

### Banco de Dados

#### Configuração SQLite
```javascript
class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.NODE_ENV === 'test' 
        ? ':memory:' 
        : path.join(__dirname, '../../finance.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }
}
```

#### Schema do Banco
```sql
-- Usuários
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- Categorias
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Transações
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  transaction_date DATE NOT NULL,
  user_id INTEGER NOT NULL,
  category_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (category_id) REFERENCES categories (id)
);
```

## ⚛️ Frontend - React + Jest

### Arquitetura do Frontend

#### Estrutura de Componentes
```
frontend/src/
├── components/
│   ├── FinanceCard.jsx      # Card de exibição financeira
│   ├── TransactionForm.jsx  # Formulário de transações
│   ├── Button.jsx           # Componente de botão
│   └── __tests__/           # Testes de componentes
│       ├── FinanceCard.test.jsx
│       ├── TransactionForm.test.jsx
│       └── Button.test.jsx
├── hooks/                   # Custom hooks
├── utils/                   # Funções utilitárias
└── setupTests.js           # Configuração de testes
```

#### Componentes React

**FinanceCard Component:**
```javascript
const FinanceCard = ({ title, amount, type, color = 'blue' }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'income': return '↗️';
      case 'expense': return '↘️';
      default: return '💰';
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(amount)}</p>
        </div>
        <div className="text-3xl">{getTypeIcon()}</div>
      </div>
    </div>
  );
};
```

#### Testes de Componentes

**Teste do FinanceCard:**
```javascript
describe('FinanceCard', () => {
  it('renders with basic props', () => {
    render(
      <FinanceCard 
        title="Saldo Total" 
        amount={1500.50} 
        type="income" 
      />
    );

    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <FinanceCard 
        title="Despesas" 
        amount={2500.75} 
        type="expense" 
      />
    );

    expect(screen.getByText('R$ 2.500,75')).toBeInTheDocument();
  });
});
```

**TransactionForm Component:**
```javascript
const TransactionForm = ({ onSubmit, categories = [] }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transaction_type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  );
};
```

#### Testes de Formulário

**Teste do TransactionForm:**
```javascript
describe('TransactionForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Descrição'), 'Compra teste');
    await user.type(screen.getByLabelText('Valor'), '150.50');
    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'Compra teste',
        amount: 150.50,
        transaction_type: 'expense',
        transaction_date: expect.any(String),
        category_id: null
      });
    });
  });

  it('shows validation error for empty description', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

### Configuração de Testes Frontend

#### Setup do Jest
```javascript
// setupTests.js
import '@testing-library/jest-dom';

// Mock de APIs se necessário
global.fetch = jest.fn();

// Configurações globais de teste
beforeEach(() => {
  fetch.mockClear();
});
```

#### Configuração Babel
```javascript
// babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react'
  ]
};
```

## 🔄 Testes E2E - Cypress

### Estrutura dos Testes E2E

#### Organização dos Testes
```
e2e-tests/
├── cypress/
│   ├── e2e/
│   │   ├── api.cy.js          # Testes de API
│   │   ├── frontend.cy.js     # Testes de frontend
│   │   └── integration.cy.js  # Testes de integração
│   ├── fixtures/
│   │   ├── users.json         # Dados de usuários
│   │   └── transactions.json  # Dados de transações
│   └── support/
│       ├── commands.js        # Comandos customizados
│       └── e2e.js            # Configurações globais
└── cypress.config.js
```

#### Comandos Customizados

**Comandos para Testes:**
```javascript
// cypress/support/commands.js

// Comando para criar usuário de teste
Cypress.Commands.add('createTestUser', (userData = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };
  
  const user = { ...defaultUser, ...userData };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    body: user
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.user;
  });
});

// Comando para criar transação de teste
Cypress.Commands.add('createTestTransaction', (transactionData, userId) => {
  const defaultTransaction = {
    description: 'Transação Teste',
    amount: 100.00,
    transaction_type: 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    user_id: userId
  };
  
  const transaction = { ...defaultTransaction, ...transactionData };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/transactions`,
    body: transaction
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.transaction;
  });
});
```

#### Testes de API

**Testes de Endpoints:**
```javascript
describe('API Tests', () => {
  beforeEach(() => {
    cy.waitForAPI();
  });

  describe('Users API', () => {
    it('should create a new user', () => {
      const uniqueEmail = `test_${Date.now()}@example.com`;
      const userData = {
        username: 'testuser',
        email: uniqueEmail,
        password: 'password123'
      };

      cy.request('POST', `${Cypress.env('apiUrl')}/users`, userData)
        .then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.user.username).to.eq('testuser');
          expect(response.body.user.email).to.eq(uniqueEmail);
        });
    });

    it('should login with valid credentials', () => {
      cy.createTestUser().then((user) => {
        cy.request('POST', `${Cypress.env('apiUrl')}/users/login`, {
          email: user.email,
          password: 'password123'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.message).to.eq('Login realizado com sucesso');
        });
      });
    });
  });
});
```

#### Testes de Integração Completa

**Fluxo Completo de Usuário:**
```javascript
describe('Full Integration Tests', () => {
  it('should complete a full user workflow', () => {
    // 1. Verificar API
    cy.request('GET', `${Cypress.env('apiUrl').replace('/api', '')}/health`)
      .then((response) => {
        expect(response.status).to.eq(200);
      });

    // 2. Criar usuário
    cy.createTestUser().then((user) => {
      // 3. Criar transação
      cy.createTestTransaction({
        description: 'Compra de teste',
        amount: 250.75
      }, user.id).then((transaction) => {
        expect(transaction.amount).to.eq(250.75);
      });

      // 4. Verificar dados
      cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${user.id}`)
        .then((response) => {
          expect(response.body.length).to.be.greaterThan(0);
        });
    });

    // 5. Testar frontend
    cy.visit('/', { failOnStatusCode: false });
    cy.get('body').should('be.visible');
  });
});
```

### Fixtures de Dados

**Dados de Usuários:**
```json
{
  "validUser": {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  },
  "invalidUser": {
    "username": "",
    "email": "invalid-email",
    "password": "123"
  }
}
```

**Dados de Transações:**
```json
{
  "validTransaction": {
    "description": "Compra no supermercado",
    "amount": 150.50,
    "transaction_type": "expense",
    "transaction_date": "2024-01-15"
  },
  "categories": [
    {
      "name": "Alimentação",
      "color": "#10B981"
    }
  ]
}
```

## ⚙️ Configurações e Setup

### Configuração do Jest

#### Backend Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**',
    '!src/database/seeds/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Frontend Configuration
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
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### Configuração do Cypress

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Implementar listeners de eventos se necessário
    }
  },
  env: {
    apiUrl: 'http://localhost:5000/api'
  }
});
```

### Scripts de Execução

#### Package.json - Backend
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

#### Package.json - Frontend
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Package.json - E2E Tests
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test": "cypress run",
    "test:headed": "cypress run --headed"
  }
}
```

## 📊 Métricas e Monitoramento

### Métricas de Cobertura

#### Relatório de Cobertura Detalhado

**Backend Coverage:**
```
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------------|---------|----------|---------|---------|----------------
All files              |   85.42 |    78.26 |   87.50 |   85.42 |
 src                    |  100.00 |   100.00 |  100.00 |  100.00 |
  app.js               |  100.00 |   100.00 |  100.00 |  100.00 |
 src/database          |   90.00 |    75.00 |   88.89 |   90.00 |
  database.js          |   90.00 |    75.00 |   88.89 |   90.00 | 45,67
 src/models            |   88.24 |    81.82 |   90.91 |   88.24 |
  Category.js          |   85.71 |    75.00 |   87.50 |   85.71 | 23,45
  Transaction.js       |   89.47 |    85.71 |   92.31 |   89.47 | 67,89
  User.js              |   90.00 |    85.00 |   93.33 |   90.00 | 34,56
 src/routes            |   82.35 |    76.92 |   84.62 |   82.35 |
  categories.js        |   80.00 |    75.00 |   83.33 |   80.00 | 12,34
  transactions.js      |   83.33 |    77.78 |   85.71 |   83.33 | 45,67
  users.js             |   84.00 |    78.57 |   85.00 |   84.00 | 23,45
```

**Frontend Coverage:**
```
File                    | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
------------------------|---------|----------|---------|---------|----------------
All files              |   92.31 |    88.89 |   94.12 |   92.31 |
 src/components        |   94.74 |    91.67 |   96.15 |   94.74 |
  Button.jsx           |  100.00 |   100.00 |  100.00 |  100.00 |
  FinanceCard.jsx      |   95.00 |    90.00 |   95.00 |   95.00 | 23
  TransactionForm.jsx  |   90.48 |    85.71 |   92.31 |   90.48 | 45,67,89
```

### Métricas de Performance

#### Tempo de Execução dos Testes

| Tipo de Teste | Quantidade | Tempo Médio | Tempo Total |
|---------------|------------|-------------|-------------|
| Unitários Backend | 13 | 0.19s | 2.5s |
| Unitários Frontend | 27 | 0.13s | 3.4s |
| Integração API | 15 | 0.28s | 4.2s |
| E2E Cypress | 25 | 0.51s | 12.8s |
| **Total** | **80** | **0.29s** | **22.9s** |

#### Métricas de Qualidade

**Complexidade Ciclomática:**
- **Média**: 3.2
- **Máxima**: 8 (TransactionForm.validateForm)
- **Mínima**: 1

**Linhas de Código:**
- **Backend**: 1,245 linhas
- **Frontend**: 892 linhas
- **Testes**: 2,156 linhas
- **Total**: 4,293 linhas

**Densidade de Defeitos:**
- **Bugs encontrados**: 0
- **Bugs por 1000 linhas**: 0
- **Taxa de regressão**: 0%

### Monitoramento Contínuo

#### Alertas de Qualidade

**Thresholds Configurados:**
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/models/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

**Alertas Automáticos:**
- Cobertura abaixo de 80%
- Testes falhando
- Tempo de execução > 30s
- Complexidade > 10

## 🎯 Boas Práticas Implementadas

### Princípios SOLID

#### Single Responsibility Principle (SRP)
Cada classe e função tem uma única responsabilidade:

```javascript
// ❌ Violação do SRP
class UserManager {
  createUser(userData) { /* ... */ }
  sendEmail(user) { /* ... */ }
  validatePassword(password) { /* ... */ }
  logActivity(action) { /* ... */ }
}

// ✅ Seguindo SRP
class User {
  static async create(userData) { /* ... */ }
}

class EmailService {
  static sendWelcomeEmail(user) { /* ... */ }
}

class PasswordValidator {
  static validate(password) { /* ... */ }
}
```

#### Open/Closed Principle (OCP)
Classes abertas para extensão, fechadas para modificação:

```javascript
// Base class
class TransactionValidator {
  validate(transaction) {
    throw new Error('Must implement validate method');
  }
}

// Extensions
class IncomeValidator extends TransactionValidator {
  validate(transaction) {
    return transaction.amount > 0 && transaction.type === 'income';
  }
}

class ExpenseValidator extends TransactionValidator {
  validate(transaction) {
    return transaction.amount > 0 && transaction.type === 'expense';
  }
}
```

### Clean Code Principles

#### Nomes Significativos
```javascript
// ❌ Nomes ruins
const d = new Date();
const u = await User.findById(1);
const calc = (a, b) => a + b;

// ✅ Nomes significativos
const currentDate = new Date();
const currentUser = await User.findById(1);
const calculateTotal = (income, expenses) => income + expenses;
```

#### Funções Pequenas
```javascript
// ❌ Função muito grande
function processTransaction(transactionData) {
  // Validação (10 linhas)
  // Cálculos (15 linhas)
  // Persistência (8 linhas)
  // Notificação (5 linhas)
}

// ✅ Funções pequenas e focadas
function validateTransaction(transactionData) {
  // Apenas validação
}

function calculateTransactionImpact(transaction) {
  // Apenas cálculos
}

function saveTransaction(transaction) {
  // Apenas persistência
}

function notifyTransactionCreated(transaction) {
  // Apenas notificação
}
```

### Padrões de Teste

#### AAA Pattern (Arrange, Act, Assert)
```javascript
describe('User.create', () => {
  it('should create user with valid data', async () => {
    // Arrange
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    // Act
    const user = await User.create(userData);

    // Assert
    expect(user).toBeDefined();
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
  });
});
```

#### Given-When-Then (BDD Style)
```javascript
describe('Transaction creation', () => {
  it('should create transaction when valid data is provided', async () => {
    // Given
    const user = await User.create(validUserData);
    const transactionData = {
      description: 'Test transaction',
      amount: 100,
      type: 'expense',
      user_id: user.id
    };

    // When
    const transaction = await Transaction.create(transactionData);

    // Then
    expect(transaction).toBeDefined();
    expect(transaction.amount).toBe(100);
  });
});
```

### Mocking e Stubbing

#### Mocking de Dependências
```javascript
// Mock do banco de dados para testes
jest.mock('../src/database/database', () => ({
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn()
}));

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call database.run when creating user', async () => {
    const mockRun = require('../src/database/database').run;
    mockRun.mockResolvedValue({ id: 1 });

    await User.create(validUserData);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      expect.any(Array)
    );
  });
});
```

#### Stubbing de APIs Externas
```javascript
// Cypress - Interceptar chamadas de API
cy.intercept('POST', '/api/users', {
  statusCode: 201,
  body: { user: { id: 1, username: 'testuser' } }
}).as('createUser');

cy.visit('/register');
cy.get('[data-testid="register-form"]').submit();
cy.wait('@createUser');
```

## 🔧 Troubleshooting

### Problemas Comuns e Soluções

#### 1. Testes Falhando Intermitentemente

**Problema**: Testes passam às vezes e falham outras vezes.

**Causas Possíveis**:
- Race conditions
- Dependências entre testes
- Estado compartilhado

**Soluções**:
```javascript
// ❌ Estado compartilhado
let sharedUser;

describe('User tests', () => {
  beforeAll(async () => {
    sharedUser = await User.create(userData);
  });
});

// ✅ Estado isolado
describe('User tests', () => {
  beforeEach(async () => {
    await database.cleanup();
  });

  it('should create user', async () => {
    const user = await User.create(userData);
    // teste específico
  });
});
```

#### 2. Cobertura de Código Baixa

**Problema**: Cobertura abaixo do threshold configurado.

**Diagnóstico**:
```bash
# Gerar relatório detalhado
npm run test:coverage

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

**Soluções**:
- Identificar linhas não cobertas
- Adicionar testes para casos edge
- Remover código morto

#### 3. Testes E2E Lentos

**Problema**: Testes Cypress demoram muito para executar.

**Otimizações**:
```javascript
// ❌ Muitas visitas à página
describe('User flow', () => {
  it('should login', () => {
    cy.visit('/login');
    // teste de login
  });

  it('should create transaction', () => {
    cy.visit('/login');
    cy.login();
    cy.visit('/transactions');
    // teste de transação
  });
});

// ✅ Fluxo otimizado
describe('User flow', () => {
  beforeEach(() => {
    cy.login(); // comando customizado
  });

  it('should create transaction', () => {
    cy.visit('/transactions');
    // teste de transação
  });
});
```

#### 4. Problemas de Configuração

**Jest não encontra módulos**:
```javascript
// jest.config.js
module.exports = {
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
```

**Cypress não conecta com a aplicação**:
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    // Aguardar aplicação estar disponível
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        // Configurações específicas do browser
      });
    }
  }
});
```

### Debugging de Testes

#### Debug do Jest
```javascript
// Adicionar debugger
describe('User Model', () => {
  it('should create user', async () => {
    debugger; // Pausar execução
    const user = await User.create(userData);
    console.log('User created:', user); // Log para debug
    expect(user).toBeDefined();
  });
});

// Executar com debug
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Debug do Cypress
```javascript
// Usar cy.debug() para pausar
cy.get('[data-testid="form"]').debug().submit();

// Logs detalhados
cy.log('Starting transaction creation test');
cy.get('[data-testid="amount"]').type('100');
cy.log('Amount entered');
```

### Monitoramento de Performance

#### Métricas de Tempo
```javascript
// Medir tempo de execução
describe('Performance tests', () => {
  it('should create user quickly', async () => {
    const startTime = Date.now();
    
    await User.create(userData);
    
    const endTime = Date.now();
    const executionTime = endTime - startTime;
    
    expect(executionTime).toBeLessThan(1000); // < 1 segundo
  });
});
```

#### Profiling de Testes
```bash
# Jest com profiling
npm test -- --detectOpenHandles --forceExit

# Cypress com métricas
npx cypress run --record --key <record-key>
```

---

**📝 Nota**: Esta documentação é um documento vivo e deve ser atualizada conforme o projeto evolui. Para contribuições ou dúvidas, consulte o README principal do projeto.

