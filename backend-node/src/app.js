const express = require('express');
const cors = require('cors');
const database = require('./database/database');

// Importar rotas
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const transactionsRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de log para desenvolvimento
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Finance API'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Inicializar servidor
async function startServer() {
  try {
    await database.connect();
    
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/health`);
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\\nRecebido SIGINT. Fechando servidor graciosamente...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\\nRecebido SIGTERM. Fechando servidor graciosamente...');
  await database.close();
  process.exit(0);
});

// Inicializar apenas se não estiver em modo de teste
if (require.main === module) {
  startServer();
}

module.exports = app;

