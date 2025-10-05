import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, X } from 'lucide-react';
import { AIInsight } from '../../types/market';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onDismissInsight: (id: string) => void;
  isDarkMode: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onDismissInsight,
  isDarkMode
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'daily_summary':
        return <TrendingUp className="h-5 w-5" />;
      case 'risk_analysis':
        return <AlertTriangle className="h-5 w-5" />;
      case 'volatility_forecast':
        return <Brain className="h-5 w-5" />;
      case 'rebalancing_suggestion':
        return <Target className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string, confidence: number) => {
    if (confidence < 0.6) return isDarkMode ? 'text-gray-400' : 'text-gray-500';
    
    switch (type) {
      case 'daily_summary':
        return 'text-blue-500';
      case 'risk_analysis':
        return confidence > 0.8 ? 'text-red-500' : 'text-yellow-500';
      case 'volatility_forecast':
        return 'text-purple-500';
      case 'rebalancing_suggestion':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.7) return 'Medium';
    if (confidence >= 0.6) return 'Low';
    return 'Very Low';
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold flex items-center space-x-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span>AI Market Insights</span>
        </h2>
        <div className="text-xs text-gray-500">
          Powered by AI • Real-time analysis
        </div>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>AI insights will appear here</p>
            <p className="text-sm mt-1">Analysis updates automatically with market data</p>
          </div>
        ) : (
          insights.map(insight => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-sm ${
                isDarkMode 
                  ? 'bg-gray-750 border-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <div className={getInsightColor(insight.type, insight.confidence)}>
                      {getInsightIcon(insight.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {insight.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight.confidence >= 0.8
                          ? 'bg-green-100 text-green-800'
                          : insight.confidence >= 0.6
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {getConfidenceLabel(insight.confidence)} Confidence
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(insight.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDismissInsight(insight.id)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {insight.content}
              </p>
              
              {insight.type === 'rebalancing_suggestion' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Rebalancing Options
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};