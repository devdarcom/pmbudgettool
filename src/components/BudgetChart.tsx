import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { ChartData } from '../types/budget';
import { Download, FileText } from 'lucide-react';

interface BudgetChartProps {
  data: ChartData[];
  visibility: {
    iterationCost: boolean;
    cumulativeStandard: boolean;
    cumulativeActual: boolean;
  };
  currency: string;
  onToggleVisibility: (key: keyof BudgetChartProps['visibility']) => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
}

export const BudgetChart: React.FC<BudgetChartProps> = ({
  data,
  visibility,
  currency,
  onToggleVisibility,
  onExportPNG,
  onExportPDF,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Budget Visualization</h2>
        <div className="flex gap-2">
          <button
            onClick={onExportPNG}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export PNG
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visibility.iterationCost}
            onChange={() => onToggleVisibility('iterationCost')}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Iteration Cost (Bar)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visibility.cumulativeStandard}
            onChange={() => onToggleVisibility('cumulativeStandard')}
            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Cumulative Standard (Line)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visibility.cumulativeActual}
            onChange={() => onToggleVisibility('cumulativeActual')}
            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Cumulative Actual (Line)</span>
        </label>
      </div>

      <div id="budget-chart" className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 100, left: 80, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {visibility.iterationCost && (
              <Bar
                dataKey="iterationCost"
                fill="#3b82f6"
                name="Iteration Cost"
                radius={[4, 4, 0, 0]}
              />
            )}
            {visibility.cumulativeStandard && (
              <Line
                type="monotone"
                dataKey="cumulativeStandard"
                stroke="#10b981"
                strokeWidth={2}
                name="Cumulative Standard"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {visibility.cumulativeActual && (
              <Line
                type="monotone"
                dataKey="cumulativeActual"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Cumulative Actual"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            <ReferenceLine
              y={data[0]?.budgetCap || 0}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: 'Budget Cap',
                position: 'insideTopLeft',
                fill: '#ef4444',
                fontSize: 12,
                fontWeight: 600,
                offset: 10,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
