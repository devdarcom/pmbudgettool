import { BudgetParams, IterationData, ChartData } from '../types/budget';

export const calculateChartData = (
  iterations: IterationData[],
  budgetParams: BudgetParams,
  currentIterationIndex: number
): ChartData[] => {
  let cumulativeStandard = 0;
  let cumulativeActual = 0;

  const standardIterationCost =
    budgetParams.workingDaysPerIteration *
    budgetParams.teamSize *
    8 *
    budgetParams.costPerHour;

  const startPoint: ChartData = {
    name: 'Start',
    iterationCost: 0,
    cumulativeStandard: 0,
    cumulativeActual: 0,
    budgetCap: budgetParams.budgetSize,
  };

  const dataPoints = iterations.map((iteration, index) => {
    const totalHours = iteration.totalHours || 0;
    const iterationCost = totalHours * budgetParams.costPerHour;

    cumulativeStandard += standardIterationCost;

    if (index <= currentIterationIndex) {
      cumulativeActual += iterationCost;
    } else {
      cumulativeActual += standardIterationCost;
    }

    return {
      name: `IT ${iteration.iterationNumber}`,
      iterationCost: index <= currentIterationIndex ? iterationCost : 0,
      cumulativeStandard,
      cumulativeActual,
      budgetCap: budgetParams.budgetSize,
    };
  });

  const result = [startPoint, ...dataPoints];

  // Add projected iterations until budget cap is crossed
  const lastActualCumulative = result[result.length - 1].cumulativeActual;
  const lastStandardCumulative = result[result.length - 1].cumulativeStandard;

  if (lastActualCumulative < budgetParams.budgetSize || lastStandardCumulative < budgetParams.budgetSize) {
    let iterationNum = iterations.length + 1;
    let tempCumulativeStandard = lastStandardCumulative;
    let tempCumulativeActual = lastActualCumulative;

    const maxIterations = 200 - iterations.length;

    for (let i = 0; i < maxIterations; i++) {
      tempCumulativeStandard += standardIterationCost;
      tempCumulativeActual += standardIterationCost;

      result.push({
        name: `IT ${iterationNum}`,
        iterationCost: 0,
        cumulativeStandard: tempCumulativeStandard,
        cumulativeActual: tempCumulativeActual,
        budgetCap: budgetParams.budgetSize,
      });

      iterationNum++;

      // Stop after crossing the budget cap
      if (tempCumulativeActual >= budgetParams.budgetSize && tempCumulativeStandard >= budgetParams.budgetSize) {
        break;
      }
    }
  }

  return result;
};

export const calculateBudgetMetrics = (
  iterations: IterationData[],
  budgetParams: BudgetParams
) => {
  const consumedBudget = iterations.reduce((total, iteration) => {
    const totalHours = iteration.totalHours || 0;
    return total + totalHours * budgetParams.costPerHour;
  }, 0);

  const consumptionRate =
    budgetParams.budgetSize > 0
      ? (consumedBudget / budgetParams.budgetSize) * 100
      : 0;

  return {
    totalBudget: budgetParams.budgetSize,
    consumedBudget,
    consumptionRate,
  };
};
