import React from 'react';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

interface BudgetMetricsProps {
  totalBudget: number;
  consumedBudget: number;
  consumptionRate: number;
  currency: string;
}

export const BudgetMetrics: React.FC<BudgetMetricsProps> = ({
  totalBudget,
  consumedBudget,
  consumptionRate,
  currency,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const remainingBudget = totalBudget - consumedBudget;
  const consumptionPercentage = totalBudget > 0 ? (consumedBudget / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={24} className="text-blue-600" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Budget</h3>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity size={24} className="text-orange-600" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Consumed Budget</h3>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(consumedBudget)}</p>
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{consumptionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(consumptionPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Consumption Rate</h3>
        <p className="text-2xl font-bold text-gray-900">{consumptionRate.toFixed(1)}%</p>
        <p className="text-sm text-gray-600 mt-2">
          Remaining: {formatCurrency(remainingBudget)}
        </p>
      </div>
    </div>
  );
};
