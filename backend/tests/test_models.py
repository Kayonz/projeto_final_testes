"""
Testes unitários para os modelos do sistema financeiro.
"""
import pytest
from datetime import datetime, date
from src.models.finance import User, Category, Transaction, Budget, db


class TestUser:
    """Testes para o modelo User."""
    
    def test_create_user(self, app):
        """Testa a criação de um usuário."""
        with app.app_context():
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            
            assert user.username == 'testuser'
            assert user.email == 'test@example.com'
            assert user.password_hash is not None
            assert user.check_password('password123')
            assert not user.check_password('wrongpassword')
    
    def test_user_password_validation(self, app):
        """Testa a validação de senha."""
        with app.app_context():
            user = User(username='testuser', email='test@example.com')
            
            with pytest.raises(ValueError, match="Senha deve ter pelo menos 6 caracteres"):
                user.set_password('123')
            
            with pytest.raises(ValueError, match="Senha deve ter pelo menos 6 caracteres"):
                user.set_password('')
    
    def test_user_to_dict(self, app, sample_user):
        """Testa a conversão do usuário para dicionário."""
        with app.app_context():
            user_dict = sample_user.to_dict()
            
            assert 'id' in user_dict
            assert user_dict['username'] == 'testuser'
            assert user_dict['email'] == 'test@example.com'
            assert 'password_hash' not in user_dict  # Senha não deve aparecer
            assert user_dict['is_active'] is True
    
    def test_user_repr(self, app, sample_user):
        """Testa a representação string do usuário."""
        with app.app_context():
            assert repr(sample_user) == '<User testuser>'


class TestCategory:
    """Testes para o modelo Category."""
    
    def test_create_category(self, app, sample_user):
        """Testa a criação de uma categoria."""
        with app.app_context():
            category = Category(
                name='Transporte',
                description='Gastos com transporte',
                color='#2196F3',
                user_id=sample_user.id
            )
            db.session.add(category)
            db.session.commit()
            
            assert category.name == 'Transporte'
            assert category.description == 'Gastos com transporte'
            assert category.color == '#2196F3'
            assert category.user_id == sample_user.id
            assert category.is_active is True
    
    def test_category_to_dict(self, app, sample_category):
        """Testa a conversão da categoria para dicionário."""
        with app.app_context():
            category_dict = sample_category.to_dict()
            
            assert 'id' in category_dict
            assert category_dict['name'] == 'Alimentação'
            assert category_dict['description'] == 'Gastos com comida'
            assert category_dict['color'] == '#FF5722'
            assert category_dict['is_active'] is True
    
    def test_category_repr(self, app, sample_category):
        """Testa a representação string da categoria."""
        with app.app_context():
            assert repr(sample_category) == '<Category Alimentação>'


class TestTransaction:
    """Testes para o modelo Transaction."""
    
    def test_create_transaction(self, app, sample_user, sample_category):
        """Testa a criação de uma transação."""
        with app.app_context():
            transaction = Transaction(
                description='Compra no supermercado',
                amount=150.75,
                transaction_type='expense',
                user_id=sample_user.id,
                category_id=sample_category.id,
                transaction_date=date(2025, 1, 15)
            )
            db.session.add(transaction)
            db.session.commit()
            
            assert transaction.description == 'Compra no supermercado'
            assert float(transaction.amount) == 150.75
            assert transaction.transaction_type == 'expense'
            assert transaction.user_id == sample_user.id
            assert transaction.category_id == sample_category.id
    
    def test_transaction_amount_validation(self, app, sample_user):
        """Testa a validação do valor da transação."""
        with app.app_context():
            transaction = Transaction(
                description='Teste',
                amount=-50.0,
                transaction_type='expense',
                user_id=sample_user.id
            )
            
            with pytest.raises(ValueError, match="O valor da transação deve ser positivo"):
                transaction.validate_amount()
    
    def test_transaction_to_dict(self, app, sample_transaction):
        """Testa a conversão da transação para dicionário."""
        with app.app_context():
            transaction_dict = sample_transaction.to_dict()
            
            assert 'id' in transaction_dict
            assert transaction_dict['description'] == 'Almoço no restaurante'
            assert transaction_dict['amount'] == 25.50
            assert transaction_dict['transaction_type'] == 'expense'
            assert transaction_dict['category_name'] == 'Alimentação'
    
    def test_transaction_repr(self, app, sample_transaction):
        """Testa a representação string da transação."""
        with app.app_context():
            assert repr(sample_transaction) == '<Transaction Almoço no restaurante: 25.50>'


class TestBudget:
    """Testes para o modelo Budget."""
    
    def test_create_budget(self, app, sample_user, sample_category):
        """Testa a criação de um orçamento."""
        with app.app_context():
            budget = Budget(
                name='Orçamento Transporte',
                amount=300.00,
                period_start=date(2025, 2, 1),
                period_end=date(2025, 2, 28),
                user_id=sample_user.id,
                category_id=sample_category.id
            )
            db.session.add(budget)
            db.session.commit()
            
            assert budget.name == 'Orçamento Transporte'
            assert float(budget.amount) == 300.00
            assert budget.period_start == date(2025, 2, 1)
            assert budget.period_end == date(2025, 2, 28)
            assert budget.is_active is True
    
    def test_budget_period_validation(self, app, sample_user):
        """Testa a validação do período do orçamento."""
        with app.app_context():
            budget = Budget(
                name='Orçamento Inválido',
                amount=100.00,
                period_start=date(2025, 2, 28),
                period_end=date(2025, 2, 1),  # Data fim anterior à data início
                user_id=sample_user.id
            )
            
            with pytest.raises(ValueError, match="A data de início deve ser anterior à data de fim"):
                budget.validate_period()
    
    def test_budget_amount_validation(self, app, sample_user):
        """Testa a validação do valor do orçamento."""
        with app.app_context():
            budget = Budget(
                name='Orçamento Inválido',
                amount=-100.00,
                period_start=date(2025, 2, 1),
                period_end=date(2025, 2, 28),
                user_id=sample_user.id
            )
            
            with pytest.raises(ValueError, match="O valor do orçamento deve ser positivo"):
                budget.validate_amount()
    
    def test_budget_spent_calculation(self, app, sample_budget, sample_user, sample_category):
        """Testa o cálculo do valor gasto no orçamento."""
        with app.app_context():
            # Cria transações no período do orçamento
            transaction1 = Transaction(
                description='Compra 1',
                amount=100.00,
                transaction_type='expense',
                user_id=sample_user.id,
                category_id=sample_category.id,
                transaction_date=date(2025, 1, 15)
            )
            transaction2 = Transaction(
                description='Compra 2',
                amount=50.00,
                transaction_type='expense',
                user_id=sample_user.id,
                category_id=sample_category.id,
                transaction_date=date(2025, 1, 20)
            )
            
            db.session.add_all([transaction1, transaction2])
            db.session.commit()
            
            spent = sample_budget.get_spent_amount()
            remaining = sample_budget.get_remaining_amount()
            
            assert spent == 150.00
            assert remaining == 350.00
    
    def test_budget_to_dict(self, app, sample_budget):
        """Testa a conversão do orçamento para dicionário."""
        with app.app_context():
            budget_dict = sample_budget.to_dict()
            
            assert 'id' in budget_dict
            assert budget_dict['name'] == 'Orçamento Alimentação Janeiro'
            assert budget_dict['amount'] == 500.00
            assert 'spent_amount' in budget_dict
            assert 'remaining_amount' in budget_dict
            assert 'percentage_used' in budget_dict
    
    def test_budget_repr(self, app, sample_budget):
        """Testa a representação string do orçamento."""
        with app.app_context():
            assert repr(sample_budget) == '<Budget Orçamento Alimentação Janeiro: 500.00>'

