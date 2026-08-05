import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionList from '../components/transactions/TransactionList';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionForm from '../components/transactions/TransactionForm';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/ui/EmptyState';
import ExportButtons from '../components/export/ExportButtons';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight } from 'lucide-react';

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
  } = useTransactions();
  const { profile } = useAuth();

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const filteredTransactions = getFilteredTransactions(filters);

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditData(null);
  };

  const handleSubmit = async (data) => {
    if (editData) {
      await updateTransaction(editData.id, data);
    } else {
      await addTransaction(data);
    }
  };

  if (loading) {
    return <Loader text="Loading transaction history..." />;
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
            Transaction History
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage, search, and filter all income & expense logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons transactions={filteredTransactions} profile={profile} />
          <Button size="lg" icon={Plus} onClick={() => setModalOpen(true)}>
            Add Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onChange={setFilters} />

      {/* List / Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions found"
          description={
            transactions.length === 0
              ? 'Start by creating your first income or expense entry.'
              : 'No results match your search filters.'
          }
          action={
            <Button onClick={() => setModalOpen(true)}>Add Transaction</Button>
          }
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={deleteTransaction}
        />
      )}

      {/* Modal Form */}
      <TransactionForm
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editData={editData}
      />
    </div>
  );
}
