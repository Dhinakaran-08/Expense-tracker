import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useTransactions } from '../hooks/useTransactions';
import BudgetList from '../components/budget/BudgetList';
import BudgetForm from '../components/budget/BudgetForm';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Select from '../components/ui/Select';
import { MONTHS } from '../lib/constants';

export default function BudgetPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const { budgets, loading, addBudget, updateBudget, deleteBudget } =
    useBudgets();
  const { transactions } = useTransactions();

  const activeBudgets = useMemo(() => {
    return budgets.filter(
      (b) => b.month === selectedMonth && b.year === selectedYear
    );
  }, [budgets, selectedMonth, selectedYear]);

  // Compute spending per category for selected month/year
  const spendingMap = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      if (d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear) {
        map[t.category] = (map[t.category] || 0) + Number(t.amount);
      }
    });
    return map;
  }, [transactions, selectedMonth, selectedYear]);

  const handleEdit = (budget) => {
    setEditData(budget);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleSubmit = async (data) => {
    if (editData) {
      await updateBudget(editData.id, data);
    } else {
      await addBudget(data);
    }
  };

  if (loading) {
    return <Loader text="Loading budget planner..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Budget Planner
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Set category limits to control your monthly expenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))}
            value={String(selectedMonth)}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="w-36"
          />
          <Select
            options={[currentYear - 1, currentYear, currentYear + 1].map((y) => ({
              value: String(y),
              label: String(y),
            }))}
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-28"
          />
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Set Limit
          </Button>
        </div>
      </div>

      {/* Budget List */}
      <BudgetList
        budgets={activeBudgets}
        spending={spendingMap}
        onEdit={handleEdit}
        onDelete={deleteBudget}
        onAdd={() => setModalOpen(true)}
      />

      {/* Form Modal */}
      <BudgetForm
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editData={editData}
      />
    </div>
  );
}
