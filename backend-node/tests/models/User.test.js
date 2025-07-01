const User = require('../../src/models/User');

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
      expect(user.email).toBe('test@example.com');
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe('password123'); // Deve estar hasheada
    });

    it('should throw error for missing required fields', async () => {
      const userData = {
        username: 'testuser'
        // email e password faltando
      };

      await expect(User.create(userData)).rejects.toThrow('Username, email e password são obrigatórios');
    });

    it('should throw error for short password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123' // Muito curta
      };

      await expect(User.create(userData)).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(userData);

      const duplicateUserData = {
        username: 'testuser2',
        email: 'test@example.com', // Email duplicado
        password: 'password123'
      };

      await expect(User.create(duplicateUserData)).rejects.toThrow('Email já está em uso');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const createdUser = await User.create(userData);
      const foundUser = await User.findById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.username).toBe('testuser');
    });

    it('should return null for non-existent user', async () => {
      const user = await User.findById(999);
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await User.create(userData);
      const foundUser = await User.findByEmail('test@example.com');

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('checkPassword', () => {
    it('should return true for correct password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const isValid = await user.checkPassword('password123');

      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const isValid = await user.checkPassword('wrongpassword');

      expect(isValid).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const oldPasswordHash = user.password_hash;

      await user.updatePassword('newpassword123');

      expect(user.password_hash).not.toBe(oldPasswordHash);
      
      const isValidOld = await user.checkPassword('password123');
      const isValidNew = await user.checkPassword('newpassword123');
      
      expect(isValidOld).toBe(false);
      expect(isValidNew).toBe(true);
    });

    it('should throw error for short new password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      await expect(user.updatePassword('123')).rejects.toThrow('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('toJSON', () => {
    it('should return user data without password_hash', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);
      const json = user.toJSON();

      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('username');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('created_at');
      expect(json).toHaveProperty('is_active');
      expect(json).not.toHaveProperty('password_hash');
    });
  });
});

