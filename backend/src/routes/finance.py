"""
Rotas para o sistema financeiro.
"""

from datetime import date, datetime

from flask import Blueprint, jsonify, request
from sqlalchemy import extract, func

from src.models.finance import Budget, Category, Transaction, User, db

finance_bp = Blueprint("finance", __name__)


# ===== ROTAS DE USUÁRIOS =====


@finance_bp.route("/users", methods=["POST"])
def create_user():
    """Cria um novo usuário."""
    try:
        data = request.get_json()

        # Validações
        if (
            not data
            or not data.get("username")
            or not data.get("email")
            or not data.get("password")
        ):
            return (
                jsonify({"error": "Username, email e password são obrigatórios"}),
                400,
            )

        # Verifica se usuário já existe
        if User.query.filter_by(username=data["username"]).first():
            return jsonify({"error": "Username já existe"}), 400

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Email já existe"}), 400

        # Cria usuário
        user = User(username=data["username"], email=data["email"])
        user.set_password(data["password"])

        db.session.add(user)
        db.session.commit()

        return (
            jsonify({"message": "Usuário criado com sucesso", "user": user.to_dict()}),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """Obtém um usuário por ID."""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())


@finance_bp.route("/users", methods=["GET"])
def get_users():
    """Lista todos os usuários."""
    users = User.query.filter_by(is_active=True).all()
    return jsonify([user.to_dict() for user in users])


# ===== ROTAS DE CATEGORIAS =====


@finance_bp.route("/categories", methods=["POST"])
def create_category():
    """Cria uma nova categoria."""
    try:
        data = request.get_json()

        # Validações
        if not data or not data.get("name") or not data.get("user_id"):
            return jsonify({"error": "Nome e user_id são obrigatórios"}), 400

        # Verifica se usuário existe
        user = User.query.get(data["user_id"])
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Cria categoria
        category = Category(
            name=data["name"],
            description=data.get("description", ""),
            color=data.get("color", "#007BFF"),
            user_id=data["user_id"],
        )

        db.session.add(category)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Categoria criada com sucesso",
                    "category": category.to_dict(),
                }
            ),
            201,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/categories/<int:user_id>", methods=["GET"])
def get_categories_by_user(user_id):
    """Lista categorias de um usuário."""
    categories = Category.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify([category.to_dict() for category in categories])


@finance_bp.route("/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    """Atualiza uma categoria."""
    try:
        category = Category.query.get_or_404(category_id)
        data = request.get_json()

        if data.get("name"):
            category.name = data["name"]
        if data.get("description"):
            category.description = data["description"]
        if data.get("color"):
            category.color = data["color"]

        db.session.commit()

        return jsonify(
            {
                "message": "Categoria atualizada com sucesso",
                "category": category.to_dict(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    """Remove uma categoria (soft delete)."""
    try:
        category = Category.query.get_or_404(category_id)
        category.is_active = False
        db.session.commit()

        return jsonify({"message": "Categoria removida com sucesso"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


# ===== ROTAS DE TRANSAÇÕES =====


@finance_bp.route("/transactions", methods=["POST"])
def create_transaction():
    """Cria uma nova transação."""
    try:
        data = request.get_json()

        # Validações
        required_fields = ["description", "amount", "transaction_type", "user_id"]
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({"error": f"{field} é obrigatório"}), 400

        if data["transaction_type"] not in Transaction.TRANSACTION_TYPES:
            return jsonify({"error": "Tipo de transação inválido"}), 400

        # Verifica se usuário existe
        user = User.query.get(data["user_id"])
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Verifica se categoria existe (se fornecida)
        if data.get("category_id"):
            category = Category.query.get(data["category_id"])
            if not category or category.user_id != data["user_id"]:
                return (
                    jsonify(
                        {"error": "Categoria não encontrada ou não pertence ao usuário"}
                    ),
                    404,
                )

        # Cria transação
        transaction = Transaction(
            description=data["description"],
            amount=data["amount"],
            transaction_type=data["transaction_type"],
            user_id=data["user_id"],
            category_id=data.get("category_id"),
            transaction_date=(
                datetime.strptime(data["transaction_date"], "%Y-%m-%d").date()
                if data.get("transaction_date")
                else date.today()
            ),
        )

        transaction.validate_amount()

        db.session.add(transaction)
        db.session.commit()

        return (
            jsonify(
                {
                    "message": "Transação criada com sucesso",
                    "transaction": transaction.to_dict(),
                }
            ),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/transactions/<int:user_id>", methods=["GET"])
def get_transactions_by_user(user_id):
    """Lista transações de um usuário."""
    # Parâmetros de filtro
    transaction_type = request.args.get("type")
    category_id = request.args.get("category_id")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Transaction.query.filter_by(user_id=user_id)

    if transaction_type:
        query = query.filter_by(transaction_type=transaction_type)

    if category_id:
        query = query.filter_by(category_id=category_id)

    if start_date:
        query = query.filter(
            Transaction.transaction_date
            >= datetime.strptime(start_date, "%Y-%m-%d").date()
        )

    if end_date:
        query = query.filter(
            Transaction.transaction_date
            <= datetime.strptime(end_date, "%Y-%m-%d").date()
        )

    transactions = query.order_by(Transaction.transaction_date.desc()).all()
    return jsonify([transaction.to_dict() for transaction in transactions])


@finance_bp.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    """Atualiza uma transação."""
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        data = request.get_json()

        if data.get("description"):
            transaction.description = data["description"]
        if data.get("amount"):
            transaction.amount = data["amount"]
            transaction.validate_amount()
        if (
            data.get("transaction_type")
            and data["transaction_type"] in Transaction.TRANSACTION_TYPES
        ):
            transaction.transaction_type = data["transaction_type"]
        if data.get("category_id"):
            category = Category.query.get(data["category_id"])
            if category and category.user_id == transaction.user_id:
                transaction.category_id = data["category_id"]
        if data.get("transaction_date"):
            transaction.transaction_date = datetime.strptime(
                data["transaction_date"], "%Y-%m-%d"
            ).date()

        transaction.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(
            {
                "message": "Transação atualizada com sucesso",
                "transaction": transaction.to_dict(),
            }
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    """Remove uma transação."""
    try:
        transaction = Transaction.query.get_or_404(transaction_id)
        db.session.delete(transaction)
        db.session.commit()

        return jsonify({"message": "Transação removida com sucesso"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


# ===== ROTAS DE ORÇAMENTOS =====


@finance_bp.route("/budgets", methods=["POST"])
def create_budget():
    """Cria um novo orçamento."""
    try:
        data = request.get_json()

        # Validações
        required_fields = ["name", "amount", "period_start", "period_end", "user_id"]
        for field in required_fields:
            if not data or not data.get(field):
                return jsonify({"error": f"{field} é obrigatório"}), 400

        # Verifica se usuário existe
        user = User.query.get(data["user_id"])
        if not user:
            return jsonify({"error": "Usuário não encontrado"}), 404

        # Cria orçamento
        budget = Budget(
            name=data["name"],
            amount=data["amount"],
            period_start=datetime.strptime(data["period_start"], "%Y-%m-%d").date(),
            period_end=datetime.strptime(data["period_end"], "%Y-%m-%d").date(),
            user_id=data["user_id"],
            category_id=data.get("category_id"),
        )

        budget.validate_period()
        budget.validate_amount()

        db.session.add(budget)
        db.session.commit()

        return (
            jsonify(
                {"message": "Orçamento criado com sucesso", "budget": budget.to_dict()}
            ),
            201,
        )

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/budgets/<int:user_id>", methods=["GET"])
def get_budgets_by_user(user_id):
    """Lista orçamentos de um usuário."""
    budgets = Budget.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify([budget.to_dict() for budget in budgets])


# ===== ROTAS DE RELATÓRIOS =====


@finance_bp.route("/reports/summary/<int:user_id>", methods=["GET"])
def get_financial_summary(user_id):
    """Obtém resumo financeiro do usuário."""
    try:
        # Parâmetros de período
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")

        query = Transaction.query.filter_by(user_id=user_id)

        if start_date:
            query = query.filter(
                Transaction.transaction_date
                >= datetime.strptime(start_date, "%Y-%m-%d").date()
            )

        if end_date:
            query = query.filter(
                Transaction.transaction_date
                <= datetime.strptime(end_date, "%Y-%m-%d").date()
            )

        transactions = query.all()

        # Calcula totais
        total_income = sum(
            float(t.amount) for t in transactions if t.transaction_type == "income"
        )
        total_expense = sum(
            float(t.amount) for t in transactions if t.transaction_type == "expense"
        )
        balance = total_income - total_expense

        # Gastos por categoria
        expenses_by_category = {}
        for t in transactions:
            if t.transaction_type == "expense" and t.category:
                category_name = t.category.name
                if category_name not in expenses_by_category:
                    expenses_by_category[category_name] = 0
                expenses_by_category[category_name] += float(t.amount)

        return jsonify(
            {
                "total_income": total_income,
                "total_expense": total_expense,
                "balance": balance,
                "expenses_by_category": expenses_by_category,
                "transaction_count": len(transactions),
            }
        )

    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500


@finance_bp.route("/reports/monthly/<int:user_id>", methods=["GET"])
def get_monthly_report(user_id):
    """Obtém relatório mensal do usuário."""
    try:
        year = request.args.get("year", datetime.now().year, type=int)

        # Consulta transações agrupadas por mês
        monthly_data = (
            db.session.query(
                extract("month", Transaction.transaction_date).label("month"),
                Transaction.transaction_type,
                func.sum(Transaction.amount).label("total"),
            )
            .filter(
                Transaction.user_id == user_id,
                extract("year", Transaction.transaction_date) == year,
            )
            .group_by(
                extract("month", Transaction.transaction_date),
                Transaction.transaction_type,
            )
            .all()
        )

        # Organiza dados por mês
        monthly_summary = {}
        for month in range(1, 13):
            monthly_summary[month] = {
                "month": month,
                "income": 0,
                "expense": 0,
                "balance": 0,
            }

        for data in monthly_data:
            month = int(data.month)
            if data.transaction_type == "income":
                monthly_summary[month]["income"] = float(data.total)
            else:
                monthly_summary[month]["expense"] = float(data.total)

        # Calcula saldo
        for month_data in monthly_summary.values():
            month_data["balance"] = month_data["income"] - month_data["expense"]

        return jsonify(list(monthly_summary.values()))

    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500
