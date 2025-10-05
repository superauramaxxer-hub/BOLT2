import { MarketSymbol, PortfolioHolding, WatchlistItem, MarketSummary, AIInsight } from '../types/market';

// Mock API service - In production, replace with real financial APIs like Alpha Vantage, IEX Cloud, or Yahoo Finance
export class MarketAPIService {
  private static baseUrl = 'https://api.example.com'; // Replace with real API
  private static apiKey = import.meta.env.VITE_MARKET_API_KEY || 'demo';

  // Simulate real-time market data
  static generateMockData(): MarketSymbol[] {
    const symbols = [
      // Americas
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', region: 'americas' as const, type: 'index' as const },
      { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', region: 'americas' as const, type: 'index' as const },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', region: 'americas' as const, type: 'index' as const },
      { symbol: 'VIX', name: 'CBOE Volatility Index', region: 'americas' as const, type: 'index' as const },
      { symbol: 'AAPL', name: 'Apple Inc.', region: 'americas' as const, type: 'stock' as const },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', region: 'americas' as const, type: 'stock' as const },
      { symbol: 'TSLA', name: 'Tesla Inc.', region: 'americas' as const, type: 'stock' as const },
      { symbol: 'MSFT', name: 'Microsoft Corporation', region: 'americas' as const, type: 'stock' as const },
      
      // Europe
      { symbol: 'EWU', name: 'iShares MSCI United Kingdom ETF', region: 'europe' as const, type: 'index' as const },
      { symbol: 'EWG', name: 'iShares MSCI Germany ETF', region: 'europe' as const, type: 'index' as const },
      { symbol: 'EWQ', name: 'iShares MSCI France ETF', region: 'europe' as const, type: 'index' as const },
      { symbol: 'ASML', name: 'ASML Holding N.V.', region: 'europe' as const, type: 'stock' as const },
      { symbol: 'SAP', name: 'SAP SE', region: 'europe' as const, type: 'stock' as const },
      
      // Asia
      { symbol: 'EWJ', name: 'iShares MSCI Japan ETF', region: 'asia' as const, type: 'index' as const },
      { symbol: 'FXI', name: 'iShares China Large-Cap ETF', region: 'asia' as const, type: 'index' as const },
      { symbol: 'EWY', name: 'iShares MSCI South Korea ETF', region: 'asia' as const, type: 'index' as const },
      { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing', region: 'asia' as const, type: 'stock' as const },
      { symbol: 'BABA', name: 'Alibaba Group Holding Limited', region: 'asia' as const, type: 'stock' as const },
    ];

    return symbols.map(s => ({
      id: `${s.symbol}_${Date.now()}`,
      ...s,
      price: 100 + Math.random() * 400,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: `$${(Math.random() * 1000 + 100).toFixed(0)}B`,
      high52Week: 150 + Math.random() * 300,
      low52Week: 50 + Math.random() * 100,
      dayHigh: 105 + Math.random() * 50,
      dayLow: 95 + Math.random() * 50,
      sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 50),
      lastUpdated: new Date().toISOString()
    }));
  }

  static async fetchMarketData(symbols: string[]): Promise<MarketSymbol[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, make real API calls here
    // const response = await fetch(`${this.baseUrl}/quote?symbols=${symbols.join(',')}&apikey=${this.apiKey}`);
    // return response.json();
    
    return this.generateMockData().filter(item => 
      symbols.length === 0 || symbols.includes(item.symbol)
    );
  }

  static async fetchCryptoData(): Promise<MarketSymbol[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cryptos = [
      { symbol: 'BTC-USD', name: 'Bitcoin', price: 45000 + Math.random() * 10000 },
      { symbol: 'ETH-USD', name: 'Ethereum', price: 2500 + Math.random() * 1000 },
      { symbol: 'ADA-USD', name: 'Cardano', price: 0.5 + Math.random() * 0.5 },
      { symbol: 'DOT-USD', name: 'Polkadot', price: 8 + Math.random() * 4 },
    ];

    return cryptos.map(crypto => ({
      id: `${crypto.symbol}_${Date.now()}`,
      symbol: crypto.symbol,
      name: crypto.name,
      price: crypto.price,
      change: (Math.random() - 0.5) * crypto.price * 0.1,
      changePercent: (Math.random() - 0.5) * 15,
      volume: Math.floor(Math.random() * 1000000),
      region: 'americas' as const,
      type: 'crypto' as const,
      sparklineData: Array.from({ length: 20 }, () => Math.random() * 100 + 50),
      lastUpdated: new Date().toISOString()
    }));
  }
}

export class MarketService {
  private static updateInterval: NodeJS.Timeout | null = null;
  private static subscribers: ((data: MarketSymbol[]) => void)[] = [];

  // Real-time data management
  static startRealTimeUpdates(callback: (data: MarketSymbol[]) => void) {
    this.subscribers.push(callback);
    
    if (!this.updateInterval) {
      this.updateInterval = setInterval(async () => {
        try {
          const data = await MarketAPIService.fetchMarketData([]);
          this.subscribers.forEach(cb => cb(data));
        } catch (error) {
          console.error('Error fetching market data:', error);
        }
      }, 5000); // Update every 5 seconds
    }
  }

  static stopRealTimeUpdates(callback: (data: MarketSymbol[]) => void) {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
    
    if (this.subscribers.length === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Portfolio management
  static getPortfolio(): PortfolioHolding[] {
    const stored = localStorage.getItem('portfolio');
    if (stored) {
      try {
        const parsedPortfolio = JSON.parse(stored);
        if (Array.isArray(parsedPortfolio) && parsedPortfolio.length > 0) {
          return parsedPortfolio;
        }
      } catch (error) {
        console.error('Error parsing stored portfolio:', error);
      }
    }
    
    // Default consistent portfolio
    const defaultPortfolio: PortfolioHolding[] = [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        shares: 50,
        avgCost: 150.00,
        currentPrice: 185.25,
        totalValue: 9262.50,
        dayChange: 125.50,
        dayChangePercent: 1.37,
        totalGainLoss: 1762.50,
        totalGainLossPercent: 23.50,
        allocation: 35.2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        shares: 10,
        avgCost: 2650.00,
        currentPrice: 2950.50,
        totalValue: 29505.00,
        dayChange: -150.25,
        dayChangePercent: -0.51,
        totalGainLoss: 3005.00,
        totalGainLossPercent: 11.34,
        allocation: 42.8,
        lastUpdated: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('portfolio', JSON.stringify(defaultPortfolio));
    return defaultPortfolio;
  }

  static addToPortfolio(holding: Omit<PortfolioHolding, 'id' | 'lastUpdated'>): PortfolioHolding {
    const portfolio = this.getPortfolio();
    const newHolding: PortfolioHolding = {
      ...holding,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    
    portfolio.push(newHolding);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    return newHolding;
  }

  static updatePortfolioHolding(id: string, updates: Partial<PortfolioHolding>): PortfolioHolding | null {
    const portfolio = this.getPortfolio();
    const index = portfolio.findIndex(h => h.id === id);
    
    if (index !== -1) {
      portfolio[index] = { ...portfolio[index], ...updates, lastUpdated: new Date().toISOString() };
      localStorage.setItem('portfolio', JSON.stringify(portfolio));
      return portfolio[index];
    }
    
    return null;
  }

  static removeFromPortfolio(id: string): boolean {
    const portfolio = this.getPortfolio();
    const filtered = portfolio.filter(h => h.id !== id);
    
    if (filtered.length !== portfolio.length) {
      localStorage.setItem('portfolio', JSON.stringify(filtered));
      return true;
    }
    
    return false;
  }

  // Watchlist management
  static getWatchlist(): WatchlistItem[] {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      try {
        const parsedWatchlist = JSON.parse(stored);
        if (Array.isArray(parsedWatchlist)) {
          return parsedWatchlist;
        }
      } catch (error) {
        console.error('Error parsing stored watchlist:', error);
      }
    }
    return [];
  }

  static addToWatchlist(item: Omit<WatchlistItem, 'id' | 'addedAt'>): WatchlistItem {
    const watchlist = this.getWatchlist();
    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString(),
      addedAt: new Date().toISOString()
    };
    
    watchlist.push(newItem);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    return newItem;
  }

  static removeFromWatchlist(id: string): boolean {
    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(item => item.id !== id);
    
    if (filtered.length !== watchlist.length) {
      localStorage.setItem('watchlist', JSON.stringify(filtered));
      return true;
    }
    
    return false;
  }

  // Market indices management
  static getCustomIndices(): { [region: string]: string[] } {
    const stored = localStorage.getItem('customIndices');
    if (stored) {
      try {
        const parsedIndices = JSON.parse(stored);
        if (typeof parsedIndices === 'object' && parsedIndices !== null) {
          return parsedIndices;
        }
      } catch (error) {
        console.error('Error parsing stored custom indices:', error);
      }
    }
    
    // Default consistent indices
    const defaultIndices = {
      americas: ['SPY', 'DIA', 'QQQ', 'VIX'],
      europe: ['EWU', 'EWG', 'EWQ'],
      asia: ['EWJ', 'FXI', 'EWY']
    };
    
    localStorage.setItem('customIndices', JSON.stringify(defaultIndices));
    return defaultIndices;
  }

  static updateCustomIndices(region: string, symbols: string[]): void {
    const indices = this.getCustomIndices();
    indices[region] = symbols;
    localStorage.setItem('customIndices', JSON.stringify(indices));
  }

  // AI Insights
  static generateAIInsights(marketData: MarketSymbol[], portfolio: PortfolioHolding[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Daily Summary
    const gainers = marketData.filter(s => s.changePercent > 0).length;
    const losers = marketData.filter(s => s.changePercent < 0).length;
    const avgChange = marketData.reduce((sum, s) => sum + s.changePercent, 0) / marketData.length;
    
    insights.push({
      id: `daily_${Date.now()}`,
      type: 'daily_summary',
      title: 'Daily Market Summary',
      content: `Markets are ${avgChange > 0 ? 'up' : 'down'} ${Math.abs(avgChange).toFixed(2)}% on average. ${gainers} symbols gained while ${losers} declined. ${avgChange > 2 ? 'Strong bullish momentum observed.' : avgChange < -2 ? 'Bearish pressure in the markets.' : 'Mixed trading session with moderate volatility.'}`,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    });

    // Portfolio Risk Analysis
    const portfolioValue = portfolio.reduce((sum, h) => sum + h.totalValue, 0);
    const portfolioChange = portfolio.reduce((sum, h) => sum + h.dayChange, 0);
    const portfolioChangePercent = portfolioValue > 0 ? (portfolioChange / portfolioValue) * 100 : 0;
    
    insights.push({
      id: `risk_${Date.now()}`,
      type: 'risk_analysis',
      title: 'Portfolio Risk Assessment',
      content: `Your portfolio is ${portfolioChangePercent > 0 ? 'up' : 'down'} ${Math.abs(portfolioChangePercent).toFixed(2)}% today. ${Math.abs(portfolioChangePercent) > 3 ? 'High volatility detected - consider rebalancing.' : 'Moderate risk levels within acceptable range.'}`,
      confidence: 0.78,
      timestamp: new Date().toISOString()
    });

    // Volatility Forecast
    const highVolatilitySymbols = marketData.filter(s => Math.abs(s.changePercent) > 5).length;
    
    insights.push({
      id: `volatility_${Date.now()}`,
      type: 'volatility_forecast',
      title: 'Volatility Forecast',
      content: `${highVolatilitySymbols} symbols showing high volatility (>5% change). ${highVolatilitySymbols > 5 ? 'Expect continued market turbulence.' : 'Volatility levels appear manageable.'}`,
      confidence: 0.72,
      timestamp: new Date().toISOString()
    });

    return insights;
  }

  // Data export/import
  static exportData(): string {
    const data = {
      portfolio: this.getPortfolio(),
      watchlist: this.getWatchlist(),
      customIndices: this.getCustomIndices(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.portfolio) {
        localStorage.setItem('portfolio', JSON.stringify(data.portfolio));
      }
      
      if (data.watchlist) {
        localStorage.setItem('watchlist', JSON.stringify(data.watchlist));
      }
      
      if (data.customIndices) {
        localStorage.setItem('customIndices', JSON.stringify(data.customIndices));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}