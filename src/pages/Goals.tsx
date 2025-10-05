import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Target, Plus, CreditCard as Edit3, Trash2, Calendar, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Save, X, Zap, RefreshCw, Activity, PieChart, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { InteractiveChart } from '../components/Charts/InteractiveChart';
import { useToast } from '../components/Toast/ToastContainer';
import { formatCurrency, formatPercent } from '../lib/formatters';

export default function Goals() {
  const {
    goals,
    budgets,
    portfolioHoldings,
    transactions,
    aiInsights,
    user,
    loading,
    lastUpdate,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshAllData,
    syncDataAcrossComponents,
    calculateCategorySpending,
    calculatePortfolioValue,
    getFinancialSummary
  } = useApp();

  const toast = useToast();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState(searchParams.get('goal') || 'all');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [autoSync, setAutoSync] = useState(true);

  // Goal form state
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: ''
  });

  const [editingGoal, setEditingGoal] = useState<any>(null);

  // Default categories for goals
  const defaultCategories = [
    'Emergency Fund',
    'Vacation',
    'Investment Growth',
    'Retirement Investment',
    'Stock Portfolio',
    'Crypto Investment',
    'Education',
    'Home Purchase',
    'Car Purchase',
    'Retirement',
    'Debt Payoff',
    'Wedding',
    'Business'
  ];

  // Auto-sync with other components
  useEffect(() => {
    if (!autoSync) return;
    
    const interval = setInterval(() => {
      refreshAllData();
      updateGoalProgressFromOtherComponents();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoSync, refreshAllData]);

  // Update goal progress based on budget savings and portfolio gains
  const updateGoalProgressFromOtherComponents = async () => {
    const financialSummary = getFinancialSummary();
    const portfolioValue = calculatePortfolioValue();
    const monthlySavings = Math.max(0, financialSummary.totalIncome - financialSummary.totalExpenses);
    
    // Auto-update goals based on category
    for (const goal of goals) {
      let additionalProgress = 0;
      
      // Emergency fund gets 30% of monthly savings
      if (goal.category.toLowerCase().includes('emergency')) {
        additionalProgress = monthlySavings * 0.3;
      }
      
      // Investment goals get 10% of portfolio gains
      if (goal.category.toLowerCase().includes('investment')) {
        const portfolioGains = portfolioHoldings.reduce((sum, h) => sum + h.totalGainLoss, 0);
        additionalProgress = Math.max(0, portfolioGains * 0.1);
      }
      
      // Vacation and other goals get 20% of monthly savings
      if (goal.category.toLowerCase().includes('vacation') || 
          goal.category.toLowerCase().includes('car') ||
          goal.category.toLowerCase().includes('wedding')) {
        additionalProgress = monthlySavings * 0.2;
      }
      
      // Update goal if there's progress
      if (additionalProgress > 0) {
        const newAmount = Math.min(goal.current_amount + additionalProgress, goal.target_amount);
        if (newAmount > goal.current_amount) {
          await updateGoal(goal.id, { current_amount: newAmount });
        }
      }
    }
  };

  // Calculate goal metrics
  const goalMetrics = goals.map(goal => {
    const progress = (goal.current_amount / goal.target_amount) * 100;
    const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const monthsLeft = Math.ceil(daysLeft / 30);
    const monthlyNeeded = monthsLeft > 0 ? (goal.target_amount - goal.current_amount) / monthsLeft : 0;
    
    return {
      ...goal,
      progress,
      daysLeft,
      monthsLeft,
      monthlyNeeded,
      isOnTrack: progress >= (100 - (daysLeft / 365) * 100),
      isCompleted: progress >= 100
    };
  });

  // Chart data for goal progress
  const goalChartData = goalMetrics.map(goal => ({
    name: goal.title,
    current: goal.current_amount,
    target: goal.target_amount,
    progress: goal.progress,
    color: goal.isCompleted ? '#10B981' : goal.isOnTrack ? '#3B82F6' : '#EF4444'
  }));

  // Category breakdown
  const categoryBreakdown = defaultCategories.map(category => {
    const categoryGoals = goalMetrics.filter(g => g.category === category);
    const totalTarget = categoryGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrent = categoryGoals.reduce((sum, g) => sum + g.current_amount, 0);
    
    return {
      name: category,
      value: totalCurrent,
      target: totalTarget,
      count: categoryGoals.length,
      progress: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
    };
  }).filter(item => item.count > 0);

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      description: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      category: ''
    });
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title || !goalForm.target_amount || !goalForm.target_date || !goalForm.category) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        user_id: user!.id,
        title: goalForm.title,
        description: goalForm.description,
        target_amount: parseFloat(goalForm.target_amount),
        current_amount: parseFloat(goalForm.current_amount) || 0,
        target_date: goalForm.target_date,
        category: goalForm.category
      };
      
      // If it's an investment goal, sync with portfolio
      if (goalForm.category.toLowerCase().includes('investment')) {
        const portfolioValue = calculatePortfolioValue();
        if (portfolioValue > 0) {
          goalData.current_amount = Math.max(goalData.current_amount, portfolioValue * 0.1); // Start with 10% of portfolio
        }
      }
      
      await addGoal(goalData);

      resetGoalForm();
      setShowAddGoal(false);
      toast.success('Goal added successfully');
      await syncDataAcrossComponents('goals', { action: 'add' });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal. Please try again.');
    }
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !goalForm.title || !goalForm.target_amount || !goalForm.target_date || !goalForm.category) {
      toast.warning('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        title: goalForm.title,
        description: goalForm.description,
        target_amount: parseFloat(goalForm.target_amount),
        current_amount: parseFloat(goalForm.current_amount) || 0,
        target_date: goalForm.target_date,
        category: goalForm.category
      };
      
      // If it's an investment goal, sync with portfolio
      if (goalForm.category.toLowerCase().includes('investment')) {
        const portfolioValue = calculatePortfolioValue();
        const portfolioGains = portfolioHoldings.reduce((sum, h) => sum + h.totalGainLoss, 0);
        
        // Update current amount based on portfolio performance
        if (portfolioValue > 0) {
          updateData.current_amount = Math.max(updateData.current_amount, portfolioValue * 0.1 + Math.max(0, portfolioGains * 0.1));
        }
      }
      
      await updateGoal(editingGoal.id, updateData);

      resetGoalForm();
      setShowEditGoal(null);
      setEditingGoal(null);
      toast.success('Goal updated successfully');
      await syncDataAcrossComponents('goals', { action: 'update', id: editingGoal.id });
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      setShowDeleteConfirm(null);
      toast.success('Goal deleted successfully');
      await syncDataAcrossComponents('goals', { action: 'delete', id });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal. Please try again.');
    }
  };

  const openEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date,
      category: goal.category
    });
    setShowEditGoal(goal.id);
  };

  const handleRefresh = async () => {
    await refreshAllData();
    await updateGoalProgressFromOtherComponents();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your goals...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
            <p className="text-gray-600 mt-1">
              Track progress with real-time updates from budget and portfolio • Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
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
              onClick={() => setShowAddGoal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Goal</span>
            </button>
          </div>
        </div>

        {/* Goals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {goalMetrics.filter(g => g.isCompleted).length} completed
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(goals.reduce((sum, g) => sum + g.target_amount, 0))}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Across all goals</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Progress</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(goals.reduce((sum, g) => sum + g.current_amount, 0))}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {goals.length > 0 ? formatPercent((goals.reduce((sum, g) => sum + g.current_amount, 0) / goals.reduce((sum, g) => sum + g.target_amount, 0)) * 100) : '0%'} complete
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-orange-600">
                  {goalMetrics.filter(g => g.isOnTrack && !g.isCompleted).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {goalMetrics.filter(g => !g.isOnTrack && !g.isCompleted).length} need attention
            </p>
          </div>
        </div>

        {/* Cross-Component Insights */}
        {aiInsights.filter(i => i.type === 'goal_adjustment').length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              AI Goal Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiInsights.filter(i => i.type === 'goal_adjustment').slice(0, 2).map(insight => (
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

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Goal Progress Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress Overview</h3>
            {goalChartData.length > 0 ? (
              <InteractiveChart
                type="bar"
                data={goalChartData.map(goal => ({
                  name: goal.name,
                  Current: goal.current,
                  Target: goal.target,
                  color: goal.color
                }))}
                height={300}
                showLegend={true}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No goals to display</p>
                </div>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Category</h3>
            {categoryBreakdown.length > 0 ? (
              <InteractiveChart
                type="pie"
                data={categoryBreakdown}
                height={300}
                showLegend={true}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
            <div className="text-sm text-gray-500">
              {goalMetrics.length} goal{goalMetrics.length !== 1 ? 's' : ''} active
            </div>
          </div>

          {goalMetrics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goalMetrics.map((goal) => (
                <div
                  key={goal.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-all group relative"
                >
                  {/* Goal Status Indicator */}
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                    goal.isCompleted ? 'bg-green-500' :
                    goal.isOnTrack ? 'bg-blue-500' :
                    'bg-red-500'
                  }`} />

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{goal.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {goal.category}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-medium ${
                        goal.isCompleted ? 'text-green-600' :
                        goal.isOnTrack ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {formatPercent(goal.progress)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.isCompleted ? 'bg-green-500' :
                          goal.isOnTrack ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{formatCurrency(goal.current_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-medium">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium">
                        {formatCurrency(goal.target_amount - goal.current_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Date:</span>
                      <span className="font-medium">
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Needed:</span>
                      <span className={`font-medium ${
                        goal.monthlyNeeded > 1000 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(goal.monthlyNeeded)}
                      </span>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mt-4 p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      {goal.isCompleted ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700 font-medium">Goal Completed!</span>
                        </>
                      ) : goal.isOnTrack ? (
                        <>
                          <TrendingUp className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-700 font-medium">On Track</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700 font-medium">Needs Attention</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {goal.daysLeft > 0 ? `${goal.daysLeft} days remaining` : 'Past target date'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditGoal(goal)}
                      className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit3 className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm({ id: goal.id, name: goal.title })}
                      className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No financial goals set yet</p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Goal Modal */}
        {(showAddGoal || showEditGoal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showAddGoal ? 'Add New Goal' : 'Edit Goal'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setShowEditGoal(null);
                    setEditingGoal(null);
                    resetGoalForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={showAddGoal ? handleAddGoal : handleEditGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title *</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={goalForm.description}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your goal..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={goalForm.category}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    required
                  >
                    <option value="">Select a category</option>
                    {defaultCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {goalForm.category.toLowerCase().includes('investment') && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Investment Goal:</strong> This goal will automatically sync with your portfolio performance.
                      </p>
                      <div className="text-xs text-blue-600">
                        <p>• Current portfolio value: {formatCurrency(calculatePortfolioValue())}</p>
                        <p>• Portfolio gains: {formatCurrency(portfolioHoldings.reduce((sum, h) => sum + h.totalGainLoss, 0))}</p>
                        <p>• Goal progress will update with market changes</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    value={goalForm.category}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Or enter a custom category"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={goalForm.target_amount}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, target_amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={goalForm.current_amount}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, current_amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
                  <input
                    type="date"
                    value={goalForm.target_date}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGoal(false);
                      setShowEditGoal(null);
                      setEditingGoal(null);
                      resetGoalForm();
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
                    <span>{loading ? 'Saving...' : (showAddGoal ? 'Add' : 'Update')} Goal</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
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
                    <p className="font-medium text-gray-900">Delete Goal</p>
                    <p className="text-sm text-gray-600">{showDeleteConfirm.name}</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Are you sure you want to delete this goal? This action cannot be undone and will remove all progress tracking.
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
                  onClick={() => handleDeleteGoal(showDeleteConfirm.id)}
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
}