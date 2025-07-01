const database = require('../src/database/database');

// Setup global para testes
beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await database.connect();
});

afterAll(async () => {
  await database.close();
});

// Limpar dados entre testes
afterEach(async () => {
  if (database.db) {
    await database.run('DELETE FROM transactions');
    await database.run('DELETE FROM categories');
    await database.run('DELETE FROM users');
    await database.run('DELETE FROM budgets');
  }
});

