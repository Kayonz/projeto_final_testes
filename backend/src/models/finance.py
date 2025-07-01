"""
Modelos de dados para o sistema financeiro.
"""

from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


class User(db.Model):
    """Modelo de usuário do sistema."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relacionamentos
    transactions = db.relationship(
        "Transaction", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    categories = db.relationship(
        "Category", backref="user", lazy=True, cascade="all, delete-orphan"
    )
    budgets = db.relationship(
        "Budget", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password):
        """Define a senha do usuário com hash."""
        if not password or len(password) < 6:
            raise ValueError("Senha deve ter pelo menos 6 caracteres")
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verifica se a senha está correta."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Converte o usuário para dicionário."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }

    def __repr__(self):
        return f"<User {self.username}>"


class Category(db.Model):
    """Modelo de categoria de transações."""

    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    color = db.Column(db.String(7), default="#007BFF")  # Cor em hexadecimal
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relacionamentos
    transactions = db.relationship("Transaction", backref="category", lazy=True)

    def to_dict(self):
        """Converte a categoria para dicionário."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }

    def __repr__(self):
        return f"<Category {self.name}>"


class Transaction(db.Model):
    """Modelo de transação financeira."""

    __tablename__ = "transactions"

    TRANSACTION_TYPES = ["income", "expense"]

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    transaction_type = db.Column(
        db.Enum(*TRANSACTION_TYPES, name="transaction_types"), nullable=False
    )
    transaction_date = db.Column(
        db.Date, nullable=False, default=datetime.utcnow().date()
    )
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def validate_amount(self):
        """Valida se o valor da transação é positivo."""
        if self.amount <= 0:
            raise ValueError("O valor da transação deve ser positivo")

    def to_dict(self):
        """Converte a transação para dicionário."""
        return {
            "id": self.id,
            "description": self.description,
            "amount": float(self.amount),
            "transaction_type": self.transaction_type,
            "transaction_date": (
                self.transaction_date.isoformat() if self.transaction_date else None
            ),
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Transaction {self.description}: {self.amount}>"


class Budget(db.Model):
    """Modelo de orçamento."""

    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    period_start = db.Column(db.Date, nullable=False)
    period_end = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def validate_period(self):
        """Valida se o período do orçamento é válido."""
        if self.period_start >= self.period_end:
            raise ValueError("A data de início deve ser anterior à data de fim")

    def validate_amount(self):
        """Valida se o valor do orçamento é positivo."""
        if self.amount <= 0:
            raise ValueError("O valor do orçamento deve ser positivo")

    def get_spent_amount(self):
        """Calcula o valor gasto no período do orçamento."""
        query = Transaction.query.filter(
            Transaction.user_id == self.user_id,
            Transaction.transaction_type == "expense",
            Transaction.transaction_date >= self.period_start,
            Transaction.transaction_date <= self.period_end,
        )

        if self.category_id:
            query = query.filter(Transaction.category_id == self.category_id)

        transactions = query.all()
        return sum(float(t.amount) for t in transactions)

    def get_remaining_amount(self):
        """Calcula o valor restante do orçamento."""
        return float(self.amount) - self.get_spent_amount()

    def to_dict(self):
        """Converte o orçamento para dicionário."""
        spent = self.get_spent_amount()
        remaining = self.get_remaining_amount()

        return {
            "id": self.id,
            "name": self.name,
            "amount": float(self.amount),
            "spent_amount": spent,
            "remaining_amount": remaining,
            "percentage_used": (
                (spent / float(self.amount)) * 100 if self.amount > 0 else 0
            ),
            "period_start": (
                self.period_start.isoformat() if self.period_start else None
            ),
            "period_end": self.period_end.isoformat() if self.period_end else None,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_active": self.is_active,
        }

    def __repr__(self):
        return f"<Budget {self.name}: {self.amount}>"
