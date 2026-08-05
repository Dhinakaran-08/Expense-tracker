import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { INITIAL_DEMO_BUDGETS } from '../lib/constants';

const STORAGE_KEY = 'expense_iq_budgets';

export function useBudgets() {
  const { user, isDemo } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (isDemo || !isSupabaseConfigured) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setBudgets(JSON.parse(stored));
        } catch {
          setBudgets(INITIAL_DEMO_BUDGETS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BUDGETS));
        }
      } else {
        setBudgets(INITIAL_DEMO_BUDGETS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_BUDGETS));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (fetchError) throw fetchError;
      setBudgets(data || []);
    } catch (err) {
      console.warn('Supabase budgets fetch fallback:', err);
      const stored = localStorage.getItem(STORAGE_KEY);
      setBudgets(stored ? JSON.parse(stored) : INITIAL_DEMO_BUDGETS);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const saveToLocal = (newBudgets) => {
    setBudgets(newBudgets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets));
  };

  const addBudget = async (budget) => {
    const newB = {
      id: 'b-' + Date.now(),
      user_id: user?.id || 'demo-user',
      ...budget,
    };

    if (isDemo || !isSupabaseConfigured) {
      const updated = [newB, ...budgets];
      saveToLocal(updated);
      return newB;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      setBudgets((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const updated = [newB, ...budgets];
      saveToLocal(updated);
      return newB;
    }
  };

  const updateBudget = async (id, updates) => {
    if (isDemo || !isSupabaseConfigured) {
      const updated = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveToLocal(updated);
      return updated.find((b) => b.id === id);
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      setBudgets((prev) => prev.map((b) => (b.id === id ? data : b)));
      return data;
    } catch (err) {
      const updated = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b));
      saveToLocal(updated);
      return updated.find((b) => b.id === id);
    }
  };

  const deleteBudget = async (id) => {
    if (isDemo || !isSupabaseConfigured) {
      const updated = budgets.filter((b) => b.id !== id);
      saveToLocal(updated);
      return;
    }

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      const updated = budgets.filter((b) => b.id !== id);
      saveToLocal(updated);
    }
  };

  const getBudgetsForMonth = useCallback(
    (month, year) => {
      return budgets.filter((b) => b.month === month && b.year === year);
    },
    [budgets]
  );

  return {
    budgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetsForMonth,
    refetch: fetchBudgets,
  };
}
