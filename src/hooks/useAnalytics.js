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

  // Exclude lend / receive lend transactions from all analytics and trends
  const analyticsTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const cat = t.category?.toLowerCase();
      return cat !== 'lend' && cat !== 'receive lend';
    });
  }, [transactions]);

  // Current month transactions (excluding lend)
  const currentMonthTransactions = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return analyticsTransactions.filter((t) => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });
  }, [analyticsTransactions]);

  // Current week transactions (excluding lend)
  const currentWeekTransactions = useMemo(() => {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    return analyticsTransactions.filter((t) => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });
  }, [analyticsTransactions]);

  // Weekly chart data (Mon-Sun) (excluding lend)
  const weeklyData = useMemo(() => {
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTransactions = analyticsTransactions.filter((t) => t.date === dateStr);
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
  }, [analyticsTransactions]);

  // Monthly chart data (last 6 months) (excluding lend)
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthTransactions = analyticsTransactions.filter((t) => {
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
  }, [analyticsTransactions]);

  // Category breakdown (expenses only, excluding lend)
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

  // Summary stats (excluding rent and lend from daily/projected calculations)
  const summary = useMemo(() => {
    const monthExpenses = currentMonthTransactions.filter(
      (t) => t.type === 'expense'
    );
    const nonRentMonthExpenses = monthExpenses.filter(
      (t) => t.category?.toLowerCase() !== 'rent'
    );
    const rentMonthExpenses = monthExpenses.filter(
      (t) => t.category?.toLowerCase() === 'rent'
    );

    const totalMonthExpense = monthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );
    const nonRentMonthExpense = nonRentMonthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );
    const rentMonthExpense = rentMonthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );

    const totalMonthIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);

    const daysInMonth = endOfMonth(now).getDate();
    const currentDay = now.getDate();

    // Highest category excluding Rent (and Lend is already excluded)
    const nonRentBreakdown = categoryBreakdown.filter(
      (c) => c.category?.toLowerCase() !== 'rent'
    );

    const projectedNonRent =
      currentDay > 0 ? (nonRentMonthExpense / currentDay) * daysInMonth : 0;

    return {
      avgDailySpend:
        currentDay > 0 ? nonRentMonthExpense / currentDay : 0,
      highestCategory: nonRentBreakdown[0]?.category || 'N/A',
      highestCategoryAmount: nonRentBreakdown[0]?.amount || 0,
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
      nonRentMonthExpense,
      rentMonthExpense,
      projectedMonthlyExpense: projectedNonRent + rentMonthExpense,
    };
  }, [currentMonthTransactions, categoryBreakdown]);

  // Daily spending trend for current month (excluding rent and lend)
  const dailyTrend = useMemo(() => {
    const start = startOfMonth(now);
    const end = now;
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const expense = analyticsTransactions
        .filter(
          (t) =>
            t.date === dateStr &&
            t.type === 'expense' &&
            t.category?.toLowerCase() !== 'rent'
        )
        .reduce((s, t) => s + Number(t.amount), 0);

      return {
        date: format(day, 'dd MMM'),
        expense,
      };
    });
  }, [analyticsTransactions]);

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
