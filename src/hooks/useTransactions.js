import { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DEMO_TRANSACTIONS } from '../lib/constants';

// v2: bumped so any old cached/sample entries from earlier sessions
// are abandoned automatically — new users always start empty.
const STORAGE_KEY = 'expense_iq_transactions_v2';

const sortByDate = (list) => {
  return [...list].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return createdB - createdA;
  });
};

export function useTransactions() {
  const { user, isDemo } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // If Demo Mode or Supabase not configured, use LocalStorage / Seed
    if (isDemo || !isSupabaseConfigured) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTransactions(sortByDate(parsed));
        } catch {
          setTransactions(sortByDate(INITIAL_DEMO_TRANSACTIONS));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
        }
      } else {
        setTransactions(sortByDate(INITIAL_DEMO_TRANSACTIONS));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
      }
      setLoading(false);
      return;
    }

    // Attempt Supabase fetch
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(sortByDate(data || []));
    } catch (err) {
      console.warn('Supabase transaction fetch fallback to local:', err);
      const stored = localStorage.getItem(STORAGE_KEY);
      const fallback = stored ? JSON.parse(stored) : INITIAL_DEMO_TRANSACTIONS;
      setTransactions(sortByDate(fallback));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const saveToLocal = (newTxns) => {
    const sorted = sortByDate(newTxns);
    setTransactions(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  };

  const addTransaction = async (transaction) => {
    const newTx = {
      id: 'tx-' + Date.now(),
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
      ...transaction,
    };

    if (isDemo || !isSupabaseConfigured) {
      const updated = sortByDate([newTx, ...transactions]);
      saveToLocal(updated);
      return newTx;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setTransactions((prev) => sortByDate([data, ...prev]));
      return data;
    } catch (err) {
      console.error('Failed to save transaction to Supabase:', err.message);
      setError(`Couldn't save to your account: ${err.message}`);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    if (isDemo || !isSupabaseConfigured) {
      const updated = transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveToLocal(updated);
      return updated.find((t) => t.id === id);
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      setTransactions((prev) => sortByDate(prev.map((t) => (t.id === id ? data : t))));
      return data;
    } catch (err) {
      console.error('Failed to update transaction in Supabase:', err.message);
      setError(`Couldn't update: ${err.message}`);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    if (isDemo || !isSupabaseConfigured) {
      const updated = transactions.filter((t) => t.id !== id);
      saveToLocal(updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction in Supabase:', err.message);
      setError(`Couldn't delete: ${err.message}`);
      throw err;
    }
  };

  const getFilteredTransactions = useCallback(
    ({ type, category, search, startDate, endDate } = {}) => {
      let filtered = [...transactions];

      if (type) {
        filtered = filtered.filter((t) => t.type === type);
      }
      if (category) {
        filtered = filtered.filter((t) => t.category === category);
      }
      if (search) {
        const term = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.description?.toLowerCase().includes(term) ||
            t.category.toLowerCase().includes(term)
        );
      }
      if (startDate) {
        filtered = filtered.filter((t) => t.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter((t) => t.date <= endDate);
      }

      return sortByDate(filtered);
    },
    [transactions]
  );

  const now = new Date();
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

  const isReceiveLend = (t) => t.category?.toLowerCase() === 'receive lend';

  // Total cash flow in wallet (all money in minus all money out)
  const totalAllIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalAllExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalBalance = totalAllIncome - totalAllExpense;

  // True earned income (excluding repayments of lent money)
  const totalEarnedIncome = transactions
    .filter((t) => t.type === 'income' && !isReceiveLend(t))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Total repayments received (offsets total expenses)
  const totalLoanRepaid = transactions
    .filter((t) => t.type === 'income' && isReceiveLend(t))
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalNetExpense = Math.max(0, totalAllExpense - totalLoanRepaid);

  // Current Month:
  // 1. Monthly earned income (excluding 'Receive Lend')
  const monthEarnedIncome = monthTxns
    .filter((t) => t.type === 'income' && !isReceiveLend(t))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 2. Monthly gross expenses (includes any 'Lend' expenses)
  const monthGrossExpense = monthTxns
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 3. Monthly 'Receive Lend' repayments received (offsets monthly expenses)
  const monthLoanRepaid = monthTxns
    .filter((t) => t.type === 'income' && isReceiveLend(t))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // 4. Net Monthly Expense (Gross Expense minus repayments received)
  const monthNetExpense = Math.max(0, monthGrossExpense - monthLoanRepaid);

  // 5. Month net wallet flow (total money in minus total money out this month)
  const monthGrossIncome = monthTxns
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthBalance = monthGrossIncome - monthGrossExpense;

  const totals = {
    income: totalEarnedIncome,
    expense: totalNetExpense,
    balance: totalBalance,
    savings: totalBalance,
    totalIncome: totalEarnedIncome,
    totalExpense: totalNetExpense,
    totalBalance,
    monthIncome: monthEarnedIncome,
    monthExpense: monthNetExpense,
    monthBalance,
  };

  const clearAllData = async () => {
    if (isDemo || !isSupabaseConfigured) {
      saveToLocal([]);
      return;
    }
    try {
      await supabase.from('transactions').delete().eq('user_id', user.id);
      setTransactions([]);
    } catch (err) {
      setError(err.message);
    }
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    transactions,
    loading,
    error,
    totals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    clearAllData,
    refetch: fetchTransactions,
  };
}
