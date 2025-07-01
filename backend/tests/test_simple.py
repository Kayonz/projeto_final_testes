"""
Testes unitários simplificados para o sistema financeiro.
"""
import pytest
import os
import sys
from datetime import datetime, date

# Adiciona o diretório src ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Cria uma instância separada do SQLAlchemy para testes
test_db = SQLAlchemy()


# Modelos simplificados para teste
class User(test_db.Model):
    __tablename__ = 'users'
    id = test_db.Column(test_db.Integer, primary_key=True)
    username = test_db.Column(test_db.String(80), unique=True, nullable=False)
    email = test_db.Column(test_db.String(120), unique=True, nullable=False)
    password_hash = test_db.Column(test_db.String(255), nullable=False)
    is_active = test_db.Column(test_db.Boolean, default=True)
    
    def set_password(self, password):
        if not password or len(password) < 6:
            raise ValueError("Senha deve ter pelo menos 6 caracteres")
        from werkzeug.security import generate_password_hash
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_active': self.is_active
        }


class Category(test_db.Model):
    __tablename__ = 'categories'
    id = test_db.Column(test_db.Integer, primary_key=True)
    name = test_db.Column(test_db.String(100), nullable=False)
    description = test_db.Column(test_db.Text)
    color = test_db.Column(test_db.String(7), default='#007BFF')
    user_id = test_db.Column(test_db.Integer, test_db.ForeignKey('users.id'), nullable=False)
    is_active = test_db.Column(test_db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'is_active': self.is_active
        }


@pytest.fixture
def app():
    """Cria uma aplicação Flask para testes."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    test_db.init_app(app)
    
    with app.app_context():
        test_db.create_all()
        yield app
        test_db.drop_all()


@pytest.fixture
def client(app):
    """Cria um cliente de teste Flask."""
    return app.test_client()


class TestUserModel:
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
    
    def test_user_to_dict(self, app):
        """Testa a conversão do usuário para dicionário."""
        with app.app_context():
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            test_db.session.add(user)
            test_db.session.commit()
            
            user_dict = user.to_dict()
            
            assert 'id' in user_dict
            assert user_dict['username'] == 'testuser'
            assert user_dict['email'] == 'test@example.com'
            assert 'password_hash' not in user_dict
            assert user_dict['is_active'] is True


class TestCategoryModel:
    """Testes para o modelo Category."""
    
    def test_create_category(self, app):
        """Testa a criação de uma categoria."""
        with app.app_context():
            # Cria usuário primeiro
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            test_db.session.add(user)
            test_db.session.commit()
            
            # Cria categoria
            category = Category(
                name='Transporte',
                description='Gastos com transporte',
                color='#2196F3',
                user_id=user.id
            )
            test_db.session.add(category)
            test_db.session.commit()
            
            assert category.name == 'Transporte'
            assert category.description == 'Gastos com transporte'
            assert category.color == '#2196F3'
            assert category.user_id == user.id
            assert category.is_active is True
    
    def test_category_to_dict(self, app):
        """Testa a conversão da categoria para dicionário."""
        with app.app_context():
            # Cria usuário primeiro
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            test_db.session.add(user)
            test_db.session.commit()
            
            # Cria categoria
            category = Category(
                name='Alimentação',
                description='Gastos com comida',
                color='#FF5722',
                user_id=user.id
            )
            test_db.session.add(category)
            test_db.session.commit()
            
            category_dict = category.to_dict()
            
            assert 'id' in category_dict
            assert category_dict['name'] == 'Alimentação'
            assert category_dict['description'] == 'Gastos com comida'
            assert category_dict['color'] == '#FF5722'
            assert category_dict['is_active'] is True


class TestValidations:
    """Testes para validações de negócio."""
    
    def test_password_strength(self, app):
        """Testa a validação de força da senha."""
        with app.app_context():
            user = User(username='testuser', email='test@example.com')
            
            # Senhas válidas
            valid_passwords = ['password123', 'mypassword', '123456']
            for password in valid_passwords:
                user.set_password(password)
                assert user.check_password(password)
            
            # Senhas inválidas
            invalid_passwords = ['123', '', '12345']
            for password in invalid_passwords:
                with pytest.raises(ValueError):
                    user.set_password(password)
    
    def test_user_uniqueness(self, app):
        """Testa a unicidade de usuários."""
        with app.app_context():
            user1 = User(username='testuser', email='test1@example.com')
            user1.set_password('password123')
            test_db.session.add(user1)
            test_db.session.commit()
            
            # Tenta criar usuário com mesmo username
            user2 = User(username='testuser', email='test2@example.com')
            user2.set_password('password123')
            test_db.session.add(user2)
            
            with pytest.raises(Exception):  # Violação de constraint de unicidade
                test_db.session.commit()


class TestBusinessLogic:
    """Testes para lógica de negócio."""
    
    def test_user_category_relationship(self, app):
        """Testa o relacionamento entre usuário e categorias."""
        with app.app_context():
            # Cria usuário
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            test_db.session.add(user)
            test_db.session.commit()
            
            # Cria categorias para o usuário
            categories = [
                Category(name='Alimentação', user_id=user.id),
                Category(name='Transporte', user_id=user.id),
                Category(name='Lazer', user_id=user.id)
            ]
            
            for category in categories:
                test_db.session.add(category)
            test_db.session.commit()
            
            # Verifica se as categorias foram criadas
            user_categories = Category.query.filter_by(user_id=user.id).all()
            assert len(user_categories) == 3
            
            category_names = [cat.name for cat in user_categories]
            assert 'Alimentação' in category_names
            assert 'Transporte' in category_names
            assert 'Lazer' in category_names
    
    def test_category_soft_delete(self, app):
        """Testa a exclusão lógica de categorias."""
        with app.app_context():
            # Cria usuário
            user = User(username='testuser', email='test@example.com')
            user.set_password('password123')
            test_db.session.add(user)
            test_db.session.commit()
            
            # Cria categoria
            category = Category(name='Teste', user_id=user.id)
            test_db.session.add(category)
            test_db.session.commit()
            
            # Verifica se está ativa
            assert category.is_active is True
            
            # "Remove" a categoria (soft delete)
            category.is_active = False
            test_db.session.commit()
            
            # Verifica se foi marcada como inativa
            assert category.is_active is False
            
            # Verifica se ainda existe no banco
            existing_category = Category.query.get(category.id)
            assert existing_category is not None
            assert existing_category.is_active is False

