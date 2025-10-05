import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, X, Star } from 'lucide-react';
import { MarketSymbol, WatchlistItem } from '../../types/market';

interface MarketSummaryPanelProps {
  marketData: MarketSymbol[];
  watchlist: WatchlistItem[];
  onAddToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  onRemoveFromWatchlist: (id: string) => void;
  isDarkMode: boolean;
}

export const MarketSummaryPanel: React.FC<MarketSummaryPanelProps> = ({
  marketData,
  watchlist,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('US');
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');

  const tabs = [
    { id: 'US', name: 'US Markets', region: 'americas' },
    { id: 'Europe', name: 'Europe', region: 'europe' },
    { id: 'Asia', name: 'Asia', region: 'asia' },
    { id: 'Crypto', name: 'Crypto', region: 'crypto' },
    { id: 'Watchlist', name: 'Watchlist', region: 'watchlist' }
  ];

  const getTabData = (tabId: string) => {
    if (tabId === 'Watchlist') {
      return watchlist.map(item => ({
        id: item.id,
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent,
        region: 'watchlist' as const,
        type: 'stock' as const,
        volume: 0,
        lastUpdated: new Date().toISOString()
      }));
    }
    
    const region = tabs.find(t => t.id === tabId)?.region;
    if (tabId === 'Crypto') {
      return marketData.filter(item => item.type === 'crypto');
    }
    
    return marketData.filter(item => item.region === region);
  };

  const handleAddToWatchlist = () => {
    if (newSymbol.trim()) {
      const symbol = newSymbol.trim().toUpperCase();
      const existingData = marketData.find(item => item.symbol === symbol);
      
      onAddToWatchlist({
        symbol,
        name: existingData?.name || symbol,
        price: existingData?.price || 0,
        change: existingData?.change || 0,
        changePercent: existingData?.changePercent || 0
      });
      
      setNewSymbol('');
      setShowAddSymbol(false);
    }
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.some(item => item.symbol === symbol);
  };

  const toggleWatchlist = (item: MarketSymbol) => {
    const watchlistItem = watchlist.find(w => w.symbol === item.symbol);
    
    if (watchlistItem) {
      onRemoveFromWatchlist(watchlistItem.id);
    } else {
      onAddToWatchlist({
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        change: item.change,
        changePercent: item.changePercent
      });
    }
  };

  const tabData = getTabData(activeTab);

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Market Summary
        </h2>
        {activeTab === 'Watchlist' && (
          <button
            onClick={() => setShowAddSymbol(!showAddSymbol)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? isDarkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700'
                : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Add Symbol Form */}
      {showAddSymbol && activeTab === 'Watchlist' && (
        <div className={`mb-4 p-4 border rounded-lg ${
          isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Enter symbol (e.g., AAPL)"
              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              onKeyPress={(e) => e.key === 'Enter' && handleAddToWatchlist()}
            />
            <button
              onClick={handleAddToWatchlist}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddSymbol(false)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Data List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tabData.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>No data available</p>
            {activeTab === 'Watchlist' && (
              <button
                onClick={() => setShowAddSymbol(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add symbols to your watchlist
              </button>
            )}
          </div>
        ) : (
          tabData.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm group ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-white'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.symbol}
                  </span>
                  <div className="flex items-center space-x-2">
                    {activeTab !== 'Watchlist' && (
                      <button
                        onClick={() => toggleWatchlist(item)}
                        className={`p-1 rounded transition-colors ${
                          isInWatchlist(item.symbol)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : isDarkMode
                              ? 'text-gray-400 hover:text-yellow-500'
                              : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`h-4 w-4 ${isInWatchlist(item.symbol) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    {activeTab === 'Watchlist' && (
                      <button
                        onClick={() => onRemoveFromWatchlist(item.id)}
                        className="p-1 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ${item.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium flex items-center ${
                      item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {item.changePercent.toFixed(2)}%
                    </span>
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