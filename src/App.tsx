import React, { useState, useEffect } from 'react';
import { BudgetParams, IterationData, AppState } from './types/budget';
import { BudgetParameters } from './components/BudgetParameters';
import { IterationsManager } from './components/IterationsManager';
import { BudgetChart } from './components/BudgetChart';
import { BudgetMetrics } from './components/BudgetMetrics';
import { calculateChartData, calculateBudgetMetrics } from './utils/calculations';
import {
  exportBudgetParamsToCSV,
  importBudgetParamsFromCSV,
  exportIterationsToCSV,
  importIterationsFromCSV,
} from './utils/csvUtils';
import { exportChartToPNG, exportChartToPDF } from './utils/exportUtils';
import { BarChart3 } from 'lucide-react';

const STORAGE_KEY = 'budget-analyst-state';

const defaultBudgetParams: BudgetParams = {
  costPerHour: 50,
  budgetSize: 100000,
  teamSize: 5,
  workingDaysPerIteration: 10,
  currency: 'USD',
};

const defaultChartVisibility = {
  iterationCost: true,
  cumulativeStandard: true,
  cumulativeActual: true,
};

function App() {
  const [budgetParams, setBudgetParams] = useState<BudgetParams>(defaultBudgetParams);
  const [iterations, setIterations] = useState<IterationData[]>([]);
  const [chartVisibility, setChartVisibility] = useState(defaultChartVisibility);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: AppState = JSON.parse(saved);
        setBudgetParams(state.budgetParams);
        setIterations(state.iterations);
        if (state.chartVisibility) {
          setChartVisibility(state.chartVisibility);
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    const state: AppState = {
      budgetParams,
      iterations,
      chartVisibility,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [budgetParams, iterations, chartVisibility]);

  const handleImportBudgetParams = (file: File) => {
    importBudgetParamsFromCSV(
      file,
      (params) => {
        setBudgetParams(params);
        alert('Budget parameters imported successfully');
      },
      (error) => {
        alert(error);
      }
    );
  };

  const handleImportIterations = (file: File) => {
    importIterationsFromCSV(
      file,
      (newIterations) => {
        setIterations(newIterations);
        alert('Iterations imported successfully');
      },
      (error) => {
        alert(error);
      }
    );
  };

  const handleToggleChartVisibility = (key: keyof typeof chartVisibility) => {
    setChartVisibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentIterationIndex = iterations.findIndex((it) => it.isCurrent);
  const iterationsForMetrics = currentIterationIndex >= 0
    ? iterations.slice(0, currentIterationIndex + 1)
    : iterations;

  const chartData = calculateChartData(
    iterations,
    budgetParams,
    currentIterationIndex >= 0 ? currentIterationIndex : iterations.length - 1
  );
  const metrics = calculateBudgetMetrics(iterationsForMetrics, budgetParams);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Budget Analyst</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track and visualize project budget consumption across iterations
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <BudgetParameters
            params={budgetParams}
            onChange={setBudgetParams}
            onImportCSV={handleImportBudgetParams}
            onExportCSV={() => exportBudgetParamsToCSV(budgetParams)}
          />

          <IterationsManager
            iterations={iterations}
            budgetParams={budgetParams}
            onChange={setIterations}
            onImportCSV={handleImportIterations}
            onExportCSV={() => exportIterationsToCSV(iterations)}
          />

          {iterations.length > 0 && (
            <>
              <BudgetMetrics
                totalBudget={metrics.totalBudget}
                consumedBudget={metrics.consumedBudget}
                consumptionRate={metrics.consumptionRate}
                currency={budgetParams.currency}
              />

              <BudgetChart
                data={chartData}
                visibility={chartVisibility}
                currency={budgetParams.currency}
                onToggleVisibility={handleToggleChartVisibility}
                onExportPNG={exportChartToPNG}
                onExportPDF={exportChartToPDF}
              />
            </>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Budget Analyst - Project Budget Management Tool
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
