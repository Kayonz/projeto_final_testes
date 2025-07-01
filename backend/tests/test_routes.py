"""
Testes de integração para as rotas da API do sistema financeiro.
"""
import json
import pytest
from datetime import date
from src.models.finance import db, User, Category, Transaction, Budget


class TestUserRoutes:
    """Testes para as rotas de usuários."""
    
    def test_create_user_success(self, client):
        """Testa a criação bem-sucedida de um usuário."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/users', 
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 201
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Usuário criado com sucesso'
        assert response_data['user']['username'] == 'newuser'
        assert response_data['user']['email'] == 'newuser@example.com'
    
    def test_create_user_missing_fields(self, client):
        """Testa a criação de usuário com campos obrigatórios faltando."""
        data = {
            'username': 'newuser'
            # email e password faltando
        }
        
        response = client.post('/api/users',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'Username, email e password são obrigatórios' in response_data['error']
    
    def test_create_user_duplicate_username(self, client, sample_user):
        """Testa a criação de usuário com username duplicado."""
        data = {
            'username': 'testuser',  # Mesmo username do sample_user
            'email': 'different@example.com',
            'password': 'password123'
        }
        
        response = client.post('/api/users',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'Username já existe' in response_data['error']
    
    def test_get_user_success(self, client, sample_user):
        """Testa a obtenção de um usuário por ID."""
        response = client.get(f'/api/users/{sample_user.id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['username'] == 'testuser'
        assert response_data['email'] == 'test@example.com'
    
    def test_get_user_not_found(self, client):
        """Testa a obtenção de um usuário inexistente."""
        response = client.get('/api/users/999')
        assert response.status_code == 404
    
    def test_get_users_list(self, client, sample_user):
        """Testa a listagem de usuários."""
        response = client.get('/api/users')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert len(response_data) >= 1
        assert any(user['username'] == 'testuser' for user in response_data)


class TestCategoryRoutes:
    """Testes para as rotas de categorias."""
    
    def test_create_category_success(self, client, sample_user):
        """Testa a criação bem-sucedida de uma categoria."""
        data = {
            'name': 'Transporte',
            'description': 'Gastos com transporte público e combustível',
            'color': '#2196F3',
            'user_id': sample_user.id
        }
        
        response = client.post('/api/categories',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 201
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Categoria criada com sucesso'
        assert response_data['category']['name'] == 'Transporte'
    
    def test_create_category_missing_fields(self, client):
        """Testa a criação de categoria com campos obrigatórios faltando."""
        data = {
            'name': 'Transporte'
            # user_id faltando
        }
        
        response = client.post('/api/categories',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'Nome e user_id são obrigatórios' in response_data['error']
    
    def test_create_category_user_not_found(self, client):
        """Testa a criação de categoria com usuário inexistente."""
        data = {
            'name': 'Transporte',
            'user_id': 999
        }
        
        response = client.post('/api/categories',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 404
        response_data = json.loads(response.data)
        assert 'Usuário não encontrado' in response_data['error']
    
    def test_get_categories_by_user(self, client, sample_category):
        """Testa a listagem de categorias por usuário."""
        response = client.get(f'/api/categories/{sample_category.user_id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert len(response_data) >= 1
        assert any(cat['name'] == 'Alimentação' for cat in response_data)
    
    def test_update_category_success(self, client, sample_category):
        """Testa a atualização bem-sucedida de uma categoria."""
        data = {
            'name': 'Alimentação Atualizada',
            'description': 'Nova descrição'
        }
        
        response = client.put(f'/api/categories/{sample_category.id}',
                            data=json.dumps(data),
                            content_type='application/json')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Categoria atualizada com sucesso'
        assert response_data['category']['name'] == 'Alimentação Atualizada'
    
    def test_delete_category_success(self, client, sample_category):
        """Testa a remoção bem-sucedida de uma categoria."""
        response = client.delete(f'/api/categories/{sample_category.id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Categoria removida com sucesso'


class TestTransactionRoutes:
    """Testes para as rotas de transações."""
    
    def test_create_transaction_success(self, client, sample_user, sample_category):
        """Testa a criação bem-sucedida de uma transação."""
        data = {
            'description': 'Jantar no restaurante',
            'amount': 45.80,
            'transaction_type': 'expense',
            'user_id': sample_user.id,
            'category_id': sample_category.id,
            'transaction_date': '2025-01-20'
        }
        
        response = client.post('/api/transactions',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 201
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Transação criada com sucesso'
        assert response_data['transaction']['description'] == 'Jantar no restaurante'
        assert response_data['transaction']['amount'] == 45.80
    
    def test_create_transaction_missing_fields(self, client):
        """Testa a criação de transação com campos obrigatórios faltando."""
        data = {
            'description': 'Teste'
            # amount, transaction_type, user_id faltando
        }
        
        response = client.post('/api/transactions',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'é obrigatório' in response_data['error']
    
    def test_create_transaction_invalid_type(self, client, sample_user):
        """Testa a criação de transação com tipo inválido."""
        data = {
            'description': 'Teste',
            'amount': 100.00,
            'transaction_type': 'invalid_type',
            'user_id': sample_user.id
        }
        
        response = client.post('/api/transactions',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'Tipo de transação inválido' in response_data['error']
    
    def test_get_transactions_by_user(self, client, sample_transaction):
        """Testa a listagem de transações por usuário."""
        response = client.get(f'/api/transactions/{sample_transaction.user_id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert len(response_data) >= 1
        assert any(t['description'] == 'Almoço no restaurante' for t in response_data)
    
    def test_get_transactions_with_filters(self, client, sample_transaction):
        """Testa a listagem de transações com filtros."""
        response = client.get(f'/api/transactions/{sample_transaction.user_id}?type=expense')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert all(t['transaction_type'] == 'expense' for t in response_data)
    
    def test_update_transaction_success(self, client, sample_transaction):
        """Testa a atualização bem-sucedida de uma transação."""
        data = {
            'description': 'Almoço atualizado',
            'amount': 30.00
        }
        
        response = client.put(f'/api/transactions/{sample_transaction.id}',
                            data=json.dumps(data),
                            content_type='application/json')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Transação atualizada com sucesso'
        assert response_data['transaction']['description'] == 'Almoço atualizado'
        assert response_data['transaction']['amount'] == 30.00
    
    def test_delete_transaction_success(self, client, sample_transaction):
        """Testa a remoção bem-sucedida de uma transação."""
        response = client.delete(f'/api/transactions/{sample_transaction.id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Transação removida com sucesso'


class TestBudgetRoutes:
    """Testes para as rotas de orçamentos."""
    
    def test_create_budget_success(self, client, sample_user, sample_category):
        """Testa a criação bem-sucedida de um orçamento."""
        data = {
            'name': 'Orçamento Transporte Fevereiro',
            'amount': 400.00,
            'period_start': '2025-02-01',
            'period_end': '2025-02-28',
            'user_id': sample_user.id,
            'category_id': sample_category.id
        }
        
        response = client.post('/api/budgets',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 201
        response_data = json.loads(response.data)
        assert response_data['message'] == 'Orçamento criado com sucesso'
        assert response_data['budget']['name'] == 'Orçamento Transporte Fevereiro'
        assert response_data['budget']['amount'] == 400.00
    
    def test_create_budget_missing_fields(self, client):
        """Testa a criação de orçamento com campos obrigatórios faltando."""
        data = {
            'name': 'Orçamento Teste'
            # amount, period_start, period_end, user_id faltando
        }
        
        response = client.post('/api/budgets',
                             data=json.dumps(data),
                             content_type='application/json')
        
        assert response.status_code == 400
        response_data = json.loads(response.data)
        assert 'é obrigatório' in response_data['error']
    
    def test_get_budgets_by_user(self, client, sample_budget):
        """Testa a listagem de orçamentos por usuário."""
        response = client.get(f'/api/budgets/{sample_budget.user_id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert len(response_data) >= 1
        assert any(b['name'] == 'Orçamento Alimentação Janeiro' for b in response_data)


class TestReportRoutes:
    """Testes para as rotas de relatórios."""
    
    def test_get_financial_summary(self, client, sample_user, sample_transaction):
        """Testa a obtenção do resumo financeiro."""
        # Cria uma transação de receita para ter dados mais completos
        income_transaction = Transaction(
            description='Salário',
            amount=2000.00,
            transaction_type='income',
            user_id=sample_user.id,
            transaction_date=date.today()
        )
        db.session.add(income_transaction)
        db.session.commit()
        
        response = client.get(f'/api/reports/summary/{sample_user.id}')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert 'total_income' in response_data
        assert 'total_expense' in response_data
        assert 'balance' in response_data
        assert 'expenses_by_category' in response_data
        assert response_data['total_income'] == 2000.00
        assert response_data['total_expense'] == 25.50
        assert response_data['balance'] == 1974.50
    
    def test_get_monthly_report(self, client, sample_user, sample_transaction):
        """Testa a obtenção do relatório mensal."""
        response = client.get(f'/api/reports/monthly/{sample_user.id}?year=2025')
        
        assert response.status_code == 200
        response_data = json.loads(response.data)
        assert len(response_data) == 12  # 12 meses
        assert all('month' in month_data for month_data in response_data)
        assert all('income' in month_data for month_data in response_data)
        assert all('expense' in month_data for month_data in response_data)
        assert all('balance' in month_data for month_data in response_data)

