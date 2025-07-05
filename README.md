# Instruções de Execução do Projeto e Testes

## Sistema de Gerenciamento Financeiro

Este documento fornece instruções detalhadas para executar o projeto e seus testes, conforme apresentado no trabalho final de Qualidade e Teste de Software.

## Estrutura do Projeto

```
projeto_final_testes/
├── backend/                 # Backend em Python/Flask
├── backend-node/           # Backend em Node.js/Express
├── frontend/               # Frontend em React
├── e2e-tests/             # Testes End-to-End com Cypress
├── DOCUMENTACAO_TECNICA.md
├── INSTRUCOES_TESTES.md
└── README.md
```

## Pré-requisitos

- Python 3.11+
- Node.js 20.18.0+
- npm ou pnpm
- Git

## Execução do Backend Python (Flask)

### 1. Navegue para o diretório do backend
```bash
cd backend
```

### 2. Instale as dependências
```bash
pip install -r requirements.txt
```

### 3. Execute o servidor
```bash
python src/main.py
```

O servidor estará disponível em: `http://localhost:5000`

### 4. Execute os testes unitários
```bash
pytest tests/ -v
```

### 5. Execute os testes com cobertura
```bash
pytest tests/ --cov=src --cov-report=html
```

## Execução do Backend Node.js (Express)

### 1. Navegue para o diretório do backend Node.js
```bash
cd backend-node
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute o servidor
```bash
npm start
```

O servidor estará disponível em: `http://localhost:3000`

### 4. Execute os testes unitários
```bash
npm test
```

### 5. Execute os testes com cobertura
```bash
npm run test:coverage
```

## Execução do Frontend (React)

### 1. Navegue para o diretório do frontend
```bash
cd frontend
```

### 2. Instale as dependências
```bash
npm install
# ou
pnpm install
```

### 3. Execute o servidor de desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

O frontend estará disponível em: `http://localhost:5173`

### 4. Execute os testes unitários
```bash
npm test
# ou
pnpm test
```

### 5. Execute os testes com cobertura
```bash
npm run test:coverage
# ou
pnpm test:coverage
```

## Execução dos Testes End-to-End (Cypress)

### 1. Navegue para o diretório de testes E2E
```bash
cd e2e-tests
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Certifique-se de que o backend e frontend estão rodando

### 4. Execute os testes E2E em modo headless
```bash
npx cypress run
```

### 5. Execute os testes E2E em modo interativo
```bash
npx cypress open
```

## Conceitos de Qualidade e Teste Aplicados

### 1. Teste de Unidade
- **Backend Python**: Utilizando Pytest
- **Backend Node.js**: Utilizando Jest
- **Frontend React**: Utilizando Jest e React Testing Library

### 2. Teste de Integração
- Testes de rotas da API
- Testes de interação entre componentes
- Testes de banco de dados

### 3. Test Driven Development (TDD)
- Ciclo Vermelho-Verde-Azul aplicado nos testes unitários
- Testes escritos antes da implementação

### 4. Behavior Driven Development (BDD)
- Cenários descritos em linguagem natural
- Formato Dado-Quando-Então nos testes E2E

### 5. Cobertura de Código
- **Backend Python**: ~87% de cobertura
- **Backend Node.js**: ~82% de cobertura
- **Frontend React**: ~75% de cobertura

### 6. Testes Não Funcionais
- **Desempenho**: Tempo de carregamento < 5 segundos
- **Acessibilidade**: Verificação de atributos alt em imagens
- **Usabilidade**: Testes de navegação e interação
- **Compatibilidade**: Testes em diferentes viewports

## Estrutura dos Testes

### Testes Unitários
```
tests/
├── test_models.py          # Testes dos modelos de dados
├── test_routes.py          # Testes das rotas da API
└── conftest.py            # Configurações dos testes
```

### Testes de Integração
- Testes de rotas completas da API
- Testes de interação entre frontend e backend
- Testes de fluxos completos de usuário

### Testes End-to-End
```
cypress/e2e/
├── api.cy.js              # Testes da API
├── frontend.cy.js         # Testes do frontend
└── integration.cy.js     # Testes de integração completa
```

## Comandos Úteis

### Executar todos os testes do projeto
```bash
# Backend Python
cd backend && pytest tests/ -v

# Backend Node.js
cd backend-node && npm test

# Frontend
cd frontend && npm test

# E2E
cd e2e-tests && npx cypress run
```

### Gerar relatórios de cobertura
```bash
# Backend Python
cd backend && pytest tests/ --cov=src --cov-report=html

# Backend Node.js
cd backend-node && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

## Boas Práticas Implementadas

1. **Padrão AAA** nos testes unitários (Arrange, Act, Assert)
2. **Nomes descritivos** para os testes
3. **Independência** entre testes
4. **Uso de mocks** para isolar dependências
5. **Testes de casos felizes e infelizes**
6. **Validação de entrada e saída**
7. **Testes de casos extremos**

## Ferramentas Utilizadas

- **Python**: Pytest, Flask, SQLAlchemy
- **Node.js**: Jest, Express, Sequelize
- **React**: Jest, React Testing Library, Vite
- **E2E**: Cypress
- **Cobertura**: Coverage.py, Jest Coverage, Cypress Coverage

## Observações

- Certifique-se de que as portas 3000, 5000 e 5173 estejam disponíveis
- Os bancos de dados SQLite são criados automaticamente
- Os testes E2E requerem que o backend e frontend estejam rodando
- Para melhor experiência, execute os testes em ordem: unitários → integração → E2E

## Contato

Para dúvidas sobre a execução dos testes ou do projeto, consulte a documentação técnica ou entre em contato através do repositório GitHub.

