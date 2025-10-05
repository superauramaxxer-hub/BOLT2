import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './components/Toast/ToastContainer';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import Budget from './pages/Budget';
import Advisory from './pages/Advisory';
import Market from './pages/Market';
import Goals from './pages/Goals';

function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/advisory" element={<Advisory />} />
              <Route path="/market" element={<Market />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/notifications" element={<Dashboard />} />
              <Route path="/transactions" element={<Budget />} />
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </ToastProvider>
  );
}

export default App;