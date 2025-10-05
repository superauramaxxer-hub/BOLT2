export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  spent: number;
  month: string;
  year: number;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  shares: number;
  purchase_price: number;
  current_price: number;
  created_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  type: 'budget_warning' | 'goal_milestone' | 'market_alert';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: string;
  pe_ratio: number;
}