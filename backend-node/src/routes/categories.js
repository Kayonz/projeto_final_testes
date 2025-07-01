const express = require('express');
const Category = require('../models/Category');
const router = express.Router();

// Criar categoria
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      message: 'Categoria criada com sucesso',
      category: category.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter categorias por usuário
router.get('/user/:user_id', async (req, res) => {
  try {
    const categories = await Category.findByUserId(req.params.user_id);
    res.json(categories.map(cat => cat.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    res.json(category.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await category.update(req.body);
    res.json({
      message: 'Categoria atualizada com sucesso',
      category: category.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar categoria (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    await category.delete();
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

