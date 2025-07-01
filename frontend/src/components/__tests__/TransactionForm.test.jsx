import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionForm from '../TransactionForm';

describe('TransactionForm', () => {
  const mockOnSubmit = jest.fn();
  const mockCategories = [
    { id: 1, name: 'Alimentação' },
    { id: 2, name: 'Transporte' },
    { id: 3, name: 'Lazer' }
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all fields', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Nova Transação')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
    expect(screen.getByLabelText('Data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adicionar Transação' })).toBeInTheDocument();
  });

  it('renders category field when categories are provided', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    expect(screen.getByLabelText('Categoria (opcional)')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
    expect(screen.getByText('Lazer')).toBeInTheDocument();
  });

  it('does not render category field when no categories are provided', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByLabelText('Categoria (opcional)')).not.toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    await user.clear(screen.getByLabelText('Descrição'));
    await user.type(screen.getByLabelText('Descrição'), 'Compra no supermercado');
    
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '150.50');
    
    await user.selectOptions(screen.getByLabelText('Tipo'), 'expense');
    
    await user.clear(screen.getByLabelText('Data'));
    await user.type(screen.getByLabelText('Data'), '2024-01-15');
    
    await user.selectOptions(screen.getByLabelText('Categoria (opcional)'), '1');

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'Compra no supermercado',
        amount: 150.50,
        transaction_type: 'expense',
        transaction_date: '2024-01-15',
        category_id: '1'
      });
    });
  });

  it('shows validation error for empty description', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid amount', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Descrição'), 'Test transaction');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '0');

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(screen.getByText('Valor deve ser maior que zero')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for empty amount', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText('Descrição'), 'Test transaction');
    await user.clear(screen.getByLabelText('Valor'));

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(screen.getByText('Valor deve ser maior que zero')).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // Trigger validation error
    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));
    
    await waitFor(() => {
      expect(screen.getByText('Descrição é obrigatória')).toBeInTheDocument();
    });

    // Start typing to clear error
    await user.type(screen.getByLabelText('Descrição'), 'Test');
    
    await waitFor(() => {
      expect(screen.queryByText('Descrição é obrigatória')).not.toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const descriptionInput = screen.getByLabelText('Descrição');
    const amountInput = screen.getByLabelText('Valor');

    await user.type(descriptionInput, 'Test transaction');
    await user.type(amountInput, '100');

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(descriptionInput.value).toBe('');
      expect(amountInput.value).toBe('');
    });
  });

  it('handles category selection correctly', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    await user.type(screen.getByLabelText('Descrição'), 'Almoço');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '25.50');
    await user.selectOptions(screen.getByLabelText('Categoria (opcional)'), '1');

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          category_id: '1'
        })
      );
    });
  });

  it('handles no category selection correctly', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} categories={mockCategories} />);

    await user.type(screen.getByLabelText('Descrição'), 'Transação sem categoria');
    await user.clear(screen.getByLabelText('Valor'));
    await user.type(screen.getByLabelText('Valor'), '50');

    await user.click(screen.getByRole('button', { name: 'Adicionar Transação' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          category_id: null
        })
      );
    });
  });

  it('defaults to expense transaction type', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const typeSelect = screen.getByLabelText('Tipo');
    expect(typeSelect.value).toBe('expense');
  });

  it('defaults to current date', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    const dateInput = screen.getByLabelText('Data');
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput.value).toBe(today);
  });
});

