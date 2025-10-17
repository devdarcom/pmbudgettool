import Papa from 'papaparse';
import { BudgetParams, IterationData } from '../types/budget';

export const exportBudgetParamsToCSV = (params: BudgetParams) => {
  const csvData = [
    ['Parameter', 'Value'],
    ['Cost per Hour', params.costPerHour.toString()],
    ['Budget Size', params.budgetSize.toString()],
    ['Team Size', params.teamSize.toString()],
    ['Working Days per Iteration', params.workingDaysPerIteration.toString()],
    ['Currency', params.currency],
  ];

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'budget-parameters.csv');
};

export const importBudgetParamsFromCSV = (
  file: File,
  onSuccess: (params: BudgetParams) => void,
  onError: (error: string) => void
) => {
  Papa.parse(file, {
    complete: (results) => {
      try {
        const data = results.data as string[][];
        const params: Partial<BudgetParams> = {};

        for (let i = 1; i < data.length; i++) {
          const [key, value] = data[i];
          if (!key || !value) continue;

          switch (key) {
            case 'Cost per Hour':
              params.costPerHour = parseFloat(value);
              break;
            case 'Budget Size':
              params.budgetSize = parseFloat(value);
              break;
            case 'Team Size':
              params.teamSize = parseInt(value);
              break;
            case 'Working Days per Iteration':
              params.workingDaysPerIteration = parseInt(value);
              break;
            case 'Currency':
              params.currency = value;
              break;
          }
        }

        if (
          params.costPerHour !== undefined &&
          params.budgetSize !== undefined &&
          params.teamSize !== undefined &&
          params.workingDaysPerIteration !== undefined &&
          params.currency
        ) {
          onSuccess(params as BudgetParams);
        } else {
          onError('Invalid CSV format. Missing required parameters.');
        }
      } catch (error) {
        onError('Failed to parse CSV file.');
      }
    },
    error: () => {
      onError('Failed to read CSV file.');
    },
  });
};

export const exportIterationsToCSV = (iterations: IterationData[]) => {
  const csvData = [
    ['Iteration Number', 'Days', 'Team Size', 'Total Hours', 'Is Current'],
    ...iterations.map((it) => [
      it.iterationNumber.toString(),
      it.iterationDays.toString(),
      it.teamSize.toString(),
      (it.totalHours || 0).toString(),
      (it.isCurrent || false).toString(),
    ]),
  ];

  const csv = Papa.unparse(csvData);
  downloadCSV(csv, 'iterations.csv');
};

export const importIterationsFromCSV = (
  file: File,
  onSuccess: (iterations: IterationData[]) => void,
  onError: (error: string) => void
) => {
  Papa.parse(file, {
    complete: (results) => {
      try {
        const data = results.data as string[][];
        const iterations: IterationData[] = [];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row[0]) continue;

          iterations.push({
            iterationNumber: parseInt(row[0]),
            iterationDays: parseInt(row[1]),
            teamSize: parseInt(row[2]),
            totalHours: parseFloat(row[3]),
            isCurrent: row[4] === 'true',
          });
        }

        if (iterations.length > 0) {
          onSuccess(iterations);
        } else {
          onError('No valid iterations found in CSV file.');
        }
      } catch (error) {
        onError('Failed to parse CSV file.');
      }
    },
    error: () => {
      onError('Failed to read CSV file.');
    },
  });
};

const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
