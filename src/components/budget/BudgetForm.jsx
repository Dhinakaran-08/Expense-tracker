import { useState, useEffect } from 'react';
import { EXPENSE_CATEGORIES, MONTHS } from '../../lib/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Modal from '../ui/Modal';

export default function BudgetForm({ isOpen, onClose, onSubmit, editData }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    category: '',
    limit_amount: '',
    month: currentMonth,
    year: currentYear,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        category: editData.category,
        limit_amount: String(editData.limit_amount),
        month: editData.month,
        year: editData.year,
      });
    } else {
      setFormData({
        category: '',
        limit_amount: '',
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.limit_amount || Number(formData.limit_amount) <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        category: formData.category,
        limit_amount: Number(formData.limit_amount),
        month: Number(formData.month),
        year: Number(formData.year),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const monthOptions = MONTHS.map((m, i) => ({
    value: String(i + 1),
    label: m,
  }));

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(
    (y) => ({ value: String(y), label: String(y) })
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Budget' : 'Set Budget'}
    >
      {error && (
        <div
          className="mb-4 p-3 rounded-xl text-sm"
          style={{
            background: 'var(--color-danger-50)',
            color: 'var(--color-danger-500)',
            border: '1px solid var(--color-danger-100)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Select
          label="Category"
          options={EXPENSE_CATEGORIES}
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          placeholder="Select expense category"
        />

        <Input
          label="Budget Limit (₹)"
          type="number"
          placeholder="e.g., 5000"
          min="0"
          step="100"
          value={formData.limit_amount}
          onChange={(e) =>
            setFormData({ ...formData, limit_amount: e.target.value })
          }
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Month"
            options={monthOptions}
            value={String(formData.month)}
            onChange={(e) =>
              setFormData({ ...formData, month: e.target.value })
            }
          />
          <Select
            label="Year"
            options={yearOptions}
            value={String(formData.year)}
            onChange={(e) =>
              setFormData({ ...formData, year: e.target.value })
            }
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {editData ? 'Update Budget' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
