const request = require('supertest');
const app = require('../../src/app');

describe('Users API', () => {
  describe('POST /api/users', () => {
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

      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 400 for invalid data', async () => {
      const userData = {
        username: 'testuser'
        // email e password faltando
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Criar primeiro usuário
      await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Tentar criar usuário com mesmo email
      const duplicateUserData = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(duplicateUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email já está em uso');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      const userId = createResponse.body.user.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // password faltando
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email e senha são obrigatórios');
    });
  });

  describe('PUT /api/users/:id/password', () => {
    let userId;

    beforeEach(async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const createResponse = await request(app)
        .post('/api/users')
        .send(userData);

      userId = createResponse.body.user.id;
    });

    it('should update password successfully', async () => {
      const updateData = {
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put(`/api/users/${userId}/password`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Senha atualizada com sucesso');

      // Verificar se pode fazer login com nova senha
      const loginData = {
        email: 'test@example.com',
        password: 'newpassword123'
      };

      await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);
    });

    it('should return 400 for short password', async () => {
      const updateData = {
        newPassword: '123'
      };

      const response = await request(app)
        .put(`/api/users/${userId}/password`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/users/999/password')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });
  });
});

