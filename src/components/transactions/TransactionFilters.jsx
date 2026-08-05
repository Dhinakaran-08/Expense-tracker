import { Search } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/constants';

export default function TransactionFilters({ filters, onChange }) {
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <Input
          icon={Search}
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>
      <Select
        options={[
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
        ]}
        placeholder="All types"
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="sm:w-40"
      />
      <Select
        options={allCategories}
        placeholder="All categories"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="sm:w-44"
      />
      <Input
        type="date"
        value={filters.startDate}
        onChange={(e) =>
          onChange({ ...filters, startDate: e.target.value })
        }
        className="sm:w-40"
      />
      <Input
        type="date"
        value={filters.endDate}
        onChange={(e) =>
          onChange({ ...filters, endDate: e.target.value })
        }
        className="sm:w-40"
      />
    </div>
  );
}
