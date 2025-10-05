import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, Upload, RefreshCw, Filter, Settings, Zap, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { WorldIndicesGrid } from '../components/Market/WorldIndicesGrid';
import { MarketSummaryPanel } from '../components/Market/MarketSummaryPanel';
import { PortfolioWidget } from '../components/Market/PortfolioWidget';
import { AIInsightsPanel } from '../components/Market/AIInsightsPanel';
import { useToast } from '../components/Toast/ToastContainer';
import { formatCurrency, formatPercent } from '../lib/formatters';

export default function Market() {
  const {
    marketData,
    portfolioHoldings,
    watchlist,
    aiInsights,
    goals,
    budgets,
    loading,
    lastUpdate,
    addToPortfolio,
    updatePortfolioHolding,
    removeFromPortfolio,
    addToWatchlist,
    removeFromWatchlist,
    refreshAllData,
    syncDataAcrossComponents,
    calculatePortfolioValue,
    getFinancialSummary
  } = useApp();

  const toast = useToast();

  // State management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('marketDarkMode');
    return saved ? JSON.parse(saved) : true;
  });
  
  const [customIndices, setCustomIndices] = useState<{ [region: string]: string[] }>({
    americas: ['SPY', 'DIA', 'QQQ', 'VIX'],
    europe: ['EWU', 'EWG', 'EWQ'],
    asia: ['EWJ', 'FXI', 'EWY']
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeSync, setRealTimeSync] = useState(true);

  // Real-time sync with other components
  useEffect(() => {
    if (realTimeSync) {
      const interval = setInterval(() => {
        refreshAllData();
      }, 30000); // Sync every 30 seconds

      return () => clearInterval(interval);
    }
  }, [realTimeSync, refreshAllData]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('marketDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Calculate portfolio metrics
  const portfolioValue = calculatePortfolioValue();
  const portfolioGain = portfolioHoldings.reduce((sum, holding) => sum + holding.dayChange, 0);
  const portfolioGainPercent = portfolioValue > 0 ? (portfolioGain / portfolioValue) * 100 : 0;
  const totalGainLoss = portfolioHoldings.reduce((sum, holding) => sum + holding.totalGainLoss, 0);
  const totalGainLossPercent = portfolioValue > 0 ? (totalGainLoss / (portfolioValue - totalGainLoss)) * 100 : 0;
  const financialSummary = getFinancialSummary();

  // Portfolio management
  const handleAddToPortfolio = async (holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>) => {
    try {
      await addToPortfolio(holding);
      await syncDataAcrossComponents('market', { action: 'addPortfolio', data: holding });
      toast.success('Added to portfolio successfully');
    } catch (error) {
      toast.error('Failed to add to portfolio');
    }
  };

  const handleUpdatePortfolioHolding = async (id: string, updates: Partial<PortfolioHolding>) => {
    try {
      await updatePortfolioHolding(id, updates);
      await syncDataAcrossComponents('market', { action: 'updatePortfolio', id, data: updates });
      toast.success('Portfolio updated successfully');
    } catch (error) {
      toast.error('Failed to update portfolio');
    }
  };

  const handleRemoveFromPortfolio = async (id: string) => {
    try {
      await removeFromPortfolio(id);
      await syncDataAcrossComponents('market', { action: 'removePortfolio', id });
      toast.success('Removed from portfolio successfully');
    } catch (error) {
      toast.error('Failed to remove from portfolio');
    }
  };

  // Watchlist management
  const handleAddToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => {
    try {
      await addToWatchlist(item);
      await syncDataAcrossComponents('market', { action: 'addWatchlist', data: item });
      toast.success('Added to watchlist successfully');
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (id: string) => {
    try {
      await removeFromWatchlist(id);
      await syncDataAcrossComponents('market', { action: 'removeWatchlist', id });
      toast.success('Removed from watchlist successfully');
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  // Custom indices management
  const handleUpdateIndices = (region: string, symbols: string[]) => {
    setCustomIndices(prev => ({ ...prev, [region]: symbols }));
    localStorage.setItem('customIndices', JSON.stringify({ ...customIndices, [region]: symbols }));
  };

  // AI insights management
  const handleDismissInsight = (id: string) => {
    // Handle insight dismissal through context
  };

  const handleRefresh = () => {
    refreshAllData();
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-8 flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading market data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Integrated Market Dashboard
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time market data synced with your budget and goals
              {lastUpdate && (
                <span className="ml-2 text-sm">
                  • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Real-time Sync Toggle */}
            <button
              onClick={() => setRealTimeSync(!realTimeSync)}
              className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                realTimeSync 
                  ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
                  : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="text-sm">{realTimeSync ? 'Live' : 'Manual'}</span>
            </button>

            {/* Timeframe Selector */}
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              {['1D', '1W', '1M', '1Y'].map(timeframe => (
                <button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Refresh data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Cross-Component Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Portfolio Value</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(portfolioValue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatPercent((portfolioValue / financialSummary.netWorth) * 100)} of net worth
            </p>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily P&L</p>
                <p className={`text-2xl font-bold ${portfolioGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolioGain >= 0 ? '+' : ''}{formatCurrency(Math.abs(portfolioGain))}
                </p>
              </div>
              <div className={`p-3 rounded-full ${portfolioGain >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-6 w-6 ${portfolioGain >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatPercent(portfolioGainPercent)} change
            </p>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalGainLoss))}
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-6 w-6 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {formatPercent(totalGainLossPercent)} total return
            </p>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Investment Goals</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {goals.filter(g => g.category.toLowerCase().includes('investment')).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Linked to portfolio
            </p>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Budget Allocation</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatPercent((portfolioValue / financialSummary.totalIncome) * 100)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Of monthly income
            </p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="space-y-8">
          {/* World Indices Grid */}
          <WorldIndicesGrid
            marketData={marketData}
            customIndices={customIndices}
            onUpdateIndices={handleUpdateIndices}
            isDarkMode={isDarkMode}
          />

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Market Summary Panel */}
            <div className="lg:col-span-1">
              <MarketSummaryPanel
                marketData={marketData}
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
                onRemoveFromWatchlist={handleRemoveFromWatchlist}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Portfolio Widget */}
            <div className="lg:col-span-2">
              <PortfolioWidget
                portfolio={portfolioHoldings}
                onAddHolding={handleAddToPortfolio}
                onUpdateHolding={handleUpdatePortfolioHolding}
                onRemoveHolding={handleRemoveFromPortfolio}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* AI Insights Panel */}
          <AIInsightsPanel
            insights={aiInsights}
            onDismissInsight={handleDismissInsight}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}