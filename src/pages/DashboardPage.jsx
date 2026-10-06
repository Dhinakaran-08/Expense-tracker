import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useAnalytics } from '../hooks/useAnalytics';
import StatCards from '../components/dashboard/StatCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import TrendChart from '../components/dashboard/TrendChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import TransactionForm from '../components/transactions/TransactionForm';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import ExportButtons from '../components/export/ExportButtons';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { transactions, totals, loading, addTransaction } = useTransactions();
  const { categoryBreakdown, dailyTrend } = useAnalytics(transactions);
  const { profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-[13.5px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {profile?.full_name ? `Welcome back, ${profile.full_name}.` : 'Your financial overview.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons transactions={transactions} profile={profile} />
          <Button size="lg" icon={Plus} onClick={() => setModalOpen(true)}>
            Add transaction
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatCards totals={totals} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart categoryBreakdown={categoryBreakdown} transactions={transactions} />
        <TrendChart dailyTrend={dailyTrend} />
      </div>

      {/* Recent activity */}
      <RecentTransactions transactions={transactions} />

      <TransactionForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTransaction}
      />
    </div>
  );
}
