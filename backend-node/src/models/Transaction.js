const database = require('../database/database');

class Transaction {
  constructor(data) {
    this.id = data.id;
    this.description = data.description;
    this.amount = data.amount;
    this.transaction_type = data.transaction_type;
    this.transaction_date = data.transaction_date;
    this.user_id = data.user_id;
    this.category_id = data.category_id;
    this.created_at = data.created_at;
  }

  static async create(transactionData) {
    const { description, amount, transaction_type, transaction_date, user_id, category_id } = transactionData;
    
    if (!description || !amount || !transaction_type || !transaction_date || !user_id) {
      throw new Error('Descrição, valor, tipo, data e user_id são obrigatórios');
    }

    if (!['income', 'expense'].includes(transaction_type)) {
      throw new Error('Tipo de transação deve ser "income" ou "expense"');
    }

    if (amount <= 0) {
      throw new Error('Valor deve ser positivo');
    }

    const result = await database.run(
      'INSERT INTO transactions (description, amount, transaction_type, transaction_date, user_id, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [description, amount, transaction_type, transaction_date, user_id, category_id]
    );

    return Transaction.findById(result.id);
  }

  static async findById(id) {
    const row = await database.get('SELECT * FROM transactions WHERE id = ?', [id]);
    return row ? new Transaction(row) : null;
  }

  static async findByUserId(user_id, limit = 50, offset = 0) {
    const rows = await database.all(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC LIMIT ? OFFSET ?',
      [user_id, limit, offset]
    );
    return rows.map(row => new Transaction(row));
  }

  static async findByUserIdAndDateRange(user_id, start_date, end_date) {
    const rows = await database.all(
      'SELECT * FROM transactions WHERE user_id = ? AND transaction_date BETWEEN ? AND ? ORDER BY transaction_date DESC',
      [user_id, start_date, end_date]
    );
    return rows.map(row => new Transaction(row));
  }

  async update(updateData) {
    const { description, amount, transaction_type, transaction_date, category_id } = updateData;
    
    if (description) this.description = description;
    if (amount) {
      if (amount <= 0) {
        throw new Error('Valor deve ser positivo');
      }
      this.amount = amount;
    }
    if (transaction_type) {
      if (!['income', 'expense'].includes(transaction_type)) {
        throw new Error('Tipo de transação deve ser "income" ou "expense"');
      }
      this.transaction_type = transaction_type;
    }
    if (transaction_date) this.transaction_date = transaction_date;
    if (category_id !== undefined) this.category_id = category_id;

    await database.run(
      'UPDATE transactions SET description = ?, amount = ?, transaction_type = ?, transaction_date = ?, category_id = ? WHERE id = ?',
      [this.description, this.amount, this.transaction_type, this.transaction_date, this.category_id, this.id]
    );
  }

  async delete() {
    await database.run('DELETE FROM transactions WHERE id = ?', [this.id]);
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      amount: this.amount,
      transaction_type: this.transaction_type,
      transaction_date: this.transaction_date,
      user_id: this.user_id,
      category_id: this.category_id,
      created_at: this.created_at
    };
  }
}

module.exports = Transaction;

