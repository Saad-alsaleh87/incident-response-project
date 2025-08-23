import React, { useState } from 'react';
import { AlertTriangle, Activity, Database, ShoppingCart, Settings, RefreshCw } from 'lucide-react';
import useMetrics from './hooks/useMetrics'; // Fixed import
import MetricsDashboard from './components/MetricsDashboard';
import IncidentControls from './components/IncidentControls';
import ProductManager from './components/ProductManager';
import OrderManager from './components/OrderManager';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { metrics, isConnected, triggerIncident } = useMetrics(); // Fixed hook usage

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'incidents', label: 'Incident Control', icon: AlertTriangle },
    { id: 'products', label: 'Products', icon: Database },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MetricsDashboard metrics={metrics} isConnected={isConnected} />; // Fixed props
      case 'incidents':
        return <IncidentControls onTriggerIncident={triggerIncident} />; // Fixed props
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      default:
        return <MetricsDashboard metrics={metrics} isConnected={isConnected} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <Settings className="title-icon" />
            Incident Response Dashboard
          </h1>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={() => window.location.reload()} // Simple refresh for now
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <div className="status-indicator">
              <div className={`status-dot ${isConnected ? 'healthy' : 'error'}`}></div>
              {isConnected ? 'System Online' : 'Connection Error'}
            </div>
          </div>
        </div>
      </header>

      <div className="app-body">
        <nav className="sidebar">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>

      {!isConnected && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          Connection Error: Unable to connect to metrics service
        </div>
      )}
    </div>
  );
}

export default App;