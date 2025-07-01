describe('API Tests', () => {
  beforeEach(() => {
    // Aguardar que a API esteja disponível
    cy.waitForAPI();
  });

  describe('Health Check', () => {
    it('should return API health status', () => {
      cy.request('GET', `${Cypress.env('apiUrl').replace('/api', '')}/health`)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('status', 'OK');
          expect(response.body).to.have.property('service', 'Finance API');
          expect(response.body).to.have.property('timestamp');
        });
    });
  });

  describe('Users API', () => {
    it('should create a new user', () => {
      cy.fixture('users').then((users) => {
        const uniqueEmail = `test_${Date.now()}@example.com`;
        const userData = {
          ...users.validUser,
          email: uniqueEmail
        };

        cy.request('POST', `${Cypress.env('apiUrl')}/users`, userData)
          .then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Usuário criado com sucesso');
            expect(response.body.user).to.have.property('id');
            expect(response.body.user).to.have.property('username', userData.username);
            expect(response.body.user).to.have.property('email', uniqueEmail);
            expect(response.body.user).to.not.have.property('password_hash');
          });
      });
    });

    it('should not create user with invalid data', () => {
      cy.fixture('users').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/users`,
          body: users.invalidUser,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
    });

    it('should login with valid credentials', () => {
      // Primeiro criar um usuário
      const uniqueEmail = `login_test_${Date.now()}@example.com`;
      cy.createTestUser({ email: uniqueEmail }).then((user) => {
        // Então fazer login
        cy.request('POST', `${Cypress.env('apiUrl')}/users/login`, {
          email: uniqueEmail,
          password: 'password123'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('message', 'Login realizado com sucesso');
          expect(response.body.user).to.have.property('email', uniqueEmail);
        });
      });
    });

    it('should not login with invalid credentials', () => {
      cy.fixture('users').then((users) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/users/login`,
          body: users.loginCredentials.invalid,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(401);
          expect(response.body).to.have.property('error', 'Credenciais inválidas');
        });
      });
    });
  });

  describe('Categories API', () => {
    let testUser;

    beforeEach(() => {
      const uniqueEmail = `category_test_${Date.now()}@example.com`;
      cy.createTestUser({ email: uniqueEmail }).then((user) => {
        testUser = user;
      });
    });

    it('should create a new category', () => {
      cy.fixture('transactions').then((data) => {
        const categoryData = {
          ...data.categories[0],
          user_id: testUser.id
        };

        cy.request('POST', `${Cypress.env('apiUrl')}/categories`, categoryData)
          .then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Categoria criada com sucesso');
            expect(response.body.category).to.have.property('id');
            expect(response.body.category).to.have.property('name', categoryData.name);
            expect(response.body.category).to.have.property('user_id', testUser.id);
          });
      });
    });

    it('should get categories by user', () => {
      // Primeiro criar uma categoria
      cy.createTestCategory({ name: 'Categoria Teste' }, testUser.id).then(() => {
        // Então buscar categorias do usuário
        cy.request('GET', `${Cypress.env('apiUrl')}/categories/user/${testUser.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.greaterThan(0);
            expect(response.body[0]).to.have.property('name', 'Categoria Teste');
          });
      });
    });
  });

  describe('Transactions API', () => {
    let testUser;
    let testCategory;

    beforeEach(() => {
      const uniqueEmail = `transaction_test_${Date.now()}@example.com`;
      cy.createTestUser({ email: uniqueEmail }).then((user) => {
        testUser = user;
        return cy.createTestCategory({ name: 'Categoria Teste' }, user.id);
      }).then((category) => {
        testCategory = category;
      });
    });

    it('should create a new transaction', () => {
      cy.fixture('transactions').then((data) => {
        const transactionData = {
          ...data.validTransaction,
          user_id: testUser.id,
          category_id: testCategory.id
        };

        cy.request('POST', `${Cypress.env('apiUrl')}/transactions`, transactionData)
          .then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Transação criada com sucesso');
            expect(response.body.transaction).to.have.property('id');
            expect(response.body.transaction).to.have.property('description', transactionData.description);
            expect(response.body.transaction).to.have.property('amount', transactionData.amount);
            expect(response.body.transaction).to.have.property('user_id', testUser.id);
          });
      });
    });

    it('should get transactions by user', () => {
      // Primeiro criar uma transação
      cy.createTestTransaction({ description: 'Transação Teste' }, testUser.id).then(() => {
        // Então buscar transações do usuário
        cy.request('GET', `${Cypress.env('apiUrl')}/transactions/user/${testUser.id}`)
          .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.greaterThan(0);
            expect(response.body[0]).to.have.property('description', 'Transação Teste');
          });
      });
    });

    it('should not create transaction with invalid data', () => {
      cy.fixture('transactions').then((data) => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/transactions`,
          body: data.invalidTransaction,
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('error');
        });
      });
    });
  });
});

