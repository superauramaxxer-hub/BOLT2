export interface MarketSymbol {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: string;
  high52Week?: number;
  low52Week?: number;
  dayHigh?: number;
  dayLow?: number;
  region: 'americas' | 'europe' | 'asia';
  type: 'index' | 'stock' | 'etf' | 'crypto' | 'currency' | 'commodity';
  sparklineData?: number[];
  lastUpdated: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  allocation: number;
  lastUpdated: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
}

export interface MarketSummary {
  region: string;
  indices: MarketSymbol[];
  topGainers: MarketSymbol[];
  topLosers: MarketSymbol[];
  mostActive: MarketSymbol[];
}

export interface AIInsight {
  id: string;
  type: 'daily_summary' | 'risk_analysis' | 'volatility_forecast' | 'rebalancing_suggestion';
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
}