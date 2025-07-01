const database = require('../database/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.color = data.color;
    this.user_id = data.user_id;
    this.created_at = data.created_at;
    this.is_active = data.is_active;
  }

  static async create(categoryData) {
    const { name, color = '#3B82F6', user_id } = categoryData;
    
    if (!name || !user_id) {
      throw new Error('Nome e user_id são obrigatórios');
    }

    const result = await database.run(
      'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
      [name, color, user_id]
    );

    return Category.findById(result.id);
  }

  static async findById(id) {
    const row = await database.get('SELECT * FROM categories WHERE id = ? AND is_active = 1', [id]);
    return row ? new Category(row) : null;
  }

  static async findByUserId(user_id) {
    const rows = await database.all('SELECT * FROM categories WHERE user_id = ? AND is_active = 1', [user_id]);
    return rows.map(row => new Category(row));
  }

  async update(updateData) {
    const { name, color } = updateData;
    
    if (name) this.name = name;
    if (color) this.color = color;

    await database.run(
      'UPDATE categories SET name = ?, color = ? WHERE id = ?',
      [this.name, this.color, this.id]
    );
  }

  async delete() {
    await database.run('UPDATE categories SET is_active = 0 WHERE id = ?', [this.id]);
    this.is_active = 0;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      user_id: this.user_id,
      created_at: this.created_at,
      is_active: this.is_active
    };
  }
}

module.exports = Category;

