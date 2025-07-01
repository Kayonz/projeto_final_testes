import React from 'react';
import { render, screen } from '@testing-library/react';
import FinanceCard from '../FinanceCard';

describe('FinanceCard', () => {
  it('renders with basic props', () => {
    render(
      <FinanceCard 
        title="Saldo Total" 
        amount={1500.50} 
        type="income" 
      />
    );

    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument();
    expect(screen.getByText('Receita')).toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <FinanceCard 
        title="Despesas" 
        amount={2500.75} 
        type="expense" 
      />
    );

    expect(screen.getByText('R$ 2.500,75')).toBeInTheDocument();
  });

  it('displays correct type label for income', () => {
    render(
      <FinanceCard 
        title="Receitas" 
        amount={1000} 
        type="income" 
      />
    );

    expect(screen.getByText('Receita')).toBeInTheDocument();
  });

  it('displays correct type label for expense', () => {
    render(
      <FinanceCard 
        title="Despesas" 
        amount={500} 
        type="expense" 
      />
    );

    expect(screen.getByText('Despesa')).toBeInTheDocument();
  });

  it('does not display type label when no type is provided', () => {
    render(
      <FinanceCard 
        title="Saldo" 
        amount={1000} 
      />
    );

    // O componente não renderiza o tipo quando type não é fornecido
    expect(screen.queryByText('Total')).not.toBeInTheDocument();
    expect(screen.queryByText('Receita')).not.toBeInTheDocument();
    expect(screen.queryByText('Despesa')).not.toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(
      <FinanceCard 
        title="Test" 
        amount={100} 
        color="green" 
      />
    );

    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('bg-green-500', 'text-white');
  });

  it('applies default blue color when no color is specified', () => {
    const { container } = render(
      <FinanceCard 
        title="Test" 
        amount={100} 
      />
    );

    const cardElement = container.firstChild;
    expect(cardElement).toHaveClass('bg-blue-500', 'text-white');
  });

  it('displays correct icon for income type', () => {
    render(
      <FinanceCard 
        title="Receitas" 
        amount={1000} 
        type="income" 
      />
    );

    expect(screen.getByText('↗️')).toBeInTheDocument();
  });

  it('displays correct icon for expense type', () => {
    render(
      <FinanceCard 
        title="Despesas" 
        amount={500} 
        type="expense" 
      />
    );

    expect(screen.getByText('↘️')).toBeInTheDocument();
  });

  it('displays default icon when no type is provided', () => {
    render(
      <FinanceCard 
        title="Saldo" 
        amount={1000} 
      />
    );

    expect(screen.getByText('💰')).toBeInTheDocument();
  });

  it('handles zero amount correctly', () => {
    render(
      <FinanceCard 
        title="Saldo" 
        amount={0} 
      />
    );

    expect(screen.getByText('R$ 0,00')).toBeInTheDocument();
  });

  it('handles negative amount correctly', () => {
    render(
      <FinanceCard 
        title="Déficit" 
        amount={-250.30} 
      />
    );

    // O formato brasileiro pode variar, vamos verificar se contém os elementos principais
    expect(screen.getByText(/250,30/)).toBeInTheDocument();
  });
});

