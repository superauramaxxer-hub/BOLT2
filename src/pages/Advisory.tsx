import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle, X, CreditCard as Edit3, Trash2, Plus, RefreshCw, MessageCircle, Send, ChevronDown, ChevronUp, PieChart, BarChart3, LineChart, Lightbulb, Shield, CreditCard, Wallet, TrendingUp as TrendingUpIcon, Calendar, Calculator, FileText, Download, Save, Eye, EyeOff, Zap, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { InteractiveChart } from '../components/Charts/InteractiveChart';
import { AdvisoryService, Insight, FinancialPlan, ChatMessage } from '../lib/advisoryService';

interface RecommendationCard {
  id: string;
  type: 'budget_optimization' | 'savings_opportunity' | 'debt_reduction' | 'investment_advice' | 'emergency_fund' | 'goal_adjustment';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  data?: any;
  actionable: boolean;
  dismissed: boolean;
  accepted: boolean;
  created_at: string;
}

export default function Advisory() {
  const { 
    transactions, 
    budgets, 
    goals, 
    portfolioHoldings,
    marketData,
    aiInsights,
    user, 
    loading, 
    setLoading,
    refreshAllData,
    syncDataAcrossComponents,
    calculateCategorySpending,
    getFinancialSummary,
    calculatePortfolioValue,
    lastUpdate
  } = useApp();

  // State management
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);
  const [financialPlan, setFinancialPlan] = useState<FinancialPlan | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FinancialPlan | null>(null);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);
  const [realTimeMode, setRealTimeMode] = useState(true);

  // Initialize advisory service and load data
  useEffect(() => {
    loadAdvisoryData();
    
    // Real-time insights generation
    if (realTimeMode) {
      const interval = setInterval(() => {
        if (!isAnalyzing) {
          generateNewInsights();
        }
      }, 60000); // Every minute in real-time mode

      return () => clearInterval(interval);
    }
  }, [realTimeMode]);

  // Trigger analysis when data changes
  useEffect(() => {
    if (realTimeMode && (transactions.length > 0 || budgets.length > 0 || goals.length > 0 || portfolioHoldings.length > 0)) {
      generateNewInsights();
    }
  }, [transactions, budgets, goals, portfolioHoldings, marketData, realTimeMode]);

  const loadAdvisoryData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [insightsData, planData, chatData] = await Promise.all([
        AdvisoryService.getInsights(user.id),
        AdvisoryService.getFinancialPlan(user.id),
        AdvisoryService.getChatHistory(user.id)
      ]);

      setInsights(insightsData);
      setFinancialPlan(planData);
      setChatMessages(chatData);
      
      // Convert insights to recommendations
      const recs = insightsData.map(insight => ({
        id: insight.id,
        type: insight.type as any,
        title: insight.title,
        description: insight.content,
        impact: insight.priority === 1 ? 'high' : insight.priority === 2 ? 'medium' : 'low' as any,
        priority: insight.priority,
        data: insight.data,
        actionable: insight.actionable,
        dismissed: insight.dismissed,
        accepted: insight.accepted,
        created_at: insight.created_at
      }));
      
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading advisory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    if (!user || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      // Analyze current financial data
      const analysisData = {
        transactions,
        budgets,
        goals,
        portfolioHoldings,
        marketData,
        timeframe: selectedTimeframe
      };

      const newInsights = await AdvisoryService.generateInsights(user.id, analysisData);
      
      // Update state with new insights
      setInsights(newInsights);
      
      const recs = newInsights.map(insight => ({
        id: insight.id,
        type: insight.type as any,
        title: insight.title,
        description: insight.content,
        impact: insight.priority === 1 ? 'high' : insight.priority === 2 ? 'medium' : 'low' as any,
        priority: insight.priority,
        data: insight.data,
        actionable: insight.actionable,
        dismissed: insight.dismissed,
        accepted: insight.accepted,
        created_at: insight.created_at
      }));
      
      setRecommendations(recs);
      setLastAnalysisTime(new Date());
      
      // Generate or update financial plan
      if (!financialPlan) {
        await generateFinancialPlan();
      }
      
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFinancialPlan = async () => {
    if (!user) return;
    
    try {
      const planData = {
        transactions,
        budgets,
        goals,
        portfolioHoldings,
        marketData,
        timeframe: selectedTimeframe
      };

      const newPlan = await AdvisoryService.generateFinancialPlan(user.id, planData);
      setFinancialPlan(newPlan);
    } catch (error) {
      console.error('Error generating financial plan:', error);
    }
  };

  const handleRecommendationAction = async (id: string, action: 'accept' | 'dismiss' | 'edit' | 'delete') => {
    try {
      await AdvisoryService.updateInsight(id, { 
        [action === 'accept' ? 'accepted' : 'dismissed']: true 
      });
      
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id 
            ? { ...rec, [action === 'accept' ? 'accepted' : 'dismissed']: true }
            : rec
        )
      );
      
      if (action === 'delete') {
        await AdvisoryService.deleteInsight(id);
        setRecommendations(prev => prev.filter(rec => rec.id !== id));
      }
    } catch (error) {
      console.error(`Error ${action}ing recommendation:`, error);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      message: chatInput.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAnalyzing(true);

    try {
      // Get AI response based on current financial data
      const response = await AdvisoryService.getChatResponse(user.id, chatInput.trim(), {
        transactions,
        budgets,
        goals
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        message: response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handlePlanEdit = async (updates: Partial<FinancialPlan>) => {
    if (!financialPlan || !user) return;

    try {
      const updatedPlan = await AdvisoryService.updateFinancialPlan(financialPlan.id, updates);
      setFinancialPlan(updatedPlan);
      setShowPlanEditor(false);
      setEditingPlan(null);
    } catch (error) {
      console.error('Error updating financial plan:', error);
    }
  };

  const handleRefresh = async () => {
    await refreshAllData();
    await generateNewInsights();
  };

  // Calculate key metrics for insights
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'income' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  // Get comprehensive financial summary
  const financialSummary = getFinancialSummary();
  const portfolioValue = calculatePortfolioValue();

  // Prepare chart data
  const spendingTrends = budgets.map(budget => ({
    name: budget.category,
    budget: budget.amount,
    spent: calculateCategorySpending(budget.category),
    remaining: Math.max(0, budget.amount - calculateCategorySpending(budget.category))
  }));

  const savingsProjection = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(2024, i).toLocaleDateString('en-US', { month: 'short' }),
    projected: (monthlyIncome - monthlyExpenses) * (i + 1),
    actual: i <= currentMonth ? (monthlyIncome - monthlyExpenses) * (i + 1) : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your financial data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span>AI Financial Advisor</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time AI insights across all your financial data • Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setRealTimeMode(!realTimeMode)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                realTimeMode 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Zap className="h-5 w-5" />
              <span>{realTimeMode ? 'Real-time' : 'Manual'}</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Refresh All'}</span>
            </button>
            <button
              onClick={() => setShowPlanEditor(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span>Financial Plan</span>
            </button>
          </div>
        </div>

        {/* Enhanced Real-Time Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {financialSummary.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${savingsRate >= 20 ? 'bg-green-100' : savingsRate >= 10 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-6 w-6 ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {savingsRate >= 20 ? 'Excellent!' : savingsRate >= 10 ? 'Good progress' : 'Needs improvement'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className={`text-2xl font-bold ${financialSummary.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${financialSummary.netWorth.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-full ${financialSummary.netWorth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-6 w-6 ${financialSummary.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total financial position</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${portfolioValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {portfolioHoldings.length} holdings
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Insights</p>
                <p className="text-2xl font-bold text-orange-600">{aiInsights.length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Lightbulb className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {aiInsights.filter(i => i.confidence >= 0.8).length} high confidence
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendations Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('recommendations')}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    <span>Real-Time AI Insights</span>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {aiInsights.length} active
                    </span>
                    {realTimeMode && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Live
                      </span>
                    )}
                  </h2>
                  {expandedSections.has('recommendations') ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.has('recommendations') && (
                <div className="p-6">
                  {aiInsights.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-4">No AI insights available yet</p>
                      <button
                        onClick={generateNewInsights}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Analyze your financial data
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiInsights
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((insight) => (
                        <div
                          key={insight.id}
                          className="border rounded-lg p-4 transition-all border-gray-200 bg-white hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="p-1 rounded-full bg-purple-100">
                                  <Brain className="h-4 w-4 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  insight.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                                  insight.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {(insight.confidence * 100).toFixed(0)}% confidence
                                </span>
                              </div>
                              <p className="text-gray-700 mb-3">{insight.content}</p>
                              
                              <p className="text-xs text-gray-500">
                                {new Date(insight.timestamp).toLocaleString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  // Navigate to relevant section based on insight type
                                  if (insight.type === 'daily_summary') navigate('/market');
                                  else if (insight.type === 'risk_analysis') navigate('/market');
                                  else navigate('/budget');
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Analytics Charts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div 
                className="p-6 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('analytics')}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    <span>Financial Analytics</span>
                  </h2>
                  {expandedSections.has('analytics') ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.has('analytics') && (
                <div className="p-6 space-y-8">
                  {/* Spending vs Budget */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Budget Performance</h3>
                    {spendingTrends.length > 0 ? (
                      <InteractiveChart
                        type="bar"
                        data={spendingTrends.map(item => ({
                          name: item.name,
                          Budget: item.budget,
                          Spent: item.spent,
                          Remaining: item.remaining
                        }))}
                        height={300}
                        showLegend={true}
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No budget data available</p>
                      </div>
                    )}
                  </div>

                  {/* Savings Projection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dynamic Savings Projection</h3>
                    <InteractiveChart
                      type="line"
                      data={savingsProjection}
                      height={300}
                      showLegend={true}
                    />
                  </div>
                  
                  {/* Portfolio Impact on Financial Health */}
                  {portfolioHoldings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Impact Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Portfolio Value</p>
                          <p className="text-2xl font-bold text-green-600">${portfolioValue.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {((portfolioValue / financialSummary.netWorth) * 100).toFixed(1)}% of net worth
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Monthly Contribution</p>
                          <p className="text-2xl font-bold text-purple-600">
                            ${(financialSummary.netWorth * 0.1).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Recommended 10% allocation</p>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Risk Level</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {portfolioHoldings.length > 5 ? 'Low' : portfolioHoldings.length > 2 ? 'Medium' : 'High'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{portfolioHoldings.length} holdings</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Chat Assistant */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <span>AI Assistant</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">Ask questions about your finances</p>
              </div>
              
              <div className="h-96 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="mb-2">Start a conversation</p>
                      <p className="text-xs">Ask about budgets, savings, or financial goals</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about your finances..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isAnalyzing}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setChatInput("How can I improve my savings rate?")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Improve Savings Rate</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setChatInput("How is my portfolio performing?")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Portfolio Analysis</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setChatInput("How am I doing with my financial goals?")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Goal Progress</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setChatInput("What's the best allocation across budget, investments, and goals?")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Optimal Allocation</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Plan Modal */}
        {showPlanEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-green-600" />
                    <span>Financial Plan</span>
                  </h2>
                  <button
                    onClick={() => setShowPlanEditor(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {financialPlan ? (
                  <div className="space-y-6">
                    {/* Plan Overview */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Target Savings Rate</p>
                          <p className="text-xl font-bold text-green-600">{financialPlan.target_savings_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Emergency Fund Goal</p>
                          <p className="text-xl font-bold text-blue-600">${financialPlan.emergency_fund_target?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Investment Allocation</p>
                          <p className="text-xl font-bold text-purple-600">{financialPlan.investment_allocation}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Plan Sections */}
                    {financialPlan.sections?.map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{section.title}</h4>
                        <p className="text-gray-700 mb-3">{section.content}</p>
                        {section.action_items && section.action_items.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Action Items:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {section.action_items.map((item, itemIndex) => (
                                <li key={itemIndex} className="text-sm text-gray-700">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={() => setEditingPlan(financialPlan)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Plan</span>
                      </button>
                      <button
                        onClick={() => {
                          const element = document.createElement('a');
                          const file = new Blob([JSON.stringify(financialPlan, null, 2)], {type: 'application/json'});
                          element.href = URL.createObjectURL(file);
                          element.download = 'financial-plan.json';
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export Plan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No financial plan generated yet</p>
                    <button
                      onClick={generateFinancialPlan}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Generate Financial Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}