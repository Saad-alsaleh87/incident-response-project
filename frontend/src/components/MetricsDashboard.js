// src/components/MetricsDashboard.js
import React from 'react';

const MetricCard = ({ title, value, unit, threshold, status }) => {
  const getStatusColor = () => {
    if (status === 'critical') return 'border-red-500 bg-red-50';
    if (status === 'warning') return 'border-yellow-500 bg-yellow-50';
    return 'border-green-500 bg-green-50';
  };

  const getTextColor = () => {
    if (status === 'critical') return 'text-red-700';
    if (status === 'warning') return 'text-yellow-700';
    return 'text-green-700';
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className={`text-2xl font-bold ${getTextColor()}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
      </div>
      {threshold && (
        <div className="text-xs text-gray-500 mt-1">
          Threshold: {threshold}{unit}
        </div>
      )}
    </div>
  );
};

const MetricsDashboard = ({ metrics, isConnected }) => {
  const getMetricStatus = (metric, value) => {
    const thresholds = {
      cpuUsage: { warning: 70, critical: 90 },
      memoryUsage: { warning: 80, critical: 95 },
      responseTime: { warning: 500, critical: 1000 },
      errorRate: { warning: 2, critical: 5 }
    };

    if (!thresholds[metric]) return 'normal';
    
    if (value >= thresholds[metric].critical) return 'critical';
    if (value >= thresholds[metric].warning) return 'warning';
    return 'normal';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">System Metrics</h2>
        <div className="flex items-center">
          <div 
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value={metrics.cpuUsage}
          unit="%"
          threshold="90"
          status={getMetricStatus('cpuUsage', metrics.cpuUsage)}
        />
        
        <MetricCard
          title="Memory Usage"
          value={metrics.memoryUsage}
          unit="%"
          threshold="95"
          status={getMetricStatus('memoryUsage', metrics.memoryUsage)}
        />
        
        <MetricCard
          title="Response Time"
          value={metrics.responseTime}
          unit="ms"
          threshold="1000"
          status={getMetricStatus('responseTime', metrics.responseTime)}
        />
        
        <MetricCard
          title="Error Rate"
          value={metrics.errorRate}
          unit="%"
          threshold="5"
          status={getMetricStatus('errorRate', metrics.errorRate)}
        />
        
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          unit=""
          status="normal"
        />
        
        <MetricCard
          title="Requests/sec"
          value={metrics.requestsPerSecond}
          unit=""
          status="normal"
        />
        
        <MetricCard
          title="DB Connections"
          value={metrics.databaseConnections}
          unit=""
          status="normal"
        />
        
        <MetricCard
          title="Uptime"
          value={Math.floor(metrics.uptime / 60)}
          unit="min"
          status="normal"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">System Health</h3>
        <div className="flex space-x-4 text-sm">
          <span className="text-green-600">● Normal: Response time, Users</span>
          <span className="text-yellow-600">● Warning: CPU/Memory 70-90%</span>
          <span className="text-red-600">● Critical: Above thresholds</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;