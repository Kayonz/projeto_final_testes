const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Criar transação
router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json({
      message: 'Transação criada com sucesso',
      transaction: transaction.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obter transações por usuário
router.get('/user/:user_id', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const transactions = await Transaction.findByUserId(
      req.params.user_id, 
      parseInt(limit), 
      parseInt(offset)
    );
    res.json(transactions.map(t => t.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter transações por período
router.get('/user/:user_id/period', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date e end_date são obrigatórios' });
    }

    const transactions = await Transaction.findByUserIdAndDateRange(
      req.params.user_id,
      start_date,
      end_date
    );
    res.json(transactions.map(t => t.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter transação por ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    res.json(transaction.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar transação
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.update(req.body);
    res.json({
      message: 'Transação atualizada com sucesso',
      transaction: transaction.toJSON()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.delete();
    res.json({ message: 'Transação removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

