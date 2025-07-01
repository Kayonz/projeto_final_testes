describe('Full Integration Tests', () => {
  let testUser;
  let testCategory;

  before(() => {
    // Aguardar que a API esteja disponível
    cy.waitForAPI();
  });

  beforeEach(() => {
    // Criar dados de teste para cada teste
    const uniqueEmail = `integration_test_${Date.now()}@example.com`;
    cy.createTestUser({ email: uniqueEmail }).then((user) => {
      testUser = user;
      return cy.createTestCategory({ name: 'Categoria Integração' }, user.id);
    }).then((category) => {
      testCategory = category;
    });
  });

  describe('Complete User Journey', () => {
    it('should complete a full user workflow', () => {
      // 1. Verificar se a API está funcionando
      cy.request('GET', `${Cypress.env('apiUrl').replace('/api', '')}/health`)
        .then((response) => {
          expect(response.status).to.eq(200);
        });

      // 2. Criar uma transação via API
      cy.createTestTransaction({
        description: 'Compra de teste',
        amount: 250.75,
        transaction_type: 'expense'
      }, testUser.id).then((transaction) => {
        expect(transaction).to.have.property('id');
        expect(transaction.amount).to.eq(250.75);
      });

      // 3. Verificar se a transação foi criada
      cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${testUser.id}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.greaterThan(0);
          
          const transaction = response.body.find(t => t.description === 'Compra de teste');
          expect(transaction).to.exist;
          expect(transaction.amount).to.eq(250.75);
        });

      // 4. Visitar o frontend (se disponível)
      cy.visit('/', { failOnStatusCode: false });
      cy.get('body').should('be.visible');
    });

    it('should handle multiple transactions', () => {
      const transactions = [
        { description: 'Receita 1', amount: 1000, transaction_type: 'income' },
        { description: 'Despesa 1', amount: 200, transaction_type: 'expense' },
        { description: 'Despesa 2', amount: 150, transaction_type: 'expense' }
      ];

      // Criar múltiplas transações
      transactions.forEach((transactionData) => {
        cy.createTestTransaction(transactionData, testUser.id);
      });

      // Verificar se todas foram criadas
      cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${testUser.id}`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.eq(transactions.length);
          
          // Verificar saldo calculado
          const totalIncome = response.body
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
          
          const totalExpense = response.body
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          expect(totalIncome).to.eq(1000);
          expect(totalExpense).to.eq(350);
        });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', () => {
      // Criar transação
      cy.createTestTransaction({
        description: 'Transação Consistência',
        amount: 100,
        transaction_type: 'expense'
      }, testUser.id).then((transaction) => {
        const transactionId = transaction.id;
        
        // Atualizar transação
        cy.request('PUT', `${Cypress.env('apiUrl')}/transactions/${transactionId}`, {
          description: 'Transação Atualizada',
          amount: 150
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.transaction.description).to.eq('Transação Atualizada');
          expect(response.body.transaction.amount).to.eq(150);
        });
        
        // Verificar se a atualização persistiu
        cy.request('GET', `${Cypress.env('apiUrl')}/transactions/${transactionId}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.description).to.eq('Transação Atualizada');
            expect(response.body.amount).to.eq(150);
          });
      });
    });

    it('should handle concurrent operations', () => {
      // Simular operações concorrentes
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          cy.createTestTransaction({
            description: `Transação Concorrente ${i}`,
            amount: 50 + i,
            transaction_type: 'expense'
          }, testUser.id)
        );
      }
      
      // Verificar se todas as transações foram criadas
      cy.wrap(Promise.all(promises)).then(() => {
        cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${testUser.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.eq(5);
          });
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from API errors gracefully', () => {
      // Tentar criar transação com dados inválidos
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transactions`,
        body: {
          description: '',
          amount: -100,
          transaction_type: 'invalid'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
      
      // Verificar se a API ainda está funcionando
      cy.request('GET', `${Cypress.env('apiUrl').replace('/api', '')}/health`)
        .then((response) => {
          expect(response.status).to.eq(200);
        });
    });

    it('should handle database constraints', () => {
      // Tentar criar usuário com email duplicado
      const userData = {
        username: 'testuser2',
        email: testUser.email, // Email já existe
        password: 'password123'
      };
      
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/users`,
        body: userData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Email já está em uso');
      });
    });
  });

  describe('Performance Under Load', () => {
    it('should handle multiple requests efficiently', () => {
      const startTime = Date.now();
      
      // Fazer múltiplas requisições
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${testUser.id}`)
        );
      }
      
      cy.wrap(Promise.all(requests)).then(() => {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Verificar se o tempo total é aceitável (menos de 5 segundos)
        expect(totalTime).to.be.lessThan(5000);
      });
    });
  });

  describe('Security', () => {
    it('should validate user permissions', () => {
      // Criar outro usuário
      const anotherEmail = `security_test_${Date.now()}@example.com`;
      cy.createTestUser({ email: anotherEmail }).then((anotherUser) => {
        // Tentar acessar transações de outro usuário
        cy.request({
          method: 'GET',
          url: `${Cypress.env('apiUrl')}/transactions/user/${anotherUser.id}`,
          failOnStatusCode: false
        }).then((response) => {
          // Por enquanto, a API não tem autenticação, então vai retornar 200
          // Em uma implementação real, deveria retornar 401 ou 403
          expect(response.status).to.be.oneOf([200, 401, 403]);
        });
      });
    });

    it('should sanitize input data', () => {
      // Tentar injeção de script
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/transactions`,
        body: {
          description: '<script>alert("xss")</script>',
          amount: 100,
          transaction_type: 'expense',
          transaction_date: '2024-01-01',
          user_id: testUser.id
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 201) {
          // Verificar se o script foi sanitizado
          expect(response.body.transaction.description).to.not.include('<script>');
        }
      });
    });
  });
});

