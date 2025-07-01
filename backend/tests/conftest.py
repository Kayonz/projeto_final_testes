"""
Configurações para os testes do sistema financeiro.
"""
import os
import sys
import pytest
import tempfile
from datetime import datetime, date

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models.finance import db, User, Category, Transaction, Budget


@pytest.fixture
def app():
    """Fixture que cria uma aplicação Flask para testes."""
    from src.main import app
    
    # Configurações para teste
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Fixture que cria um cliente de teste Flask."""
    return app.test_client()


@pytest.fixture
def sample_user(app):
    """Fixture que cria um usuário de exemplo."""
    with app.app_context():
        user = User(
            username='testuser',
            email='test@example.com'
        )
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def sample_category(app, sample_user):
    """Fixture que cria uma categoria de exemplo."""
    with app.app_context():
        category = Category(
            name='Alimentação',
            description='Gastos com comida',
            color='#FF5722',
            user_id=sample_user.id
        )
        db.session.add(category)
        db.session.commit()
        return category


@pytest.fixture
def sample_transaction(app, sample_user, sample_category):
    """Fixture que cria uma transação de exemplo."""
    with app.app_context():
        transaction = Transaction(
            description='Almoço no restaurante',
            amount=25.50,
            transaction_type='expense',
            user_id=sample_user.id,
            category_id=sample_category.id,
            transaction_date=date.today()
        )
        db.session.add(transaction)
        db.session.commit()
        return transaction


@pytest.fixture
def sample_budget(app, sample_user, sample_category):
    """Fixture que cria um orçamento de exemplo."""
    with app.app_context():
        budget = Budget(
            name='Orçamento Alimentação Janeiro',
            amount=500.00,
            period_start=date(2025, 1, 1),
            period_end=date(2025, 1, 31),
            user_id=sample_user.id,
            category_id=sample_category.id
        )
        db.session.add(budget)
        db.session.commit()
        return budget

