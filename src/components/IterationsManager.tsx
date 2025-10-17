import React, { useState } from 'react';
import { IterationData, BudgetParams } from '../types/budget';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface IterationsManagerProps {
  iterations: IterationData[];
  budgetParams: BudgetParams;
  onChange: (iterations: IterationData[]) => void;
  onImportCSV: (file: File) => void;
  onExportCSV: () => void;
}

const MAX_ITERATIONS = 100;

export const IterationsManager: React.FC<IterationsManagerProps> = ({
  iterations,
  budgetParams,
  onChange,
  onImportCSV,
  onExportCSV,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<IterationData | null>(null);

  const addIteration = () => {
    if (iterations.length >= MAX_ITERATIONS) {
      alert(`Maximum ${MAX_ITERATIONS} iterations allowed`);
      return;
    }

    const newIteration: IterationData = {
      iterationNumber: iterations.length + 1,
      iterationDays: budgetParams.workingDaysPerIteration,
      teamSize: budgetParams.teamSize,
      totalHours: budgetParams.workingDaysPerIteration * budgetParams.teamSize * 8,
      isCurrent: false,
    };

    onChange([...iterations, newIteration]);
  };

  const generateIterationsToReachBudget = () => {
    const newIterations: IterationData[] = [];
    let totalCost = 0;
    let iterationNum = 1;

    while (totalCost < budgetParams.budgetSize && iterationNum <= MAX_ITERATIONS) {
      const totalHours = budgetParams.workingDaysPerIteration * budgetParams.teamSize * 8;
      const iterationCost = totalHours * budgetParams.costPerHour;

      if (totalCost + iterationCost > budgetParams.budgetSize) {
        const remainingBudget = budgetParams.budgetSize - totalCost;
        const remainingHours = remainingBudget / budgetParams.costPerHour;
        const remainingDays = Math.ceil(remainingHours / (budgetParams.teamSize * 8));

        newIterations.push({
          iterationNumber: iterationNum,
          iterationDays: remainingDays,
          teamSize: budgetParams.teamSize,
          totalHours: remainingHours,
          isCurrent: false,
        });
        break;
      }

      newIterations.push({
        iterationNumber: iterationNum,
        iterationDays: budgetParams.workingDaysPerIteration,
        teamSize: budgetParams.teamSize,
        totalHours,
        isCurrent: false,
      });

      totalCost += iterationCost;
      iterationNum++;
    }

    onChange(newIterations);
  };

  const deleteIteration = (iterationNumber: number) => {
    const filtered = iterations.filter((it) => it.iterationNumber !== iterationNumber);
    const renumbered = filtered.map((it, index) => ({
      ...it,
      iterationNumber: index + 1,
    }));
    onChange(renumbered);
  };

  const startEdit = (iteration: IterationData) => {
    setEditingId(iteration.iterationNumber);
    setEditForm({ ...iteration });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;

    const updated = iterations.map((it) =>
      it.iterationNumber === editingId ? editForm : it
    );

    onChange(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const toggleCurrent = (iterationNumber: number) => {
    const updated = iterations.map((it) => ({
      ...it,
      isCurrent: it.iterationNumber === iterationNumber,
    }));
    onChange(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportCSV(file);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Iterations ({iterations.length}/{MAX_ITERATIONS})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={addIteration}
            disabled={iterations.length >= MAX_ITERATIONS}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add Iteration
          </button>
          <button
            onClick={generateIterationsToReachBudget}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Generate to Budget
          </button>
          <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            onClick={onExportCSV}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Iteration</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Days</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team Size</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Hours</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Current</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {iterations.map((iteration) => (
              <tr key={iteration.iterationNumber} className="border-b border-gray-100 hover:bg-gray-50">
                {editingId === iteration.iterationNumber ? (
                  <>
                    <td className="py-3 px-4">{iteration.iterationNumber}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={editForm?.iterationDays || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            iterationDays: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={editForm?.teamSize || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            teamSize: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={editForm?.totalHours || 0}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            totalHours: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.1"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={editForm?.isCurrent || false}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm!,
                            isCurrent: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-3 px-4 text-sm text-gray-900">{iteration.iterationNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{iteration.iterationDays}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{iteration.teamSize}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {iteration.totalHours?.toFixed(0) || 0}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={iteration.isCurrent || false}
                        onChange={() => toggleCurrent(iteration.iterationNumber)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(iteration)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteIteration(iteration.iterationNumber)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {iterations.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No iterations yet. Click "Add Iteration" or "Generate to Budget" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
