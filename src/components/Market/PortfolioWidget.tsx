import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, CreditCard as Edit3, Trash2, PieChart } from 'lucide-react';
import { PortfolioHolding } from '../../types/market';
import { InteractiveChart } from '../Charts/InteractiveChart';

interface PortfolioWidgetProps {
  portfolio: PortfolioHolding[];
  onAddHolding: (holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>) => void;
  onUpdateHolding: (id: string, updates: Partial<PortfolioHolding>) => void;
  onRemoveHolding: (id: string) => void;
  isDarkMode: boolean;
}

export const PortfolioWidget: React.FC<PortfolioWidgetProps> = ({
  portfolio,
  onAddHolding,
  onUpdateHolding,
  onRemoveHolding,
  isDarkMode
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    shares: '',
    avgCost: '',
    currentPrice: ''
  });

  // Calculate portfolio totals
  const totalValue = portfolio.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalDayChange = portfolio.reduce((sum, holding) => sum + holding.dayChange, 0);
  const totalDayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;
  const totalGainLoss = portfolio.reduce((sum, holding) => sum + holding.totalGainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Prepare chart data
  const chartData = portfolio.map(holding => ({
    name: holding.symbol,
    value: holding.totalValue,
    allocation: holding.allocation,
    color: holding.totalGainLoss >= 0 ? '#10B981' : '#EF4444'
  }));

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      shares: '',
      avgCost: '',
      currentPrice: ''
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shares = parseFloat(formData.shares);
    const avgCost = parseFloat(formData.avgCost);
    const currentPrice = parseFloat(formData.currentPrice);
    
    if (!formData.symbol || !shares || !avgCost || !currentPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const totalValue = shares * currentPrice;
    const totalCost = shares * avgCost;
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const allocation = totalValue > 0 ? (totalValue / (totalValue + portfolio.reduce((sum, h) => sum + h.totalValue, 0))) * 100 : 0;

    const holdingData = {
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || formData.symbol.toUpperCase(),
      shares,
      avgCost,
      currentPrice,
      totalValue,
      dayChange: 0, // Would be calculated from real-time data
      dayChangePercent: 0,
      totalGainLoss,
      totalGainLossPercent,
      allocation
    };

    if (editingId) {
      onUpdateHolding(editingId, holdingData);
    } else {
      onAddHolding(holdingData);
    }

    resetForm();
  };

  const handleEdit = (holding: PortfolioHolding) => {
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      shares: holding.shares.toString(),
      avgCost: holding.avgCost.toString(),
      currentPrice: holding.currentPrice.toString()
    });
    setEditingId(holding.id);
    setShowAddForm(true);
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Portfolio
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${totalValue.toLocaleString()}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Day Change</p>
          <p className={`text-2xl font-bold flex items-center ${
            totalDayChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {totalDayChange >= 0 ? (
              <TrendingUp className="h-5 w-5 mr-1" />
            ) : (
              <TrendingDown className="h-5 w-5 mr-1" />
            )}
            ${Math.abs(totalDayChange).toLocaleString()} ({totalDayChangePercent.toFixed(2)}%)
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Gain/Loss</p>
          <p className={`text-2xl font-bold ${
            totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            ${totalGainLoss.toLocaleString()} ({totalGainLossPercent.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={`mb-6 p-4 border rounded-lg ${
          isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingId ? 'Edit Holding' : 'Add New Holding'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Symbol (e.g., AAPL)"
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
            <input
              type="text"
              placeholder="Company Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Shares"
              value={formData.shares}
              onChange={(e) => setFormData(prev => ({ ...prev, shares: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Average Cost"
              value={formData.avgCost}
              onChange={(e) => setFormData(prev => ({ ...prev, avgCost: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Current Price"
              value={formData.currentPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
              className={`px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {editingId ? 'Update' : 'Add'} Holding
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                  isDarkMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Allocation Chart */}
      {portfolio.length > 0 && (
        <div className="mb-6">
          <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Portfolio Allocation
          </h3>
          <InteractiveChart
            type="pie"
            data={chartData}
            height={250}
            showLegend={true}
          />
        </div>
      )}

      {/* Holdings List */}
      <div className="space-y-3">
        {portfolio.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No holdings in your portfolio</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Add your first holding
            </button>
          </div>
        ) : (
          portfolio.map(holding => (
            <div
              key={holding.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-sm group ${
                isDarkMode ? 'bg-gray-750 hover:bg-gray-700' : 'bg-gray-50 hover:bg-white'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {holding.symbol}
                    </span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {holding.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(holding)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveHolding(holding.id)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shares</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {holding.shares}
                    </p>
                  </div>
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${holding.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Value</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${holding.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gain/Loss</p>
                    <p className={`font-medium ${
                      holding.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${holding.totalGainLoss.toLocaleString()} ({holding.totalGainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};