import { Search } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../lib/constants';

export default function TransactionFilters({ filters, onChange }) {
  const categoryOptions =
    filters.type === 'income'
      ? INCOME_CATEGORIES
      : filters.type === 'expense'
      ? EXPENSE_CATEGORIES
      : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const allowedCategories =
      newType === 'income'
        ? INCOME_CATEGORIES
        : newType === 'expense'
        ? EXPENSE_CATEGORIES
        : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

    const newCategory = allowedCategories.includes(filters.category)
      ? filters.category
      : '';

    onChange({
      ...filters,
      type: newType,
      category: newCategory,
    });
  };

  const isInvalidDateRange = Boolean(
    filters.startDate && filters.endDate && filters.endDate < filters.startDate
  );

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    const nextFilters = { ...filters, startDate: newStartDate };
    if (newStartDate && filters.endDate && newStartDate > filters.endDate) {
      nextFilters.endDate = '';
    }
    onChange(nextFilters);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    onChange({
      ...filters,
      endDate: newEndDate,
    });
  };

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
        onChange={handleTypeChange}
        className="sm:w-40"
      />
      <Select
        options={categoryOptions}
        placeholder="All categories"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="sm:w-44"
      />
      <Input
        type="date"
        title="Start date"
        aria-label="Start date"
        max={filters.endDate || undefined}
        value={filters.startDate}
        onChange={handleStartDateChange}
        className="sm:w-40"
      />
      <Input
        type="date"
        title="End date"
        aria-label="End date"
        min={filters.startDate || undefined}
        value={filters.endDate}
        onChange={handleEndDateChange}
        error={isInvalidDateRange ? 'End date must be greater than or equal to start date' : undefined}
        className="sm:w-40"
      />
    </div>
  );
}
