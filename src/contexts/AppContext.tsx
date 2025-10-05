import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Transaction, Budget, Goal, Portfolio, Alert } from '../types';
import { DatabaseService, mockUser, mockPortfolio, mockAlerts } from '../lib/supabase';
import { AdvisoryService } from '../lib/advisoryService';
import { MarketService, MarketAPIService } from '../lib/marketService';
import { MarketSymbol, PortfolioHolding, WatchlistItem, AIInsight } from '../types/market';

interface AppContextType {
  // Core Data
  user: User | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  portfolio: Portfolio[];
  alerts: Alert[];
  
  // Market Data
  marketData: MarketSymbol[];
  portfolioHoldings: PortfolioHolding[];
  watchlist: WatchlistItem[];
  aiInsights: AIInsight[];
  
  // State Management
  isAuthenticated: boolean;
  loading: boolean;
  lastUpdate: Date | null;
  
  // Transaction CRUD
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Budget CRUD
  addBudget: (budget: Omit<Budget, 'id' | 'created_at'>) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Goal CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'created_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Market CRUD
  addToPortfolio: (holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>) => Promise<void>;
  updatePortfolioHolding: (id: string, updates: Partial<PortfolioHolding>) => Promise<void>;
  removeFromPortfolio: (id: string) => Promise<void>;
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  
  // Cross-Component Sync
  refreshAllData: () => Promise<void>;
  syncDataAcrossComponents: (source: string, data: any) => Promise<void>;
  
  // Utility Functions
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  calculateCategorySpending: (category: string) => number;
  getBudgetStatus: (category: string) => { spent: number; budget: number; percentage: number; isOverBudget: boolean };
  calculatePortfolioValue: () => number;
  calculateGoalProgress: (goalId: string) => number;
  getFinancialSummary: () => {
    totalIncome: number;
    totalExpenses: number;
    netWorth: number;
    portfolioValue: number;
    goalsProgress: number;
    savingsRate: number;
  };
  
  // Alert Management
  markAlertAsRead: (id: string) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'created_at'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Core State
  const [user, setUser] = useState<User | null>(mockUser);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>(mockPortfolio);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  
  // Market State
  const [marketData, setMarketData] = useState<MarketSymbol[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  
  // System State
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const isAuthenticated = !!user;

  // Initialize all data and start real-time updates
  useEffect(() => {
    initializeAllData();
    startRealTimeUpdates();
    
    return () => {
      stopRealTimeUpdates();
    };
  }, [user]);

  const initializeAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Initialize mock data
      DatabaseService.initializeMockData();
      AdvisoryService.initializeMockData();
      
      // Load all data in parallel
      const [
        transactionsData,
        budgetsData,
        goalsData,
        marketDataResult,
        portfolioData,
        watchlistData
      ] = await Promise.all([
        DatabaseService.getTransactions(user.id),
        DatabaseService.getBudgets(user.id),
        DatabaseService.getGoals(user.id),
        MarketAPIService.fetchMarketData([]),
        Promise.resolve(MarketService.getPortfolio()),
        Promise.resolve(MarketService.getWatchlist())
      ]);

      // Update state
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setGoals(goalsData);
      setMarketData(marketDataResult);
      setPortfolioHoldings(portfolioData);
      setWatchlist(watchlistData);
      
      // Generate initial AI insights
      await generateAIInsights();
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    const handleMarketUpdate = async (data: MarketSymbol[]) => {
      setMarketData(data);
      await updatePortfolioPrices(data);
      await generateAIInsights();
      setLastUpdate(new Date());
    };

    MarketService.startRealTimeUpdates(handleMarketUpdate);
  };

  const stopRealTimeUpdates = () => {
    MarketService.stopRealTimeUpdates(() => {});
  };

  const updatePortfolioPrices = async (data: MarketSymbol[]) => {
    setPortfolioHoldings(prevHoldings => {
      const updatedHoldings = prevHoldings.map(holding => {
        const marketItem = data.find(item => item.symbol === holding.symbol);
        if (marketItem) {
          const newTotalValue = holding.shares * marketItem.price;
          const previousTotalValue = holding.shares * holding.currentPrice;
          const dayChange = newTotalValue - previousTotalValue;
          const dayChangePercent = previousTotalValue > 0 ? (dayChange / previousTotalValue) * 100 : 0;
          
          // Calculate total gain/loss from average cost
          const totalCost = holding.shares * holding.avgCost;
          const totalGainLoss = newTotalValue - totalCost;
          const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
          
          // Calculate allocation percentage
          const totalPortfolioValue = prevHoldings.reduce((sum, h) => sum + (h.shares * (data.find(item => item.symbol === h.symbol)?.price || h.currentPrice)), 0);
          const allocation = totalPortfolioValue > 0 ? (newTotalValue / totalPortfolioValue) * 100 : 0;
          
          return {
            ...holding,
            currentPrice: marketItem.price,
            totalValue: newTotalValue,
            dayChange,
            dayChangePercent,
            totalGainLoss,
            totalGainLossPercent,
            allocation,
            lastUpdated: new Date().toISOString()
          };
        }
        return holding;
      });
      
      // Update investment budget allocation based on portfolio performance
      updateInvestmentBudgetAllocation(updatedHoldings);
      
      return updatedHoldings;
    });
  };

  const updateInvestmentBudgetAllocation = async (holdings: PortfolioHolding[]) => {
    const portfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
    const portfolioGains = holdings.reduce((sum, holding) => sum + holding.totalGainLoss, 0);
    
    // Find investment budget category
    const investmentBudget = budgets.find(b => b.category.toLowerCase().includes('investment'));
    
    if (investmentBudget && portfolioGains !== 0) {
      // Suggest budget adjustment based on portfolio performance
      const suggestedAllocation = Math.max(investmentBudget.amount, portfolioValue * 0.1); // At least 10% of portfolio value
      
      if (Math.abs(suggestedAllocation - investmentBudget.amount) > investmentBudget.amount * 0.1) {
        // Update investment budget if difference is more than 10%
        await updateBudget(investmentBudget.id, {
          amount: suggestedAllocation,
          spent: portfolioValue
        });
      }
    }
  };

  const generateAIInsights = async () => {
    if (!user) return;
    
    try {
      const analysisData = {
        transactions,
        budgets,
        goals,
        marketData,
        portfolioHoldings
      };
      
      const insights = await AdvisoryService.generateInsights(user.id, analysisData);
      setAiInsights(insights.map(insight => ({
        id: insight.id,
        type: insight.type as any,
        title: insight.title,
        content: insight.content,
        confidence: insight.priority === 1 ? 0.9 : insight.priority === 2 ? 0.7 : 0.5,
        timestamp: insight.created_at
      })));
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  };

  // Cross-component synchronization
  const syncDataAcrossComponents = async (source: string, data: any) => {
    console.log(`Syncing data from ${source}:`, data);
    
    // Recalculate all dependent values
    await Promise.all([
      generateAIInsights(),
      updateGoalProgress(),
      updateBudgetAllocations(),
      checkAlertConditions()
    ]);
    
    setLastUpdate(new Date());
  };

  const updateGoalProgress = async () => {
    // Update goal progress based on budget savings and portfolio gains
    const portfolioValue = calculatePortfolioValue();
    const portfolioGains = portfolioHoldings.reduce((sum, h) => sum + h.totalGainLoss, 0);
    const monthlySavings = calculateMonthlySavings();
    
    const updatedGoals = await Promise.all(goals.map(async (goal) => {
      let progress = goal.current_amount;
      
      // Add savings from budget if goal is savings-related
      if (goal.category.toLowerCase().includes('emergency') || goal.category.toLowerCase().includes('savings')) {
        progress += monthlySavings * 0.3;
      }
      
      // Add portfolio gains if goal is investment-related
      if (goal.category.toLowerCase().includes('investment')) {
        progress += Math.max(0, portfolioGains * 0.1);
        
        // Update investment goal target based on portfolio performance
        if (portfolioValue > goal.target_amount) {
          await updateGoal(goal.id, {
            target_amount: Math.max(goal.target_amount, portfolioValue * 1.2) // 20% above current portfolio
          });
        }
        progress += monthlySavings * 0.15; // Reduced to account for investment allocation
      }
      
      // Update goal progress if there's meaningful change
      const newAmount = Math.min(progress, goal.target_amount);
      if (newAmount > goal.current_amount + 10) { // Only update if change is more than $10
        await updateGoal(goal.id, { current_amount: newAmount });
      }
      
      return { ...goal, current_amount: Math.max(newAmount, goal.current_amount) };
    }));
    
    setGoals(updatedGoals);
  };

  const updateBudgetAllocations = async () => {
    // Auto-adjust budget allocations based on portfolio performance
    const portfolioPerformance = calculatePortfolioPerformance();
    
    if (portfolioPerformance > 0.1) { // 10% gains
      // Suggest increasing investment budget
      addAlert({
        user_id: user!.id,
        type: 'budget_warning',
        title: 'Portfolio Performance Alert',
        message: `Your portfolio is up ${(portfolioPerformance * 100).toFixed(1)}%. Consider increasing your investment allocation.`,
        is_read: false
      });
    }
  };

  const checkAlertConditions = async () => {
    // Check for various alert conditions across all components
    const newAlerts: Omit<Alert, 'id' | 'created_at'>[] = [];
    
    // Budget alerts
    budgets.forEach(budget => {
      const spent = calculateCategorySpending(budget.category);
      if (spent > budget.amount * 1.1) {
        newAlerts.push({
          user_id: user!.id,
          type: 'budget_warning',
          title: `Budget Alert: ${budget.category}`,
          message: `You've exceeded your ${budget.category} budget by $${(spent - budget.amount).toFixed(2)}`,
          is_read: false
        });
      }
    });
    
    // Goal alerts
    goals.forEach(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      if (progress >= 50 && progress < 75) {
        newAlerts.push({
          user_id: user!.id,
          type: 'goal_milestone',
          title: `Goal Progress: ${goal.title}`,
          message: `You're ${progress.toFixed(0)}% towards your ${goal.title} goal!`,
          is_read: false
        });
      }
    });
    
    // Add new alerts
    newAlerts.forEach(alert => addAlert(alert));
  };

  // Utility Functions
  const calculateCategorySpending = (category: string) => {
    return transactions
      .filter(t => t.category.toLowerCase() === category.toLowerCase() && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getBudgetStatus = (category: string) => {
    const budget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
    const spent = calculateCategorySpending(category);
    
    if (!budget) {
      return { spent, budget: 0, percentage: 0, isOverBudget: false };
    }

    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isOverBudget = spent > budget.amount;

    return { spent, budget: budget.amount, percentage, isOverBudget };
  };

  const calculatePortfolioValue = () => {
    return portfolioHoldings.reduce((sum, holding) => {
      // Use real-time price if available from market data
      const currentMarketData = marketData.find(item => item.symbol === holding.symbol);
      const currentPrice = currentMarketData?.price || holding.currentPrice;
      return sum + (holding.shares * currentPrice);
    }, 0);
  };

  const calculateGoalProgress = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? (goal.current_amount / goal.target_amount) * 100 : 0;
  };

  const calculateMonthlySavings = () => {
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
  };

  const calculatePortfolioGains = () => {
    return portfolioHoldings.reduce((sum, holding) => sum + holding.totalGainLoss, 0);
  };

  const calculatePortfolioPerformance = () => {
    const totalValue = calculatePortfolioValue();
    const totalGains = calculatePortfolioGains();
    return totalValue > 0 ? totalGains / (totalValue - totalGains) : 0;
  };

  const getFinancialSummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate real net worth including portfolio value
    const portfolioValue = calculatePortfolioValue();
    const portfolioGains = portfolioHoldings.reduce((sum, h) => sum + h.totalGainLoss, 0);
    const netWorth = (totalIncome - totalExpenses) + portfolioValue;
    
    const goalsProgress = goals.length > 0 
      ? goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount), 0) / goals.length * 100
      : 0;
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netWorth,
      portfolioValue,
      portfolioGains,
      goalsProgress,
      savingsRate
    };
  };

  // CRUD Operations with Cross-Component Sync
  const addTransaction = async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      const transaction = await DatabaseService.addTransaction(newTransaction);
      setTransactions(prev => [transaction, ...prev]);
      await syncDataAcrossComponents('transactions', { action: 'add', data: transaction });
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await DatabaseService.updateTransaction(id, updates);
      if (updatedTransaction) {
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
        await syncDataAcrossComponents('transactions', { action: 'update', data: updatedTransaction });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const success = await DatabaseService.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        await syncDataAcrossComponents('transactions', { action: 'delete', id });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const addBudget = async (newBudget: Omit<Budget, 'id' | 'created_at'>) => {
    try {
      const budget = await DatabaseService.addBudget({
        ...newBudget,
        spent: calculateCategorySpending(newBudget.category)
      });
      setBudgets(prev => [...prev, budget]);
      await syncDataAcrossComponents('budgets', { action: 'add', data: budget });
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = await DatabaseService.updateBudget(id, updates);
      if (updatedBudget) {
        setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
        await syncDataAcrossComponents('budgets', { action: 'update', data: updatedBudget });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const success = await DatabaseService.deleteBudget(id);
      if (success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        await syncDataAcrossComponents('budgets', { action: 'delete', id });
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const addGoal = async (newGoal: Omit<Goal, 'id' | 'created_at'>) => {
    try {
      const goal = await DatabaseService.addGoal(newGoal);
      setGoals(prev => [...prev, goal]);
      await syncDataAcrossComponents('goals', { action: 'add', data: goal });
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const updatedGoal = await DatabaseService.updateGoal(id, updates);
      if (updatedGoal) {
        setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
        await syncDataAcrossComponents('goals', { action: 'update', data: updatedGoal });
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const success = await DatabaseService.deleteGoal(id);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== id));
        await syncDataAcrossComponents('goals', { action: 'delete', id });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const addToPortfolio = async (holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>) => {
    try {
      const newHolding = MarketService.addToPortfolio(holding);
      setPortfolioHoldings(prev => [...prev, newHolding]);
      await syncDataAcrossComponents('portfolio', { action: 'add', data: newHolding });
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      throw error;
    }
  };

  const updatePortfolioHolding = async (id: string, updates: Partial<PortfolioHolding>) => {
    try {
      const updated = MarketService.updatePortfolioHolding(id, updates);
      if (updated) {
        setPortfolioHoldings(prev => prev.map(h => h.id === id ? updated : h));
        await syncDataAcrossComponents('portfolio', { action: 'update', data: updated });
      }
    } catch (error) {
      console.error('Error updating portfolio holding:', error);
      throw error;
    }
  };

  const removeFromPortfolio = async (id: string) => {
    try {
      const success = MarketService.removeFromPortfolio(id);
      if (success) {
        setPortfolioHoldings(prev => prev.filter(h => h.id !== id));
        await syncDataAcrossComponents('portfolio', { action: 'delete', id });
      }
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      throw error;
    }
  };

  const addToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    try {
      const newItem = MarketService.addToWatchlist(item);
      setWatchlist(prev => [...prev, newItem]);
      await syncDataAcrossComponents('watchlist', { action: 'add', data: newItem });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (id: string) => {
    try {
      const success = MarketService.removeFromWatchlist(id);
      if (success) {
        setWatchlist(prev => prev.filter(item => item.id !== id));
        await syncDataAcrossComponents('watchlist', { action: 'delete', id });
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  const refreshAllData = async () => {
    await initializeAllData();
  };

  const markAlertAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, is_read: true } : alert
    ));
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'created_at'>) => {
    const newAlert = {
      ...alert,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      // Core Data
      user,
      transactions,
      budgets,
      goals,
      portfolio,
      alerts,
      
      // Market Data
      marketData,
      portfolioHoldings,
      watchlist,
      aiInsights,
      
      // State Management
      isAuthenticated,
      loading,
      lastUpdate,
      
      // Transaction CRUD
      addTransaction,
      updateTransaction,
      deleteTransaction,
      
      // Budget CRUD
      addBudget,
      updateBudget,
      deleteBudget,
      
      // Goal CRUD
      addGoal,
      updateGoal,
      deleteGoal,
      
      // Market CRUD
      addToPortfolio,
      updatePortfolioHolding,
      removeFromPortfolio,
      addToWatchlist,
      removeFromWatchlist,
      
      // Cross-Component Sync
      refreshAllData,
      syncDataAcrossComponents,
      
      // Utility Functions
      setLoading,
      calculateCategorySpending,
      getBudgetStatus,
      calculatePortfolioValue,
      calculateGoalProgress,
      getFinancialSummary,
      
      // Alert Management
      markAlertAsRead,
      addAlert
    }}>
      {children}
    </AppContext.Provider>
  );
};