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
    <div className="flex flex-wrap items-start gap-3">
      {/* Search Input - Expands to fill available space and never shrinks below 260px */}
      <div className="flex-1 min-w-[260px]">
        <Input
          icon={Search}
          placeholder="Search transactions..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Filter Controls - Responsive 2-col on mobile, flex row on desktop */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-start gap-2.5 w-full sm:w-auto">
        <Select
          options={[
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' },
          ]}
          placeholder="All types"
          value={filters.type}
          onChange={handleTypeChange}
          className="w-full sm:w-32"
        />
        <Select
          options={categoryOptions}
          placeholder="All categories"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full sm:w-40"
        />
        <Input
          type="date"
          title="Start date"
          aria-label="Start date"
          max={filters.endDate || undefined}
          value={filters.startDate}
          onChange={handleStartDateChange}
          className="w-full sm:w-36"
        />
        <Input
          type="date"
          title="End date"
          aria-label="End date"
          min={filters.startDate || undefined}
          value={filters.endDate}
          onChange={handleEndDateChange}
          error={isInvalidDateRange ? 'End date must be greater than or equal to start date' : undefined}
          className="w-full sm:w-36"
        />
      </div>
    </div>
  );
}
