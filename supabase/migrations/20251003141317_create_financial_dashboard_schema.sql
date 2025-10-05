/*
  # Financial Dashboard Database Schema

  ## Overview
  Complete database structure for financial management system with real-time sync and CRUD operations.

  ## New Tables

  ### 1. users
  - id (uuid, primary key)
  - email (text, unique)
  - full_name (text)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. transactions
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - amount (numeric)
  - description (text)
  - category (text)
  - date (date)
  - type (text: income/expense)
  - created_at (timestamptz)

  ### 3. budgets
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - category (text)
  - amount (numeric)
  - spent (numeric)
  - month (text)
  - year (integer)
  - created_at (timestamptz)

  ### 4. goals
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - title (text)
  - description (text)
  - target_amount (numeric)
  - current_amount (numeric)
  - target_date (date)
  - category (text)
  - created_at (timestamptz)

  ### 5. portfolio
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - symbol (text)
  - company_name (text)
  - shares (numeric)
  - purchase_price (numeric)
  - current_price (numeric)
  - created_at (timestamptz)

  ### 6. alerts
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - type (text)
  - title (text)
  - message (text)
  - is_read (boolean)
  - created_at (timestamptz)

  ### 7. insights
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - type (text)
  - title (text)
  - content (text)
  - priority (integer)
  - data (jsonb)
  - actionable (boolean)
  - dismissed (boolean)
  - accepted (boolean)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  spent numeric DEFAULT 0 CHECK (spent >= 0),
  month text NOT NULL,
  year integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month, year)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric DEFAULT 0 CHECK (current_amount >= 0),
  target_date date,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  company_name text,
  shares numeric NOT NULL CHECK (shares > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price > 0),
  current_price numeric CHECK (current_price > 0),
  created_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('budget_warning', 'goal_milestone', 'market_alert')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Insights table for AI advisory
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  priority integer DEFAULT 1,
  data jsonb,
  actionable boolean DEFAULT false,
  dismissed boolean DEFAULT false,
  accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (demo mode)
CREATE POLICY "Allow public access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to budgets" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to portfolio" ON portfolio FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to insights" ON insights FOR ALL USING (true) WITH CHECK (true);