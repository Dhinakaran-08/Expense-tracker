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

  // Category breakdown (expenses, including net Lend if outstanding)
  const categoryBreakdown = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const monthTxns = transactions.filter((t) => {
      try {
        const d = parseISO(t.date);
        return isWithinInterval(d, { start, end });
      } catch {
        return false;
      }
    });

    const categoryMap = {};

    // 1. Regular expenses (excluding Lend and Receive Lend)
    monthTxns
      .filter(
        (t) =>
          t.type === 'expense' &&
          t.category?.toLowerCase() !== 'lend' &&
          t.category?.toLowerCase() !== 'receive lend'
      )
      .forEach((t) => {
        categoryMap[t.category] =
          (categoryMap[t.category] || 0) + Number(t.amount);
      });

    // 2. Lend and Receive Lend calculations
    const monthLend = monthTxns
      .filter((t) => t.type === 'expense' && t.category?.toLowerCase() === 'lend')
      .reduce((s, t) => s + Number(t.amount), 0);

    const monthReceiveLend = monthTxns
      .filter((t) => t.type === 'income' && t.category?.toLowerCase() === 'receive lend')
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalAllLend = transactions
      .filter((t) => t.type === 'expense' && t.category?.toLowerCase() === 'lend')
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalAllReceiveLend = transactions
      .filter((t) => t.type === 'income' && t.category?.toLowerCase() === 'receive lend')
      .reduce((s, t) => s + Number(t.amount), 0);

    const totalOutstandingLend = Math.max(0, totalAllLend - totalAllReceiveLend);

    // Active net lend amount for this period
    let netLendAmount = 0;
    let receivedAmount = 0;

    if (totalOutstandingLend > 0) {
      if (monthLend > 0) {
        netLendAmount = Math.min(
          totalOutstandingLend,
          Math.max(0, monthLend - monthReceiveLend)
        );
        receivedAmount = monthReceiveLend;
      } else if (monthReceiveLend > 0) {
        netLendAmount = totalOutstandingLend;
        receivedAmount = monthReceiveLend;
      }
    }

    // If fully received (netLendAmount <= 0), Lend category is deleted/omitted
    if (netLendAmount > 0) {
      categoryMap['Lend'] = netLendAmount;
    }

    const totalExpense = Object.values(categoryMap).reduce(
      (s, amt) => s + Number(amt),
      0
    );

    return Object.entries(categoryMap)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpense > 0
            ? ((amount / totalExpense) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Summary stats (excluding rent, lend, and allowance from daily/projected calculations)
  const summary = useMemo(() => {
    const monthExpenses = currentMonthTransactions.filter(
      (t) => t.type === 'expense'
    );
    const nonDailyMonthExpenses = monthExpenses.filter(
      (t) =>
        t.category?.toLowerCase() !== 'rent' &&
        t.category?.toLowerCase() !== 'lend' &&
        t.category?.toLowerCase() !== 'allowance'
    );
    const rentMonthExpenses = monthExpenses.filter(
      (t) => t.category?.toLowerCase() === 'rent'
    );

    const totalMonthExpense = categoryBreakdown.reduce(
      (s, item) => s + Number(item.amount),
      0
    );
    const nonDailyMonthExpense = nonDailyMonthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );
    const rentMonthExpense = rentMonthExpenses.reduce(
      (s, t) => s + Number(t.amount),
      0
    );

    const totalMonthIncome = currentMonthTransactions
      .filter((t) => t.type === 'income' && t.category?.toLowerCase() !== 'receive lend')
      .reduce((s, t) => s + Number(t.amount), 0);

    const daysInMonth = endOfMonth(now).getDate();
    const currentDay = now.getDate();
    const daysRemaining = Math.max(0, daysInMonth - currentDay);

    // Highest category excluding Rent, Lend, and Allowance
    const eligibleBreakdown = categoryBreakdown.filter(
      (c) =>
        c.category?.toLowerCase() !== 'rent' &&
        c.category?.toLowerCase() !== 'lend' &&
        c.category?.toLowerCase() !== 'allowance'
    );

    const avgDailySpend =
      currentDay > 0 ? nonDailyMonthExpense / currentDay : 0;

    // Projected Expense (excluding Rent, Lend, and Allowance):
    // Extrapolates daily variable spending across the total days of the month.
    const projectedMonthlyExpense =
      currentDay > 0 ? (nonDailyMonthExpense / currentDay) * daysInMonth : 0;

    // Savings Rate (0% to 100%):
    // Based on true earned income vs net expenses. Clamped so it never goes negative.
    const savings = totalMonthIncome - totalMonthExpense;
    const savingsRate =
      totalMonthIncome > 0
        ? Math.max(0, Math.min(100, (savings / totalMonthIncome) * 100)).toFixed(1)
        : '0.0';

    return {
      avgDailySpend,
      highestCategory: eligibleBreakdown[0]?.category || 'N/A',
      highestCategoryAmount: eligibleBreakdown[0]?.amount || 0,
      savingsRate,
      totalMonthIncome,
      totalMonthExpense,
      nonDailyMonthExpense,
      rentMonthExpense,
      projectedMonthlyExpense,
    };
  }, [currentMonthTransactions, categoryBreakdown]);

  // Daily spending trend for current month (excluding rent, lend, and allowance)
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
            t.category?.toLowerCase() !== 'rent' &&
            t.category?.toLowerCase() !== 'allowance'
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
