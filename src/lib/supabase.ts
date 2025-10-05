import { createClient } from '@supabase/supabase-js';

// These environment variables will be available when Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create Supabase client if URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Enhanced mock data with realistic banking information
export const mockUser = {
  id: '1',
  email: 'sarah.johnson@email.com',
  full_name: 'Sarah Johnson',
  created_at: '2024-01-01',
  updated_at: '2024-01-15'
};

// Realistic transaction data with varied amounts and descriptions
export const mockTransactions = [
  // January 2024 transactions
  { id: '1', user_id: '1', amount: 4250.00, description: 'Salary Deposit - TechCorp Inc', category: 'Salary', date: '2024-01-01', type: 'income' as const, created_at: '2024-01-01' },
  { id: '2', user_id: '1', amount: 850.00, description: 'Freelance Project Payment', category: 'Freelance', date: '2024-01-03', type: 'income' as const, created_at: '2024-01-03' },
  { id: '3', user_id: '1', amount: -1450.00, description: 'Rent Payment - Downtown Apartments', category: 'Housing', date: '2024-01-01', type: 'expense' as const, created_at: '2024-01-01' },
  { id: '4', user_id: '1', amount: -89.47, description: 'Whole Foods Market', category: 'Food', date: '2024-01-02', type: 'expense' as const, created_at: '2024-01-02' },
  { id: '5', user_id: '1', amount: -156.23, description: 'Target - Household Items', category: 'Shopping', date: '2024-01-02', type: 'expense' as const, created_at: '2024-01-02' },
  { id: '6', user_id: '1', amount: -67.89, description: 'Shell Gas Station', category: 'Transportation', date: '2024-01-03', type: 'expense' as const, created_at: '2024-01-03' },
  { id: '7', user_id: '1', amount: -45.67, description: 'Starbucks Coffee', category: 'Dining', date: '2024-01-04', type: 'expense' as const, created_at: '2024-01-04' },
  { id: '8', user_id: '1', amount: -234.56, description: 'Amazon Prime Shopping', category: 'Shopping', date: '2024-01-05', type: 'expense' as const, created_at: '2024-01-05' },
  { id: '9', user_id: '1', amount: -78.90, description: 'Uber Rides', category: 'Transportation', date: '2024-01-06', type: 'expense' as const, created_at: '2024-01-06' },
  { id: '10', user_id: '1', amount: -125.00, description: 'Olive Garden Dinner', category: 'Dining', date: '2024-01-07', type: 'expense' as const, created_at: '2024-01-07' },
  { id: '11', user_id: '1', amount: -95.34, description: 'Kroger Grocery Store', category: 'Food', date: '2024-01-08', type: 'expense' as const, created_at: '2024-01-08' },
  { id: '12', user_id: '1', amount: -189.99, description: 'Nike Store - Running Shoes', category: 'Shopping', date: '2024-01-09', type: 'expense' as const, created_at: '2024-01-09' },
  { id: '13', user_id: '1', amount: -56.78, description: 'Chipotle Mexican Grill', category: 'Dining', date: '2024-01-10', type: 'expense' as const, created_at: '2024-01-10' },
  { id: '14', user_id: '1', amount: -112.45, description: 'Costco Wholesale', category: 'Food', date: '2024-01-11', type: 'expense' as const, created_at: '2024-01-11' },
  { id: '15', user_id: '1', amount: -89.00, description: 'Exxon Gas Station', category: 'Transportation', date: '2024-01-12', type: 'expense' as const, created_at: '2024-01-12' },
  { id: '16', user_id: '1', amount: -167.89, description: 'Best Buy Electronics', category: 'Shopping', date: '2024-01-13', type: 'expense' as const, created_at: '2024-01-13' },
  { id: '17', user_id: '1', amount: -78.45, description: 'Panera Bread', category: 'Dining', date: '2024-01-14', type: 'expense' as const, created_at: '2024-01-14' },
  { id: '18', user_id: '1', amount: -134.67, description: 'Trader Joes', category: 'Food', date: '2024-01-15', type: 'expense' as const, created_at: '2024-01-15' },
  { id: '19', user_id: '1', amount: 500.00, description: 'Investment Dividend - AAPL', category: 'Investment', date: '2024-01-15', type: 'income' as const, created_at: '2024-01-15' },
  { id: '20', user_id: '1', amount: -299.99, description: 'Monthly Gym Membership', category: 'Health', date: '2024-01-01', type: 'expense' as const, created_at: '2024-01-01' }
];

// Calculate realistic budget data based on transactions
const calculateSpentByCategory = (category: string) => {
  return mockTransactions
    .filter(t => t.category === category && t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

export const mockBudgets = [
  { id: '1', user_id: '1', category: 'Food', amount: 600, spent: calculateSpentByCategory('Food'), month: 'January', year: 2024, created_at: '2024-01-01' },
  { id: '2', user_id: '1', category: 'Transportation', amount: 300, spent: calculateSpentByCategory('Transportation'), month: 'January', year: 2024, created_at: '2024-01-01' },
  { id: '3', user_id: '1', category: 'Dining', amount: 250, spent: calculateSpentByCategory('Dining'), month: 'January', year: 2024, created_at: '2024-01-01' },
  { id: '4', user_id: '1', category: 'Shopping', amount: 400, spent: calculateSpentByCategory('Shopping'), month: 'January', year: 2024, created_at: '2024-01-01' },
  { id: '5', user_id: '1', category: 'Housing', amount: 1500, spent: calculateSpentByCategory('Housing'), month: 'January', year: 2024, created_at: '2024-01-01' },
  { id: '6', user_id: '1', category: 'Health', amount: 350, spent: calculateSpentByCategory('Health'), month: 'January', year: 2024, created_at: '2024-01-01' }
];

export const mockGoals = [
  { id: '1', user_id: '1', title: 'Emergency Fund', description: '6 months of expenses saved', target_amount: 18000, current_amount: 12500, target_date: '2024-12-31', category: 'Emergency', created_at: '2024-01-01' },
  { id: '2', user_id: '1', title: 'European Vacation', description: 'Two week trip to Europe', target_amount: 8000, current_amount: 3200, target_date: '2024-08-15', category: 'Travel', created_at: '2024-01-01' },
  { id: '3', user_id: '1', title: 'New Car Down Payment', description: 'Tesla Model 3 down payment', target_amount: 12000, current_amount: 5800, target_date: '2024-10-01', category: 'Transportation', created_at: '2024-01-01' },
  { id: '4', user_id: '1', title: 'Home Down Payment', description: 'Save for first home purchase', target_amount: 50000, current_amount: 18500, target_date: '2025-06-01', category: 'Housing', created_at: '2024-01-01' }
];

export const mockPortfolio = [
  { id: '1', user_id: '1', symbol: 'AAPL', company_name: 'Apple Inc.', shares: 75, purchase_price: 145.30, current_price: 185.25, created_at: '2024-01-01' },
  { id: '2', user_id: '1', symbol: 'GOOGL', company_name: 'Alphabet Inc.', shares: 35, purchase_price: 2650.00, current_price: 2950.50, created_at: '2024-01-01' },
  { id: '3', user_id: '1', symbol: 'TSLA', company_name: 'Tesla Inc.', shares: 50, purchase_price: 210.00, current_price: 195.75, created_at: '2024-01-01' },
  { id: '4', user_id: '1', symbol: 'MSFT', company_name: 'Microsoft Corp.', shares: 60, purchase_price: 365.00, current_price: 415.30, created_at: '2024-01-01' },
  { id: '5', user_id: '1', symbol: 'AMZN', company_name: 'Amazon.com Inc.', shares: 25, purchase_price: 3100.00, current_price: 3250.75, created_at: '2024-01-01' }
];

export const mockAlerts = [
  { id: '1', user_id: '1', type: 'budget_warning' as const, title: 'Budget Alert: Dining', message: 'You have exceeded your dining budget by $50.12 this month', is_read: false, created_at: '2024-01-15' },
  { id: '2', user_id: '1', type: 'goal_milestone' as const, title: 'Goal Progress: Emergency Fund', message: 'Congratulations! You are 69% towards your Emergency Fund goal', is_read: false, created_at: '2024-01-14' },
  { id: '3', user_id: '1', type: 'market_alert' as const, title: 'Portfolio Update', message: 'AAPL is up 12.5% this week - your portfolio gained $750', is_read: false, created_at: '2024-01-13' },
  { id: '4', user_id: '1', type: 'budget_warning' as const, title: 'Spending Alert: Shopping', message: 'You are at 95% of your shopping budget with 16 days left in the month', is_read: true, created_at: '2024-01-12' },
  { id: '5', user_id: '1', type: 'goal_milestone' as const, title: 'Goal Achievement', message: 'You have reached 48% of your European Vacation fund!', is_read: true, created_at: '2024-01-10' }
];

export const mockMarketData = [
  { symbol: 'AAPL', price: 185.25, change: 8.75, change_percent: 4.96, volume: 67234000, market_cap: '$2.9T', pe_ratio: 29.2 },
  { symbol: 'GOOGL', price: 2950.50, change: -45.25, change_percent: -1.51, volume: 1876000, market_cap: '$1.8T', pe_ratio: 23.7 },
  { symbol: 'TSLA', price: 195.75, change: -14.25, change_percent: -6.79, volume: 125643000, market_cap: '$625B', pe_ratio: 52.3 },
  { symbol: 'MSFT', price: 415.30, change: 18.30, change_percent: 4.61, volume: 34567000, market_cap: '$3.1T', pe_ratio: 33.1 },
  { symbol: 'AMZN', price: 3250.75, change: 67.25, change_percent: 2.11, volume: 12345000, market_cap: '$1.7T', pe_ratio: 45.8 }
];

// Database service functions
export class DatabaseService {
  // Generate consistent mock data based on a seed
  static generateConsistentMockData() {
    // Use a fixed seed for consistent data generation
    const seed = 'smartfinance-demo-2024';
    let seedValue = 0;
    for (let i = 0; i < seed.length; i++) {
      seedValue += seed.charCodeAt(i);
    }
    
    // Simple seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Generate consistent transactions
    const consistentTransactions = [
      { id: '1', user_id: '1', amount: 4250.00, description: 'Salary Deposit - TechCorp Inc', category: 'Salary', date: '2024-01-01', type: 'income' as const, created_at: '2024-01-01' },
      { id: '2', user_id: '1', amount: 850.00, description: 'Freelance Project Payment', category: 'Freelance', date: '2024-01-03', type: 'income' as const, created_at: '2024-01-03' },
      { id: '3', user_id: '1', amount: -1450.00, description: 'Rent Payment - Downtown Apartments', category: 'Housing', date: '2024-01-01', type: 'expense' as const, created_at: '2024-01-01' },
      { id: '4', user_id: '1', amount: -89.47, description: 'Whole Foods Market', category: 'Food', date: '2024-01-02', type: 'expense' as const, created_at: '2024-01-02' },
      { id: '5', user_id: '1', amount: -156.23, description: 'Target - Household Items', category: 'Shopping', date: '2024-01-02', type: 'expense' as const, created_at: '2024-01-02' },
      { id: '6', user_id: '1', amount: -67.89, description: 'Shell Gas Station', category: 'Transportation', date: '2024-01-03', type: 'expense' as const, created_at: '2024-01-03' },
      { id: '7', user_id: '1', amount: -45.67, description: 'Starbucks Coffee', category: 'Dining', date: '2024-01-04', type: 'expense' as const, created_at: '2024-01-04' },
      { id: '8', user_id: '1', amount: -234.56, description: 'Amazon Prime Shopping', category: 'Shopping', date: '2024-01-05', type: 'expense' as const, created_at: '2024-01-05' },
      { id: '9', user_id: '1', amount: -78.90, description: 'Uber Rides', category: 'Transportation', date: '2024-01-06', type: 'expense' as const, created_at: '2024-01-06' },
      { id: '10', user_id: '1', amount: -125.00, description: 'Olive Garden Dinner', category: 'Dining', date: '2024-01-07', type: 'expense' as const, created_at: '2024-01-07' }
    ];
    
    return consistentTransactions;
  }

  static async getTransactions(userId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.warn('Supabase query failed, using localStorage:', error);
        } else if (data) {
          return data;
        }
      } catch (error) {
        console.warn('Supabase connection error, using localStorage:', error);
      }
    }
    
    // Load from localStorage first, fallback to consistent mock data
    const stored = localStorage.getItem('mockTransactions');
    if (stored) {
      try {
        const parsedTransactions = JSON.parse(stored);
        // Validate the data structure
        if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
          mockTransactions.length = 0;
          mockTransactions.push(...parsedTransactions);
          return mockTransactions;
        }
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
      }
    }
    
    // Use consistent mock data if no valid stored data
    const consistentData = this.generateConsistentMockData();
    mockTransactions.length = 0;
    mockTransactions.push(...consistentData);
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    return mockTransactions;
  }

  static async addTransaction(transaction: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    // Add to beginning of mock array and persist
    mockTransactions.unshift(newTransaction);
    
    // Update localStorage for persistence
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
    return newTransaction;
  }

  static async updateTransaction(id: string, updates: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions[index] = { ...mockTransactions[index], ...updates };
      localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
      return mockTransactions[index];
    }
    return null;
  }

  static async deleteTransaction(id: string) {
    if (supabase) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
    
    // Mock implementation
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
      localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
      return true;
    }
    return false;
  }

  static async getBudgets(userId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase query failed, using localStorage:', error);
        } else if (data) {
          return data;
        }
      } catch (error) {
        console.warn('Supabase connection error, using localStorage:', error);
      }
    }
    
    // Load from localStorage first, ensure consistency
    const stored = localStorage.getItem('mockBudgets');
    if (stored) {
      try {
        const parsedBudgets = JSON.parse(stored);
        if (Array.isArray(parsedBudgets) && parsedBudgets.length > 0) {
          mockBudgets.length = 0;
          mockBudgets.push(...parsedBudgets);
          return mockBudgets;
        }
      } catch (error) {
        console.error('Error parsing stored budgets:', error);
      }
    }
    
    // Ensure budgets are saved to localStorage
    localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
    return mockBudgets;
  }

  static async addBudget(budget: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .insert([budget])
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    mockBudgets.push(newBudget);
    localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
    return newBudget;
  }

  static async updateBudget(id: string, updates: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const index = mockBudgets.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBudgets[index] = { ...mockBudgets[index], ...updates };
      localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
      return mockBudgets[index];
    }
    return null;
  }

  static async deleteBudget(id: string) {
    if (supabase) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
    
    // Mock implementation
    const index = mockBudgets.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBudgets.splice(index, 1);
      localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
      return true;
    }
    return false;
  }

  static async getGoals(userId: string) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        if (error) {
          console.warn('Supabase query failed, using localStorage:', error);
        } else if (data) {
          return data;
        }
      } catch (error) {
        console.warn('Supabase connection error, using localStorage:', error);
      }
    }
    
    // Load from localStorage first, ensure consistency
    const stored = localStorage.getItem('mockGoals');
    if (stored) {
      try {
        const parsedGoals = JSON.parse(stored);
        if (Array.isArray(parsedGoals) && parsedGoals.length > 0) {
          mockGoals.length = 0;
          mockGoals.push(...parsedGoals);
          return mockGoals;
        }
      } catch (error) {
        console.error('Error parsing stored goals:', error);
      }
    }
    
    // Ensure goals are saved to localStorage
    localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
    return mockGoals;
  }

  static async addGoal(goal: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    mockGoals.push(newGoal);
    localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
    return newGoal;
  }

  static async updateGoal(id: string, updates: any) {
    if (supabase) {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
    
    // Mock implementation
    const index = mockGoals.findIndex(g => g.id === id);
    if (index !== -1) {
      mockGoals[index] = { ...mockGoals[index], ...updates };
      localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
      return mockGoals[index];
    }
    return null;
  }

  static async deleteGoal(id: string) {
    if (supabase) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }
    
    // Mock implementation
    const index = mockGoals.findIndex(g => g.id === id);
    if (index !== -1) {
      mockGoals.splice(index, 1);
      localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
      return true;
    }
    return false;
  }

  // Initialize mock data from localStorage on app start
  static initializeMockData() {
    try {
      // Set a flag to indicate data has been initialized
      const dataInitialized = localStorage.getItem('smartfinance-data-initialized');
      
      // Load transactions
      const storedTransactions = localStorage.getItem('mockTransactions');
      if (storedTransactions) {
        try {
          const parsedTransactions = JSON.parse(storedTransactions);
          if (Array.isArray(parsedTransactions) && parsedTransactions.length > 0) {
            mockTransactions.length = 0;
            mockTransactions.push(...parsedTransactions);
          } else {
            throw new Error('Invalid transaction data');
          }
        } catch (error) {
          console.error('Error parsing stored transactions, using defaults:', error);
          const consistentData = this.generateConsistentMockData();
          mockTransactions.length = 0;
          mockTransactions.push(...consistentData);
          localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
        }
      } else if (!dataInitialized) {
        // Use consistent mock data for first initialization
        const consistentData = this.generateConsistentMockData();
        mockTransactions.length = 0;
        mockTransactions.push(...consistentData);
        localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
      }

      // Load budgets
      const storedBudgets = localStorage.getItem('mockBudgets');
      if (storedBudgets) {
        try {
          const parsedBudgets = JSON.parse(storedBudgets);
          if (Array.isArray(parsedBudgets) && parsedBudgets.length > 0) {
            mockBudgets.length = 0;
            mockBudgets.push(...parsedBudgets);
          } else {
            throw new Error('Invalid budget data');
          }
        } catch (error) {
          console.error('Error parsing stored budgets, using defaults:', error);
          localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
        }
      } else if (!dataInitialized) {
        localStorage.setItem('mockBudgets', JSON.stringify(mockBudgets));
      }

      // Load goals
      const storedGoals = localStorage.getItem('mockGoals');
      if (storedGoals) {
        try {
          const parsedGoals = JSON.parse(storedGoals);
          if (Array.isArray(parsedGoals) && parsedGoals.length > 0) {
            mockGoals.length = 0;
            mockGoals.push(...parsedGoals);
          } else {
            throw new Error('Invalid goals data');
          }
        } catch (error) {
          console.error('Error parsing stored goals, using defaults:', error);
          localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
        }
      } else if (!dataInitialized) {
        localStorage.setItem('mockGoals', JSON.stringify(mockGoals));
      }
      
      // Mark data as initialized
      if (!dataInitialized) {
        localStorage.setItem('smartfinance-data-initialized', 'true');
      }
    } catch (error) {
      console.error('Error initializing mock data:', error);
      // Fallback: ensure we have some data
      if (mockTransactions.length === 0) {
        const consistentData = this.generateConsistentMockData();
        mockTransactions.length = 0;
        mockTransactions.push(...consistentData);
      }
    }
  }
}