import React, { useState } from 'react';
import { Plus, X, CreditCard as Edit3, TrendingUp, TrendingDown } from 'lucide-react';
import { MarketSymbol } from '../../types/market';
import { MarketSparkline } from './MarketSparkline';

interface WorldIndicesGridProps {
  marketData: MarketSymbol[];
  customIndices: { [region: string]: string[] };
  onUpdateIndices: (region: string, symbols: string[]) => void;
  isDarkMode: boolean;
}

export const WorldIndicesGrid: React.FC<WorldIndicesGridProps> = ({
  marketData,
  customIndices,
  onUpdateIndices,
  isDarkMode
}) => {
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [newSymbol, setNewSymbol] = useState('');

  const regions = [
    { key: 'americas', name: 'Americas', flag: '🇺🇸' },
    { key: 'europe', name: 'Europe', flag: '🇪🇺' },
    { key: 'asia', name: 'Asia', flag: '🌏' }
  ];

  const getRegionData = (region: string) => {
    const symbols = customIndices[region] || [];
    return symbols.map(symbol => 
      marketData.find(item => item.symbol === symbol)
    ).filter(Boolean) as MarketSymbol[];
  };

  const handleAddSymbol = (region: string) => {
    if (newSymbol.trim()) {
      const currentSymbols = customIndices[region] || [];
      onUpdateIndices(region, [...currentSymbols, newSymbol.trim().toUpperCase()]);
      setNewSymbol('');
      setEditingRegion(null);
    }
  };

  const handleRemoveSymbol = (region: string, symbolToRemove: string) => {
    const currentSymbols = customIndices[region] || [];
    onUpdateIndices(region, currentSymbols.filter(s => s !== symbolToRemove));
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          World Indices
        </h2>
        <div className="text-xs text-gray-500">
          Live • Updates every 5s
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {regions.map(region => {
          const regionData = getRegionData(region.key);
          
          return (
            <div key={region.key} className={`border rounded-lg p-4 ${
              isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{region.flag}</span>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {region.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingRegion(editingRegion === region.key ? null : region.key)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {regionData.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.symbol}
                        </span>
                        {editingRegion === region.key && (
                          <button
                            onClick={() => handleRemoveSymbol(region.key, item.symbol)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-2">
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
                      <div className="mt-2">
                        {item.sparklineData && (
                          <MarketSparkline
                            data={item.sparklineData}
                            color={item.changePercent >= 0 ? '#10B981' : '#EF4444'}
                            width={120}
                            height={25}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {editingRegion === region.key && (
                  <div className={`flex items-center space-x-2 p-3 border-2 border-dashed rounded-lg ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
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
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol(region.key)}
                    />
                    <button
                      onClick={() => handleAddSymbol(region.key)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};