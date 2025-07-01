// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando para criar um usuário de teste
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
    body: user,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 201) {
      return response.body.user;
    }
    throw new Error(`Failed to create user: ${response.body.error}`);
  });
});

// Comando para fazer login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/login`,
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    return response.body.user;
  });
});

// Comando para criar uma categoria de teste
Cypress.Commands.add('createTestCategory', (categoryData, userId) => {
  const defaultCategory = {
    name: 'Categoria Teste',
    color: '#3B82F6',
    user_id: userId
  };
  
  const category = { ...defaultCategory, ...categoryData };
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/categories`,
    body: category
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.category;
  });
});

// Comando para criar uma transação de teste
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

// Comando para limpar dados de teste
Cypress.Commands.add('cleanupTestData', () => {
  // Este comando seria usado para limpar dados entre testes
  // Por enquanto, vamos apenas fazer um log
  cy.log('Limpando dados de teste...');
});

// Comando para aguardar que a API esteja disponível
Cypress.Commands.add('waitForAPI', () => {
  return cy.request({
    method: 'GET',
    url: `${Cypress.env('apiUrl').replace('/api', '')}/health`,
    retryOnStatusCodeFailure: true,
    timeout: 30000
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.status).to.eq('OK');
  });
});

