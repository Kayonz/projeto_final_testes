import React from 'react';

const FinanceCard = ({ title, amount, type, color = 'blue' }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      red: 'bg-red-500 text-white',
      gray: 'bg-gray-500 text-white'
    };
    return colors[color] || colors.blue;
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'income':
        return '↗️';
      case 'expense':
        return '↘️';
      default:
        return '💰';
    }
  };

  return (
    <div className={`p-6 rounded-lg shadow-md ${getColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold mt-2">{formatCurrency(amount)}</p>
        </div>
        <div className="text-3xl">
          {getTypeIcon()}
        </div>
      </div>
      {type && (
        <div className="mt-4">
          <span className="text-sm opacity-75">
            {type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Total'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FinanceCard;

