export interface BudgetParams {
  costPerHour: number;
  budgetSize: number;
  teamSize: number;
  workingDaysPerIteration: number;
  currency: string;
}

export interface IterationData {
  iterationNumber: number;
  iterationDays: number;
  teamSize: number;
  totalHours?: number;
  isCurrent?: boolean;
}

export interface ChartData {
  name: string;
  iterationCost: number;
  cumulativeStandard: number;
  cumulativeActual: number;
  budgetCap: number;
}

export interface SavedState {
  id: string;
  name: string;
  date: string;
  budgetParams: BudgetParams;
  iterations: IterationData[];
}

export interface AppState {
  budgetParams: BudgetParams;
  iterations: IterationData[];
  chartVisibility: {
    iterationCost: boolean;
    cumulativeStandard: boolean;
    cumulativeActual: boolean;
  };
}
