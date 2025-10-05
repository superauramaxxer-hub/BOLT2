import React from 'react';
import { DashboardOverview } from '../components/Dashboard/DashboardOverview';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DashboardOverview />
      </div>
    </div>
  );
};