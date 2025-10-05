import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Target,
  PieChart,
  Activity,
  Plus,
  Eye,
  Calendar,
  CreditCard,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { InteractiveChart } from '../Charts/InteractiveChart';
import { formatCurrency, formatPercent } from '../../lib/formatters';

export const DashboardOverview: React.FC = () => {
  const { 
    transactions, 
    budgets, 
    goals, 
    portfolioHoldings,
    alerts, 
    user,
    loading,
    lastUpdate,
    getFinancialSummary,
    calculateCategorySpending,
    getBudgetStatus,
    calculatePortfolioValue,
    refreshAllData,
    aiInsights,
    marketData
  } = useApp();
  
  const navigate = useNavigate();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshAllData]);

  // Get comprehensive financial summary
  const financialSummary = getFinancialSummary();
  const portfolioValue = calculatePortfolioValue();
  
  // Real-time portfolio performance
  const portfolioGain = portfolioHoldings.reduce((sum, holding) => sum + holding.dayChange, 0);
  const portfolioGainPercent = portfolioValue > 0 ? (portfolioGain / portfolioValue) * 100 : 0;
  const totalGainLoss = portfolioHoldings.reduce((sum, holding) => sum + holding.totalGainLoss, 0);
  const totalGainLossPercent = portfolioValue > 0 ? (totalGainLoss / (portfolioValue - totalGainLoss)) * 100 : 0;

  // Budget performance with real-time calculations
  const budgetData = budgets.map(budget => {
    const spent = calculateCategorySpending(budget.category);
    const status = getBudgetStatus(budget.category);
    return {
      name: budget.category,
      value: spent,
      budget: budget.amount,
      percentage: status.percentage,
      color: status.isOverBudget ? '#EF4444' : spent > budget.amount * 0.8 ? '#F59E0B' : '#10B981'
    };
  }).filter(item => item.value > 0);

  // Goals progress with real-time updates
  const goalsProgress = goals.map(goal => ({
    name: goal.title,
    current: goal.current_amount,
    target: goal.target_amount,
    progress: (goal.current_amount / goal.target_amount) * 100,
    category: goal.category,
    target_date: goal.target_date,
    daysLeft: Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }));

  // Recent activity across all components
  const recentActivity = [
    ...transactions.slice(0, 3).map(t => ({
      id: t.id,
      type: 'transaction',
      title: t.description,
      subtitle: t.category,
      amount: t.amount,
      date: t.date,
      icon: t.type === 'income' ? TrendingUp : TrendingDown,
      color: t.type === 'income' ? 'text-green-600' : 'text-red-600'
    })),
    ...portfolioHoldings.slice(0, 2).map(h => ({
      id: h.id,
      type: 'portfolio',
      title: h.symbol,
      subtitle: h.name,
      amount: h.dayChange,
      date: h.lastUpdated,
      icon: Activity,
      color: h.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Unread alerts
  const unreadAlerts = alerts.filter(alert => !alert.is_read);

  // Key performance indicators
  const kpis = [
    {
      name: 'Net Worth',
      value: financialSummary.netWorth,
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: DollarSign,
      onClick: () => navigate('/budget'),
      description: 'Monthly income minus expenses',
      trend: [65, 68, 72, 70, 75, 78, 82, 85, 88, 92, 95, 98]
    },
    {
      name: 'Portfolio Value',
      value: portfolioValue,
      change: portfolioGain > 0 ? `+${formatPercent(portfolioGainPercent)}` : `${formatPercent(portfolioGainPercent)}`,
      changeType: portfolioGain > 0 ? 'increase' : 'decrease' as const,
      icon: Activity,
      onClick: () => navigate('/market'),
      description: 'Total investment value',
      trend: [45, 52, 48, 61, 55, 67, 69, 75, 78, 82, 85, portfolioValue / 1000]
    },
    {
      name: 'Savings Rate',
      value: `${formatPercent(financialSummary.savingsRate)}`,
      change: '+2.3%',
      changeType: 'increase' as const,
      icon: Target,
      onClick: () => navigate('/goals'),
      description: 'Percentage of income saved',
      trend: [15, 18, 16, 22, 25, 28, 24, 30, 32, 35, 38, financialSummary.savingsRate]
    },
    {
      name: 'Goals Progress',
      value: `${formatPercent(financialSummary.goalsProgress)}`,
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: Target,
      onClick: () => navigate('/goals'),
      description: 'Average progress across all goals',
      trend: [20, 25, 30, 28, 35, 40, 45, 50, 55, 60, 65, financialSummary.goalsProgress]
    }
  ];

  const handleChartClick = (data: any) => {
    if (data.name) {
      navigate(`/budget?category=${encodeURIComponent(data.name)}`);
    }
  };

  const handleRefresh = async () => {
    await refreshAllData();
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Header with Real-Time Status */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || 'Demo User'}!</h1>
              <p className="text-blue-100">
                Your financial ecosystem • Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-lg transition-all ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-white/10 text-white/70'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                <Zap className="h-5 w-5" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
                title="Refresh all data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Real-Time Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-blue-100 text-sm">Monthly Income</p>
              <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalIncome)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-blue-100 text-sm">Monthly Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalExpenses)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-blue-100 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioValue)}</p>
              <p className="text-xs text-blue-200 mt-1">
                Daily: {portfolioGain >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioGain))} ({formatPercent(portfolioGainPercent)})
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-blue-100 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold">{unreadAlerts.length}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/budget')}
              className="bg-white/10 backdrop-blur hover:bg-white/20 px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <PieChart className="h-5 w-5" />
              <span>Manage Budget</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/market')}
              className="bg-white/10 backdrop-blur hover:bg-white/20 px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Activity className="h-5 w-5" />
              <span>View Portfolio</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/advisory')}
              className="bg-white/10 backdrop-blur hover:bg-white/20 px-6 py-3 rounded-lg transition-all transform hover:scale-105 flex items-center space-x-2"
            >
              <Eye className="h-5 w-5" />
              <span>AI Insights</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.name}
              onClick={kpi.onClick}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg group-hover:shadow-lg transition-shadow">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.name}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {typeof kpi.value === 'string' ? kpi.value : formatCurrency(kpi.value)}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${
                    kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
                
                {/* Mini Trend Chart */}
                <div className="h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 20">
                    <polyline
                      fill="none"
                      stroke={kpi.changeType === 'increase' ? '#10B981' : '#EF4444'}
                      strokeWidth="2"
                      points={kpi.trend.map((value, index) => 
                        `${(index / (kpi.trend.length - 1)) * 100},${20 - (value / Math.max(...kpi.trend)) * 20}`
                      ).join(' ')}
                    />
                  </svg>
                </div>
                
                <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-Time Spending Analysis */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Spending Analysis</h2>
            <button
              onClick={() => navigate('/budget')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Manage Budget</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          {budgetData.length > 0 ? (
            <InteractiveChart
              type="pie"
              data={budgetData}
              onSegmentClick={handleChartClick}
              height={280}
              showLegend={true}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No spending data available</p>
                <button
                  onClick={() => navigate('/budget')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add transactions</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Goals Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Goals Progress</h2>
            <button
              onClick={() => navigate('/goals')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Manage Goals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          {goalsProgress.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {goalsProgress.map((goal, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/goals?goal=${encodeURIComponent(goal.name)}`)}
                  className="cursor-pointer group hover:bg-gray-50 p-3 rounded-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{goal.name}</span>
                      <p className="text-xs text-gray-500">{goal.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{formatPercent(goal.progress)}</span>
                      <p className="text-xs text-gray-400">
                        {goal.daysLeft > 0 ? `${goal.daysLeft} days left` : 'Overdue'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 group-hover:shadow-sm ${
                        goal.progress >= 100 ? 'bg-green-500' :
                        goal.progress >= 75 ? 'bg-blue-500' :
                        goal.progress >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No goals set yet</p>
                <button
                  onClick={() => navigate('/goals')}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create your first goal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Activity Feed and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cross-Component Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => navigate('/budget?view=transactions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'transaction' 
                          ? activity.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                          : 'bg-blue-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${activity.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">{activity.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${activity.color}`}>
                        {activity.type === 'transaction'
                          ? `${activity.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(activity.amount))}`
                          : `${activity.amount > 0 ? '+' : ''}${formatPercent(Math.abs(activity.amount))}`
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              {aiInsights.length > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {aiInsights.length} active
                </span>
              )}
            </div>
            <button
              onClick={() => navigate('/advisory')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          {aiInsights.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {aiInsights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  onClick={() => navigate('/advisory')}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all border border-gray-100"
                >
                  <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{insight.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.confidence >= 0.8
                          ? 'bg-green-100 text-green-800'
                          : insight.confidence >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {formatPercent(insight.confidence * 100)} confidence
                      </span>
                      <p className="text-xs text-gray-400">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <Eye className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No AI insights available</p>
                <button
                  onClick={() => navigate('/advisory')}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Generate insights
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions with Cross-Component Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/budget')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
          >
            <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Add Transaction</p>
            <p className="text-xs text-gray-500 mt-1">Update budget instantly</p>
          </button>
          <button
            onClick={() => navigate('/market')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
          >
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Add Investment</p>
            <p className="text-xs text-gray-500 mt-1">Sync with portfolio</p>
          </button>
          <button
            onClick={() => navigate('/goals')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
          >
            <Target className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Set Goal</p>
            <p className="text-xs text-gray-500 mt-1">Auto-track progress</p>
          </button>
          <button
            onClick={() => navigate('/advisory')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group"
          >
            <Eye className="h-8 w-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-gray-900">Get AI Advice</p>
            <p className="text-xs text-gray-500 mt-1">Based on live data</p>
          </button>
        </div>
      </div>
    </div>
  );
};