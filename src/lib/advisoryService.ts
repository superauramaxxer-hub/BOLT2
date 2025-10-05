import { supabase } from './supabase';

export interface Insight {
  id: string;
  user_id: string;
  type: 'budget_optimization' | 'savings_opportunity' | 'debt_reduction' | 'investment_advice' | 'emergency_fund' | 'goal_adjustment';
  title: string;
  content: string;
  priority: number; // 1 = high, 2 = medium, 3 = low
  data?: any;
  actionable: boolean;
  dismissed: boolean;
  accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialPlan {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_savings_rate: number;
  emergency_fund_target: number;
  investment_allocation: number;
  sections: PlanSection[];
  created_at: string;
  updated_at: string;
}

export interface PlanSection {
  title: string;
  content: string;
  action_items: string[];
  priority: number;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

// Mock data for demonstration
const mockInsights: Insight[] = [
  {
    id: '1',
    user_id: '1',
    type: 'budget_optimization',
    title: 'Reduce Dining Expenses',
    content: 'You\'ve spent $312 on dining this month, which is 25% over your budget. Consider meal planning and cooking at home more often to save approximately $80 per month.',
    priority: 1,
    data: {
      category: 'Dining',
      spent: 312,
      budget: 250,
      overage: 62,
      potential_savings: 80
    },
    actionable: true,
    dismissed: false,
    accepted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '1',
    type: 'savings_opportunity',
    title: 'Increase Emergency Fund',
    content: 'Your current emergency fund covers only 3.2 months of expenses. Financial experts recommend 6 months. Consider increasing your monthly savings by $200 to reach this goal in 18 months.',
    priority: 1,
    data: {
      current_months: 3.2,
      target_months: 6,
      monthly_expenses: 2800,
      current_fund: 8960,
      target_fund: 16800,
      additional_needed: 7840,
      suggested_monthly: 200
    },
    actionable: true,
    dismissed: false,
    accepted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: '1',
    type: 'investment_advice',
    title: 'Diversify Your Portfolio',
    content: 'Your portfolio is heavily weighted in tech stocks (78%). Consider diversifying across different sectors and asset classes to reduce risk. A balanced allocation might include 60% stocks, 30% bonds, and 10% alternatives.',
    priority: 2,
    data: {
      current_allocation: {
        tech_stocks: 78,
        other_stocks: 12,
        bonds: 8,
        cash: 2
      },
      recommended_allocation: {
        stocks: 60,
        bonds: 30,
        alternatives: 10
      }
    },
    actionable: true,
    dismissed: false,
    accepted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockFinancialPlan: FinancialPlan = {
  id: '1',
  user_id: '1',
  title: 'Comprehensive Financial Plan 2024',
  description: 'A personalized financial roadmap based on your current situation and goals',
  target_savings_rate: 25,
  emergency_fund_target: 18000,
  investment_allocation: 70,
  sections: [
    {
      title: 'Spending Strategy',
      content: 'Based on your current spending patterns, we recommend implementing the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Your current allocation shows room for improvement in the savings category.',
      action_items: [
        'Track all expenses for 30 days using the app',
        'Identify and eliminate 3 unnecessary subscriptions',
        'Set up automatic transfers to savings account',
        'Review and optimize recurring expenses monthly'
      ],
      priority: 1
    },
    {
      title: 'Emergency Fund Strategy',
      content: 'Your emergency fund should cover 6 months of essential expenses ($18,000). Currently at $12,500, you need an additional $5,500. We recommend saving $306 monthly to reach this goal in 18 months.',
      action_items: [
        'Open a high-yield savings account for emergency fund',
        'Set up automatic transfer of $306 monthly',
        'Keep emergency fund separate from other savings',
        'Review and adjust target amount annually'
      ],
      priority: 1
    },
    {
      title: 'Debt Repayment Plan',
      content: 'Focus on high-interest debt first using the avalanche method. Pay minimums on all debts, then put extra money toward the highest interest rate debt.',
      action_items: [
        'List all debts with balances and interest rates',
        'Pay minimum on all debts',
        'Apply extra payments to highest interest debt',
        'Consider debt consolidation if beneficial'
      ],
      priority: 2
    },
    {
      title: 'Investment Strategy',
      content: 'With your risk tolerance and time horizon, we recommend a diversified portfolio of 70% stocks and 30% bonds. Consider low-cost index funds for broad market exposure.',
      action_items: [
        'Open investment account if not already done',
        'Invest in diversified index funds',
        'Rebalance portfolio quarterly',
        'Increase contributions with salary raises'
      ],
      priority: 2
    },
    {
      title: 'Goal Achievement Plan',
      content: 'Your financial goals are achievable with disciplined saving and investing. Prioritize goals by importance and timeline, and adjust strategies as needed.',
      action_items: [
        'Review goals monthly for progress',
        'Adjust timelines if necessary',
        'Celebrate milestones to stay motivated',
        'Consider increasing goal amounts with income growth'
      ],
      priority: 3
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    user_id: '1',
    message: 'How can I improve my savings rate?',
    sender: 'user',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    user_id: '1',
    message: 'Based on your spending patterns, I recommend focusing on your dining expenses, which are currently 25% over budget. By meal planning and cooking at home more often, you could save approximately $80 per month. Additionally, consider the 50/30/20 budgeting rule to optimize your allocation.',
    sender: 'ai',
    timestamp: new Date(Date.now() - 3590000).toISOString()
  }
];

export class AdvisoryService {
  // Initialize mock data in localStorage
  static initializeMockData() {
    try {
      const advisoryDataInitialized = localStorage.getItem('smartfinance-advisory-initialized');
      
      if (!localStorage.getItem('mockInsights')) {
        localStorage.setItem('mockInsights', JSON.stringify(mockInsights));
      }
      if (!localStorage.getItem('mockFinancialPlan')) {
        localStorage.setItem('mockFinancialPlan', JSON.stringify(mockFinancialPlan));
      }
      if (!localStorage.getItem('mockChatHistory')) {
        localStorage.setItem('mockChatHistory', JSON.stringify(mockChatHistory));
      }
      
      if (!advisoryDataInitialized) {
        localStorage.setItem('smartfinance-advisory-initialized', 'true');
      }
    } catch (error) {
      console.error('Error initializing advisory mock data:', error);
    }
  }

  static async getInsights(userId: string): Promise<Insight[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('*')
          .eq('user_id', userId)
          .order('priority', { ascending: true });

        if (error) {
          console.warn('Supabase query failed, using localStorage:', error);
        } else if (data) {
          return data;
        }
      } catch (error) {
        console.warn('Supabase connection error, using localStorage:', error);
      }
    }
    
    // Fallback to mock data
    this.initializeMockData();
    const stored = localStorage.getItem('mockInsights');
    if (stored) {
      try {
        const parsedInsights = JSON.parse(stored);
        if (Array.isArray(parsedInsights)) {
          return parsedInsights;
        }
      } catch (error) {
        console.error('Error parsing stored insights:', error);
      }
    }
    return mockInsights;
  }

  static async generateInsights(userId: string, analysisData: any): Promise<Insight[]> {
    // Generate insights based on actual data
    const insights = this.analyzeFinancialData(userId, analysisData);

    if (supabase) {
      try {
        // Store insights in database
        const { data, error } = await supabase
          .from('insights')
          .upsert(insights)
          .select();

        if (error) {
          console.warn('Supabase query failed, using localStorage:', error);
        } else if (data) {
          return data;
        }
      } catch (error) {
        console.warn('Supabase connection error, using localStorage:', error);
      }
    }

    // Store in localStorage
    localStorage.setItem('mockInsights', JSON.stringify(insights));
    return insights;
  }

  static analyzeFinancialData(userId: string, data: any): Insight[] {
    const { transactions, budgets, goals } = data;
    const insights: Insight[] = [];
    
    // Analyze budget performance
    budgets.forEach((budget: any) => {
      const spent = transactions
        .filter((t: any) => t.category === budget.category && t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
      
      if (spent > budget.amount * 1.1) { // 10% over budget
        insights.push({
          id: `budget_${budget.id}_${Date.now()}`,
          user_id: userId,
          type: 'budget_optimization',
          title: `Reduce ${budget.category} Expenses`,
          content: `You've spent $${spent.toFixed(2)} on ${budget.category} this month, which is ${((spent / budget.amount - 1) * 100).toFixed(1)}% over your budget. Consider ways to reduce spending in this category.`,
          priority: spent > budget.amount * 1.2 ? 1 : 2,
          data: {
            category: budget.category,
            spent,
            budget: budget.amount,
            overage: spent - budget.amount,
            percentage_over: ((spent / budget.amount - 1) * 100).toFixed(1)
          },
          actionable: true,
          dismissed: false,
          accepted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    // Analyze savings rate
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    if (savingsRate < 20) {
      insights.push({
        id: `savings_${Date.now()}`,
        user_id: userId,
        type: 'savings_opportunity',
        title: 'Improve Your Savings Rate',
        content: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Consider reducing expenses or increasing income to improve your financial health.`,
        priority: savingsRate < 10 ? 1 : 2,
        data: {
          current_rate: savingsRate.toFixed(1),
          target_rate: 20,
          monthly_income: totalIncome,
          monthly_expenses: totalExpenses,
          current_savings: totalIncome - totalExpenses
        },
        actionable: true,
        dismissed: false,
        accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Analyze goal progress
    goals.forEach((goal: any) => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      const daysUntilTarget = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (progress < 50 && daysUntilTarget < 365) {
        const monthlyNeeded = (goal.target_amount - goal.current_amount) / (daysUntilTarget / 30);
        
        insights.push({
          id: `goal_${goal.id}_${Date.now()}`,
          user_id: userId,
          type: 'goal_adjustment',
          title: `Accelerate ${goal.title} Goal`,
          content: `You're ${progress.toFixed(1)}% towards your ${goal.title} goal with ${Math.ceil(daysUntilTarget / 30)} months remaining. You'll need to save $${monthlyNeeded.toFixed(2)} monthly to reach your target on time.`,
          priority: daysUntilTarget < 180 ? 1 : 2,
          data: {
            goal_title: goal.title,
            current_progress: progress.toFixed(1),
            months_remaining: Math.ceil(daysUntilTarget / 30),
            monthly_needed: monthlyNeeded.toFixed(2),
            current_amount: goal.current_amount,
            target_amount: goal.target_amount
          },
          actionable: true,
          dismissed: false,
          accepted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    // Emergency fund analysis
    const monthlyExpenses = totalExpenses;
    const emergencyFundGoal = monthlyExpenses * 6;
    const currentEmergencyFund = goals.find((g: any) => g.category.toLowerCase().includes('emergency'))?.current_amount || 0;
    
    if (currentEmergencyFund < emergencyFundGoal) {
      insights.push({
        id: `emergency_${Date.now()}`,
        user_id: userId,
        type: 'emergency_fund',
        title: 'Build Your Emergency Fund',
        content: `Your emergency fund should cover 6 months of expenses ($${emergencyFundGoal.toLocaleString()}). Currently at $${currentEmergencyFund.toLocaleString()}, you need $${(emergencyFundGoal - currentEmergencyFund).toLocaleString()} more.`,
        priority: currentEmergencyFund < monthlyExpenses * 3 ? 1 : 2,
        data: {
          current_fund: currentEmergencyFund,
          target_fund: emergencyFundGoal,
          monthly_expenses: monthlyExpenses,
          months_covered: currentEmergencyFund / monthlyExpenses,
          additional_needed: emergencyFundGoal - currentEmergencyFund
        },
        actionable: true,
        dismissed: false,
        accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }

  static async updateInsight(id: string, updates: Partial<Insight>): Promise<Insight | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('insights')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating insight:', error);
      }
    }
    
    // Update mock data
    const stored = localStorage.getItem('mockInsights');
    if (stored) {
      const insights = JSON.parse(stored);
      const index = insights.findIndex((i: Insight) => i.id === id);
      if (index !== -1) {
        insights[index] = { ...insights[index], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('mockInsights', JSON.stringify(insights));
        return insights[index];
      }
    }
    
    return null;
  }

  static async deleteInsight(id: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('insights')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting insight:', error);
        return false;
      }
    }
    
    // Delete from mock data
    const stored = localStorage.getItem('mockInsights');
    if (stored) {
      const insights = JSON.parse(stored);
      const filtered = insights.filter((i: Insight) => i.id !== id);
      localStorage.setItem('mockInsights', JSON.stringify(filtered));
      return true;
    }
    
    return false;
  }

  static async getFinancialPlan(userId: string): Promise<FinancialPlan | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('financial_plans')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      } catch (error) {
        console.error('Error fetching financial plan:', error);
      }
    }
    
    // Return mock data
    this.initializeMockData();
    const stored = localStorage.getItem('mockFinancialPlan');
    if (stored) {
      try {
        const parsedPlan = JSON.parse(stored);
        if (parsedPlan && typeof parsedPlan === 'object') {
          return parsedPlan;
        }
      } catch (error) {
        console.error('Error parsing stored financial plan:', error);
      }
    }
    return null;
  }

  static async generateFinancialPlan(userId: string, analysisData: any): Promise<FinancialPlan> {
    const { transactions, budgets, goals } = analysisData;
    
    // Calculate key metrics
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Pre-calculate values needed for plan initialization
    const targetSavingsRate = Math.max(20, Math.ceil(savingsRate / 5) * 5);
    const emergencyFundTarget = totalExpenses * 6;
    const investmentAllocation = savingsRate > 15 ? 70 : 50;
    
    const plan: FinancialPlan = {
      id: Date.now().toString(),
      user_id: userId,
      title: `Personalized Financial Plan ${new Date().getFullYear()}`,
      description: 'A comprehensive financial roadmap based on your current situation and goals',
      target_savings_rate: targetSavingsRate,
      emergency_fund_target: emergencyFundTarget,
      investment_allocation: investmentAllocation,
      sections: [
        {
          title: 'Current Financial Health',
          content: `Your current savings rate is ${savingsRate.toFixed(1)}%. You're ${savingsRate >= 20 ? 'doing well' : 'below the recommended 20%'}. Your monthly income is $${totalIncome.toLocaleString()} and expenses are $${totalExpenses.toLocaleString()}.`,
          action_items: [
            'Track all expenses for better visibility',
            'Review and optimize recurring subscriptions',
            'Set up automatic savings transfers'
          ],
          priority: 1
        },
        {
          title: 'Budget Optimization',
          content: 'Based on your spending patterns, focus on categories where you\'re over budget. Implement the 50/30/20 rule for better financial balance.',
          action_items: [
            'Identify top 3 spending categories',
            'Set realistic budget limits',
            'Use envelope budgeting for discretionary spending',
            'Review budget monthly and adjust as needed'
          ],
          priority: 1
        },
        {
          title: 'Emergency Fund Strategy',
          content: `Build an emergency fund covering 6 months of expenses ($${emergencyFundTarget.toLocaleString()}). This provides financial security and peace of mind.`,
          action_items: [
            'Open high-yield savings account',
            'Automate emergency fund contributions',
            'Keep fund separate from other savings',
            'Only use for true emergencies'
          ],
          priority: 1
        },
        {
          title: 'Goal Achievement Plan',
          content: 'Your financial goals are achievable with proper planning and discipline. Prioritize by importance and timeline.',
          action_items: [
            'Review goal progress monthly',
            'Adjust timelines if necessary',
            'Automate goal contributions',
            'Celebrate milestones'
          ],
          priority: 2
        },
        {
          title: 'Investment Strategy',
          content: `Consider investing ${investmentAllocation}% of your savings in diversified portfolios. Start with low-cost index funds for broad market exposure.`,
          action_items: [
            'Open investment account',
            'Start with target-date funds',
            'Gradually increase contributions',
            'Rebalance quarterly'
          ],
          priority: 2
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('financial_plans')
          .upsert(plan)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error saving financial plan:', error);
      }
    }
    
    // Save to mock data
    localStorage.setItem('mockFinancialPlan', JSON.stringify(plan));
    return plan;
  }

  static async updateFinancialPlan(id: string, updates: Partial<FinancialPlan>): Promise<FinancialPlan | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('financial_plans')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating financial plan:', error);
      }
    }
    
    // Update mock data
    const stored = localStorage.getItem('mockFinancialPlan');
    if (stored) {
      const plan = JSON.parse(stored);
      if (plan.id === id) {
        const updatedPlan = { ...plan, ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('mockFinancialPlan', JSON.stringify(updatedPlan));
        return updatedPlan;
      }
    }
    
    return null;
  }

  static async getChatHistory(userId: string): Promise<ChatMessage[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    }
    
    // Return mock data
    this.initializeMockData();
    const stored = localStorage.getItem('mockChatHistory');
    if (stored) {
      try {
        const parsedHistory = JSON.parse(stored);
        if (Array.isArray(parsedHistory)) {
          return parsedHistory;
        }
      } catch (error) {
        console.error('Error parsing stored chat history:', error);
      }
    }
    return [];
  }

  static async getChatResponse(userId: string, message: string, context: any): Promise<string> {
    // In a real implementation, this would call an AI service like OpenAI
    // For now, we'll provide contextual responses based on the message and financial data
    
    const { transactions, budgets, goals } = context;
    const lowerMessage = message.toLowerCase();
    
    // Calculate some basic metrics for responses
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Generate contextual responses
    if (lowerMessage.includes('savings rate') || lowerMessage.includes('save more')) {
      return `Your current savings rate is ${savingsRate.toFixed(1)}%. ${savingsRate < 20 ? 'To improve it, consider reducing your largest expense categories or finding ways to increase your income. Even a 5% improvement would save you significant money over time.' : 'Great job! You\'re above the recommended 20% savings rate. Consider investing the excess for long-term growth.'}`;
    }
    
    if (lowerMessage.includes('spending') || lowerMessage.includes('expenses')) {
      const topCategory = budgets.reduce((max: any, budget: any) => {
        const spent = transactions
          .filter((t: any) => t.category === budget.category && t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        return spent > (max.spent || 0) ? { category: budget.category, spent } : max;
      }, {});
      
      return `Your biggest spending category is ${topCategory.category || 'Housing'} at $${(topCategory.spent || 0).toLocaleString()} this month. ${topCategory.spent > 0 ? 'Consider ways to optimize this category for better savings.' : 'Review your spending patterns to identify optimization opportunities.'}`;
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      const activeGoals = goals.length;
      const onTrackGoals = goals.filter((g: any) => (g.current_amount / g.target_amount) >= 0.5).length;
      
      return `You have ${activeGoals} active financial goals, with ${onTrackGoals} on track to meet their targets. ${activeGoals > onTrackGoals ? 'Consider adjusting timelines or increasing contributions for goals that are behind schedule.' : 'Keep up the great work on your goal progress!'}`;
    }
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('adjust')) {
      const overBudgetCategories = budgets.filter((budget: any) => {
        const spent = transactions
          .filter((t: any) => t.category === budget.category && t.type === 'expense')
          .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
        return spent > budget.amount;
      }).length;
      
      return `${overBudgetCategories > 0 ? `You're over budget in ${overBudgetCategories} categories this month. Focus on these areas for immediate improvement.` : 'Your budget looks well-managed! Consider increasing savings allocations if you have room.'} Regular budget reviews help maintain financial health.`;
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      const emergencyGoal = goals.find((g: any) => g.category.toLowerCase().includes('emergency'));
      const monthsOfExpenses = emergencyGoal ? (emergencyGoal.current_amount / totalExpenses) : 0;
      
      return `${emergencyGoal ? `Your emergency fund covers ${monthsOfExpenses.toFixed(1)} months of expenses.` : 'Consider setting up an emergency fund goal.'} Financial experts recommend 3-6 months of expenses for adequate protection against unexpected events.`;
    }
    
    // Default response
    return "I'd be happy to help you with your financial questions! I can provide insights about your spending patterns, savings rate, budget optimization, and goal progress. What specific aspect of your finances would you like to discuss?";
  }

  static async saveChatMessage(message: ChatMessage): Promise<void> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert([message]);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    }
    
    // Save to mock data
    const stored = localStorage.getItem('mockChatHistory');
    const history = stored ? JSON.parse(stored) : [];
    history.push(message);
    localStorage.setItem('mockChatHistory', JSON.stringify(history));
  }
}