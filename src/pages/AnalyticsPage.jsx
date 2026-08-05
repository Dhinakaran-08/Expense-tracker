import { useTransactions } from '../hooks/useTransactions';
import { useAnalytics } from '../hooks/useAnalytics';
import WeeklyChart from '../components/analytics/WeeklyChart';
import MonthlyChart from '../components/analytics/MonthlyChart';
import CategoryBreakdown from '../components/analytics/CategoryBreakdown';
import AnalyticsSummary from '../components/analytics/AnalyticsSummary';
import Loader from '../components/ui/Loader';
import ExportButtons from '../components/export/ExportButtons';
import { useAuth } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { transactions, loading } = useTransactions();
  const { profile } = useAuth();
  const { weeklyData, monthlyData, categoryBreakdown, summary } =
    useAnalytics(transactions);

  if (loading) {
    return <Loader text="Calculating financial analytics..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Financial Analytics
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Deep dive into weekly and monthly spending habits
          </p>
        </div>
        <ExportButtons transactions={transactions} profile={profile} />
      </div>

      <AnalyticsSummary summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart weeklyData={weeklyData} />
        <MonthlyChart monthlyData={monthlyData} />
      </div>

      <CategoryBreakdown categoryBreakdown={categoryBreakdown} />
    </div>
  );
}
