import { useState, useEffect } from 'react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../lib/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

export default function TransactionForm({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData({
        type: editData.type,
        category: editData.category,
        amount: String(editData.amount),
        description: editData.description || '',
        date: editData.date,
        time: editData.time || new Date().toTimeString().slice(0, 5),
      });
    } else {
      setFormData({
        type: 'expense',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      });
    }
  }, [editData, isOpen]);

  const categories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        description: formData.description,
        date: formData.date,
        time: formData.time,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Transaction' : 'Add New Transaction'}
      size="sm"
    >
      {error && (
        <div
          className="mb-3 p-2.5 rounded-md text-[13px] font-medium"
          style={{
            background: 'var(--color-danger-50)',
            color: 'var(--color-danger-500)',
            border: '1px solid var(--color-danger-100)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Type Toggle */}
        <div
          className="flex rounded-md p-1"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
        >
          <button
            type="button"
            className="flex-1 py-1.5 rounded text-[13px] font-semibold transition-all duration-150"
            style={{
              background: formData.type === 'income' ? 'var(--bg-secondary)' : 'transparent',
              color: formData.type === 'income' ? 'var(--color-success-600)' : 'var(--text-tertiary)',
              boxShadow: formData.type === 'income' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
          >
            + Income
          </button>
          <button
            type="button"
            className="flex-1 py-1.5 rounded text-[13px] font-semibold transition-all duration-150"
            style={{
              background: formData.type === 'expense' ? 'var(--bg-secondary)' : 'transparent',
              color: formData.type === 'expense' ? 'var(--color-danger-500)' : 'var(--text-tertiary)',
              boxShadow: formData.type === 'expense' ? 'var(--shadow-sm)' : 'none',
            }}
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
          >
            − Expense
          </button>
        </div>

        {/* Category chips — single source of truth, no redundant dropdown.
            4 columns keeps expense's 8 categories to just 2 rows. */}
        <div>
          <label
            className="text-[12px] font-medium block mb-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="px-2 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 truncate"
                style={{
                  background: formData.category === cat ? 'var(--color-primary-600)' : 'var(--bg-tertiary)',
                  color: formData.category === cat ? '#ffffff' : 'var(--text-secondary)',
                  border: formData.category === cat
                    ? '1px solid var(--color-primary-600)'
                    : '1px solid var(--border-color)',
                }}
                onClick={() => setFormData({ ...formData, category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Amount, date, and time all in one row */}
        <div className="flex gap-2">
          <div className="flex-[1.2]">
            <Input
              label="Amount (₹)"
              type="number"
              placeholder="1500"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="flex-1">
            <Input
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
        </div>

        <Input
          label="Description (optional)"
          type="text"
          placeholder="e.g. Grocery items at supermarket"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1 justify-center">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1 justify-center">
            {editData ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
