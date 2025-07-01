const bcrypt = require('bcryptjs');
const database = require('../database/database');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
    this.is_active = data.is_active;
  }

  static async create(userData) {
    const { username, email, password } = userData;
    
    // Validar dados
    if (!username || !email || !password) {
      throw new Error('Username, email e password são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Verificar se email já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já está em uso');
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

  static async findById(id) {
    const row = await database.get('SELECT * FROM users WHERE id = ? AND is_active = 1', [id]);
    return row ? new User(row) : null;
  }

  static async findByEmail(email) {
    const row = await database.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    return row ? new User(row) : null;
  }

  static async findByUsername(username) {
    const row = await database.get('SELECT * FROM users WHERE username = ? AND is_active = 1', [username]);
    return row ? new User(row) : null;
  }

  async checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }

  async updatePassword(newPassword) {
    if (newPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await database.run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, this.id]);
    this.password_hash = password_hash;
  }

  async delete() {
    await database.run('UPDATE users SET is_active = 0 WHERE id = ?', [this.id]);
    this.is_active = 0;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      created_at: this.created_at,
      is_active: this.is_active
    };
  }
}

module.exports = User;

