import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Edit3, Trash2, ChevronLeft, ChevronRight,
  Banknote, Wallet, UtensilsCrossed, ShoppingBasket, Home,
  ShoppingBag, Receipt, Gamepad2, HeartPulse, Plane, MoreHorizontal,
  HandCoins,
} from 'lucide-react';
import { CURRENCY, CATEGORY_COLORS } from '../../lib/constants';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const iconMap = {
  'Monthly Salary': Banknote,
  'Pocket Money': Wallet,
  'Receive Lend': HandCoins,
  Food: UtensilsCrossed,
  Grocery: ShoppingBasket,
  Rent: Home,
  Lend: HandCoins,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Gamepad2,
  Medical: HeartPulse,
  Travel: Plane,
  Others: MoreHorizontal,
};

const PAGE_SIZE = 10;

export default function TransactionList({
  transactions = [],
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [transactions.length]);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE) || 1;
  const safePage = Math.min(page, Math.max(0, totalPages - 1));
  const paged = transactions.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      setDeleteId(null);
    } catch {
      // error handled upstream
    }
  };

  if (transactions.length === 0) return null;

  return (
    <div
      className="rounded-lg overflow-hidden animate-fade-in"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['Category', 'Description', 'Date', 'Type', 'Amount', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-xs font-medium text-left px-5 py-3.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paged.map((t) => {
              const Icon = iconMap[t.category] || MoreHorizontal;
              const isIncome = t.type === 'income';
              const color = CATEGORY_COLORS[t.category] || '#94a3b8';
              return (
                <tr
                  key={t.id}
                  className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--bg-tertiary)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'transparent')
                  }
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: `${color}18` }}
                      >
                        <Icon size={16} style={{ color }} />
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.description || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {format(parseISO(t.date), 'dd MMM yyyy')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={t.type}>
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isIncome ? 'var(--color-success-500)' : 'var(--color-danger-500)' }}
                    >
                      {isIncome ? '+' : '-'}{CURRENCY}
                      {new Intl.NumberFormat('en-IN').format(t.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="p-2 rounded-lg transition-colors duration-200"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-tertiary)';
                          e.currentTarget.style.color = 'var(--color-primary-500)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      {deleteId === t.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-white"
                            style={{ background: 'var(--color-danger-500)' }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="px-2 py-1 rounded-lg text-xs font-medium"
                            style={{
                              background: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="p-2 rounded-lg transition-colors duration-200"
                          style={{ color: 'var(--text-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-danger-50)';
                            e.currentTarget.style.color = 'var(--color-danger-500)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {paged.map((t) => {
          const Icon = iconMap[t.category] || MoreHorizontal;
          const isIncome = t.type === 'income';
          const color = CATEGORY_COLORS[t.category] || '#94a3b8';
          return (
            <div key={t.id} className="p-4 flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.description || t.category}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {t.category} • {format(parseISO(t.date), 'dd MMM')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: isIncome ? 'var(--color-success-500)' : 'var(--color-danger-500)' }}
                >
                  {isIncome ? '+' : '-'}{CURRENCY}
                  {new Intl.NumberFormat('en-IN').format(t.amount)}
                </p>
                <div className="flex gap-1 mt-1 justify-end">
                  <button
                    onClick={() => onEdit(t)}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg"
                    style={{ color: 'var(--color-danger-500)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (() => {
        const maxButtons = 5;
        let startPage = Math.max(0, safePage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons);
        if (endPage - startPage < maxButtons) {
          startPage = Math.max(0, endPage - maxButtons);
        }
        const pageNumbers = [];
        for (let i = startPage; i < endPage; i++) {
          pageNumbers.push(i);
        }

        return (
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Showing {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, transactions.length)} of{' '}
              {transactions.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
              />
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-colors duration-200"
                  style={{
                    background: safePage === pageNum ? 'var(--color-primary-500)' : 'transparent',
                    color: safePage === pageNum ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {pageNum + 1}
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
