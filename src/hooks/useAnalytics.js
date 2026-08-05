import { useMemo } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  eachDayOfInterval,
  parseISO,
  isWithinInterval,
} from 'date-fns';

export function useAnalytics(transactions = []) {
  const now = new Date();

  // Current month transactions
  const currentMonthTransactions = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter((t) => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });
  }, [transactions]);

  // Current week transactions
  const currentWeekTransactions = useMemo(() => {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return transactions.filter((t) => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });
  }, [transactions]);

  // Weekly chart data (Mon-Sun)
  const weeklyData = useMemo(() => {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = transactions.filter((t) => t.date === dateStr);
      const income = dayTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);
      const expense = dayTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);

      return {
        day: format(day, 'EEE'),
        date: dateStr,
        income,
        expense,
      };
    });
  }, [transactions]);

  // Monthly chart data (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthTransactions = transactions.filter((t) => {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start, end });
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);
      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);

      months.push({
        month: format(monthDate, 'MMM yyyy'),
        shortMonth: format(monthDate, 'MMM'),
        income,
        expense,
        savings: income - expense,
      });
    }
    return months;
  }, [transactions]);

  // Category breakdown (expenses only)
  const categoryBreakdown = useMemo(() => {
    const expenses = currentMonthTransactions.filter(
      (t) => t.type === 'expense'
    );
    const totalExpense = expenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );

    const categoryMap = {};
    expenses.forEach((t) => {
      categoryMap[t.category] =
        (categoryMap[t.category] || 0) + Number(t.amount);
    });

    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0
          ? ((amount / totalExpense) * 100).toFixed(1)
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [currentMonthTransactions]);

  // Summary stats
  const summary = useMemo(() => {
    const monthExpenses = currentMonthTransactions.filter(
      (t) => t.type === 'expense'
    );
    const totalMonthExpense = monthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );
    const totalMonthIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);

    const daysInMonth = endOfMonth(now).getDate();
    const currentDay = now.getDate();

    return {
      avgDailySpend:
        currentDay > 0 ? totalMonthExpense / currentDay : 0,
      highestCategory: categoryBreakdown[0]?.category || 'N/A',
      highestCategoryAmount: categoryBreakdown[0]?.amount || 0,
      savingsRate:
        totalMonthIncome > 0
          ? (
              ((totalMonthIncome - totalMonthExpense) /
                totalMonthIncome) *
              100
            ).toFixed(1)
          : 0,
      totalMonthIncome,
      totalMonthExpense,
      projectedMonthlyExpense:
        currentDay > 0
          ? (totalMonthExpense / currentDay) * daysInMonth
          : 0,
    };
  }, [currentMonthTransactions, categoryBreakdown]);

  // Daily spending trend for current month
  const dailyTrend = useMemo(() => {
    const start = startOfMonth(now);
    const end = now;
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const expense = transactions
        .filter((t) => t.date === dateStr && t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);

      return {
        date: format(day, 'dd MMM'),
        expense,
      };
    });
  }, [transactions]);

  return {
    currentMonthTransactions,
    currentWeekTransactions,
    weeklyData,
    monthlyData,
    categoryBreakdown,
    summary,
    dailyTrend,
  };
}
