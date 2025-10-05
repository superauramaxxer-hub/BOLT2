import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PlusCircle, TrendingUp, TrendingDown, AlertTriangle, CreditCard as Edit3, Trash2, Filter, Calendar, DollarSign, Save, X, Eye, EyeOff, Zap, RefreshCw, Target } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { InteractiveChart } from '../components/Charts/InteractiveChart';
import { useToast } from '../components/Toast/ToastContainer';
import { formatCurrency, formatPercent } from '../lib/formatters';

export default function Budget() {
  const {
    transactions,
    budgets,
    goals,
    portfolioHoldings,
    aiInsights,
    lastUpdate,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    calculateCategorySpending,
    getBudgetStatus,
    loading,
    setLoading,
    refreshAllData,
    syncDataAcrossComponents
  } = useApp();

  const toast = useToast();
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>(
    (searchParams.get('type') as 'all' | 'income' | 'expense') || 'all'
  );
  const [viewMode, setViewMode] = useState<'overview' | 'transactions' | 'budgets'>('overview');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEditTransaction, setShowEditTransaction] = useState<string | null>(null);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'transaction' | 'budget', id: string, name: string} | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  // Default categories for transactions and budgets
  const defaultCategories = ['Food', 'Transportation', 'Dining', 'Shopping', 'Investment', 'Housing', 'Health', 'Entertainment', 'Utilities', 'Insurance'];

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    amount: '',
    month: new Date().toLocaleDateString('en-US', { month: 'long' }),
    year: new Date().getFullYear()
  });

  // Editing states
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  // Auto-refresh data every 30 seconds to ensure real-time sync
  useEffect(() => {
    if (!autoSync) return;
    
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSync, refreshAllData]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get all unique categories from transactions and budgets
  const allCategories = Array.from(new Set([
    ...defaultCategories,
    ...transactions.map(t => t.category),
    ...budgets.map(b => b.category)
  ])).sort();

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    if (transactionDate.getMonth() !== currentMonth || transactionDate.getFullYear() !== currentYear) {
      return false;
    }
    if (selectedCategory !== 'all' && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedType !== 'all' && t.type !== selectedType) {
      return false;
    }
    return true;
  });

  // Calculate totals with real-time updates
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netWorth = totalIncome - totalExpenses;

  // Budget overview data with real-time calculations
  const budgetData = budgets.map(budget => {
    const spent = calculateCategorySpending(budget.category);
    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent,
      remaining,
      percentage,
      isOverBudget: spent > budget.amount
    };
  });

  // Chart data for spending by category with enhanced tooltips
  const categorySpending = budgetData
    .filter(budget => budget.spent > 0)
    .map(budget => ({
      name: budget.category,
      value: budget.spent,
      budget: budget.amount,
      percentage: budget.percentage,
      color: budget.isOverBudget ? '#EF4444' : budget.percentage > 80 ? '#F59E0B' : '#10B981'
    }));

  // Reset forms
  const resetTransactionForm = () => {
    setTransactionForm({
      amount: '',
      description: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      category: '',
      amount: '',
      month: new Date().toLocaleDateString('en-US', { month: 'long' }),
      year: new Date().getFullYear()
    });
  };

  // Handle transaction operations with real-time updates
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.amount || !transactionForm.description || !transactionForm.category) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(transactionForm.amount);
      
      await addTransaction({
        user_id: '1',
        amount: transactionForm.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        description: transactionForm.description,
        category: transactionForm.category,
        type: transactionForm.type,
        date: transactionForm.date
      });

      resetTransactionForm();
      setShowAddTransaction(false);
      toast.success('Transaction added successfully');

      await syncDataAcrossComponents('budget', { action: 'addTransaction' });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !transactionForm.amount || !transactionForm.description || !transactionForm.category) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(transactionForm.amount);
      
      await updateTransaction(editingTransaction.id, {
        amount: transactionForm.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        description: transactionForm.description,
        category: transactionForm.category,
        type: transactionForm.type,
        date: transactionForm.date
      });

      resetTransactionForm();
      setShowEditTransaction(null);
      setEditingTransaction(null);
      toast.success('Transaction updated successfully');

      await syncDataAcrossComponents('budget', { action: 'updateTransaction', id: editingTransaction.id });
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setLoading(true);
    try {
      await deleteTransaction(id);
      setShowDeleteConfirm(null);
      toast.success('Transaction deleted successfully');

      await syncDataAcrossComponents('budget', { action: 'deleteTransaction', id });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle budget operations with real-time updates
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.amount) {
      toast.warning('Please fill in all required fields');
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => 
      b.category.toLowerCase() === budgetForm.category.toLowerCase() &&
      b.month === budgetForm.month &&
      b.year === budgetForm.year
    );

    if (existingBudget) {
      toast.warning(`A budget for ${budgetForm.category} already exists for ${budgetForm.month} ${budgetForm.year}`);
      return;
    }

    setLoading(true);
    try {
      await addBudget({
        user_id: '1',
        category: budgetForm.category,
        amount: parseFloat(budgetForm.amount),
        spent: calculateCategorySpending(budgetForm.category),
        month: budgetForm.month,
        year: budgetForm.year
      });

      resetBudgetForm();
      setShowAddBudget(false);
      toast.success('Budget added successfully');

      await syncDataAcrossComponents('budget', { action: 'addBudget' });
    } catch (error) {
      console.error('Error adding budget:', error);
      toast.error('Failed to add budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget || !budgetForm.category || !budgetForm.amount) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateBudget(editingBudget.id, {
        category: budgetForm.category,
        amount: parseFloat(budgetForm.amount),
        month: budgetForm.month,
        year: budgetForm.year
      });

      resetBudgetForm();
      setShowEditBudget(null);
      setEditingBudget(null);
      toast.success('Budget updated successfully');

      await syncDataAcrossComponents('budget', { action: 'updateBudget', id: editingBudget.id });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setLoading(true);
    try {
      await deleteBudget(id);
      setShowDeleteConfirm(null);
      toast.success('Budget deleted successfully');

      await syncDataAcrossComponents('budget', { action: 'deleteBudget', id });
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modals with pre-filled data
  const openEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date
    });
    setShowEditTransaction(transaction.id);
  };

  const openEditBudget = (budget: any) => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year
    });
    setShowEditBudget(budget.id);
  };

  const handleChartClick = (data: any) => {
    setSelectedCategory(data.name);
    setViewMode('transactions');
  };

  const handleRefresh = async () => {
    await refreshAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-gray-600 mt-1">
              Real-time budget management • Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`p-2 rounded-lg transition-all ${
                autoSync 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              title={autoSync ? 'Auto-sync enabled' : 'Auto-sync disabled'}
            >
              <Zap className="h-5 w-5" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => setShowAddBudget(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Add Budget</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-200 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'transactions', name: 'Transactions' },
            { id: 'budgets', name: 'Budgets' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <>
            {/* Enhanced Real-time Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all transform hover:scale-105"
                onClick={() => {
                  setSelectedType('income');
                  setViewMode('transactions');
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to view income transactions</p>
              </div>

              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all transform hover:scale-105"
                onClick={() => {
                  setSelectedType('expense');
                  setViewMode('transactions');
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to view expense transactions</p>
              </div>

              <div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all transform hover:scale-105"
                onClick={() => setViewMode('budgets')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Worth</p>
                    <p className={`text-2xl font-bold ${
                      netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(netWorth)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to manage budgets</p>
              </div>
            </div>
            
            {/* Cross-Component Insights */}
            {aiInsights.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  AI Budget Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.slice(0, 2).map(insight => (
                    <div key={insight.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.content}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.confidence >= 0.8
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formatPercent(insight.confidence * 100)} confidence
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts with Enhanced Interactivity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Enhanced Spending by Category Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                {categorySpending.length > 0 ? (
                  <InteractiveChart
                    type="pie"
                    data={categorySpending}
                    onSegmentClick={handleChartClick}
                    height={300}
                    showLegend={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <PlusCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No spending data available</p>
                      <button
                        onClick={() => setShowAddTransaction(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Add your first transaction
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Real-time Budget Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
                {budgetData.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {budgetData.map((budget, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedCategory(budget.category);
                          setViewMode('transactions');
                        }}
                        className="cursor-pointer group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                            </span>
                            {budget.isOverBudget && (
                              <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">Over Budget!</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              budget.isOverBudget
                                ? 'bg-red-500' 
                                : budget.percentage > 80 
                                  ? 'bg-yellow-500' 
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className={`font-medium ${
                            budget.isOverBudget ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {formatPercent(budget.percentage)} used
                          </span>
                          <span className={`${
                            budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(Math.abs(budget.remaining))} {budget.remaining >= 0 ? 'remaining' : 'over'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No budgets set up yet</p>
                      <button
                        onClick={() => setShowAddBudget(true)}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Create your first budget
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Goal Impact Visualization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Impact on Goals</h3>
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.slice(0, 3).map(goal => {
                      const progress = (goal.current_amount / goal.target_amount) * 100;
                      const monthlyContribution = calculateMonthlySavings() * 0.2; // 20% to goals
                      return (
                        <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                            <p className="text-xs text-gray-500">+{formatCurrency(monthlyContribution)}/month from budget</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{formatPercent(progress)}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(goal.current_amount)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Set goals to see budget impact</p>
                    <button
                      onClick={() => navigate('/goals')}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Create goals
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Transactions Mode with Full CRUD */}
        {viewMode === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Enhanced Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                </select>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedType('all');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
                <div className="ml-auto text-sm text-gray-500">
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                </div>
              </div>
            </div>

            {/* Transaction List with CRUD Actions */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found for the selected criteria.</p>
                    <button
                      onClick={() => setShowAddTransaction(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add your first transaction
                    </button>
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg group transition-colors border border-gray-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-6 w-6 text-green-600" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditTransaction(transaction)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit transaction"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm({
                              type: 'transaction', 
                              id: transaction.id, 
                              name: transaction.description
                            })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budgets Mode with Full CRUD */}
        {viewMode === 'budgets' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Manage Budgets</h3>
              <div className="text-sm text-gray-500">
                {budgetData.length} budget{budgetData.length !== 1 ? 's' : ''} active
              </div>
            </div>

            {budgetData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgetData.map((budget) => (
                  <div key={budget.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{budget.category}</h4>
                        <p className="text-xs text-gray-500">{budget.month} {budget.year}</p>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditBudget(budget)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit budget"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({
                            type: 'budget', 
                            id: budget.id, 
                            name: `${budget.category} budget`
                          })}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium">{formatCurrency(budget.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent:</span>
                        <span className={`font-medium ${
                          budget.isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(budget.spent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className={`font-medium ${
                          budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(Math.abs(budget.remaining))} {budget.remaining >= 0 ? '' : 'over'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            budget.isOverBudget
                              ? 'bg-red-500' 
                              : budget.percentage > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatPercent(budget.percentage)} used
                        </p>
                        {budget.isOverBudget && (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600 font-medium">Over Budget</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No budgets created yet</p>
                <button
                  onClick={() => setShowAddBudget(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create Your First Budget
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Add/Edit Transaction Modal */}
        {(showAddTransaction || showEditTransaction) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAddTransaction ? 'Add Transaction' : 'Edit Transaction'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddTransaction(false);
                    setShowEditTransaction(null);
                    setEditingTransaction(null);
                    resetTransactionForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={showAddTransaction ? handleAddTransaction : handleEditTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grocery shopping"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    required
                  >
                    <option value="">Select a category</option>
                    {defaultCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Or enter a custom category"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTransaction(false);
                      setShowEditTransaction(null);
                      setEditingTransaction(null);
                      resetTransactionForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : (showAddTransaction ? 'Add' : 'Update')} Transaction</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Add/Edit Budget Modal */}
        {(showAddBudget || showEditBudget) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAddBudget ? 'Add Budget' : 'Edit Budget'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddBudget(false);
                    setShowEditBudget(null);
                    setEditingBudget(null);
                    resetBudgetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={showAddBudget ? handleAddBudget : handleEditBudget} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    required
                  >
                    <option value="">Select a category</option>
                    {defaultCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Or enter a custom category"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={budgetForm.month}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const date = new Date(2024, i, 1);
                        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
                        return (
                          <option key={monthName} value={monthName}>{monthName}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      value={budgetForm.year}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>{year}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBudget(false);
                      setShowEditBudget(null);
                      setEditingBudget(null);
                      resetBudgetForm();
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : (showAddBudget ? 'Add' : 'Update')} Budget</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delete {showDeleteConfirm.type}</p>
                    <p className="text-sm text-gray-600">{showDeleteConfirm.name}</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to delete this {showDeleteConfirm.type}? This action cannot be undone and will immediately update all related charts and calculations.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.type === 'transaction') {
                      handleDeleteTransaction(showDeleteConfirm.id);
                    } else {
                      handleDeleteBudget(showDeleteConfirm.id);
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{loading ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  // Helper function to calculate monthly savings
  function calculateMonthlySavings() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return Math.max(0, income - expenses);
  }
}