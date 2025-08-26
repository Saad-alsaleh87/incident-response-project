// src/components/MetricsDashboard.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MetricsDashboard = ({ metrics, isConnected }) => {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [systemHealthData, setSystemHealthData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Generate sample time series data for charts
  useEffect(() => {
    const generateTimeSeriesData = () => {
      const now = new Date();
      const data = [];
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          cpu: Math.random() * 30 + 20,
          memory: Math.random() * 20 + 40,
          responseTime: Math.random() * 200 + 100,
          errorRate: Math.random() * 2
        });
      }
      setTimeSeriesData(data);
      setIsLoading(false);
    };

    generateTimeSeriesData();
    const interval = setInterval(generateTimeSeriesData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Generate system health data for pie chart
  useEffect(() => {
    const healthData = [
      { name: 'Healthy', value: 75, color: '#10b981' },
      { name: 'Warning', value: 15, color: '#f59e0b' },
      { name: 'Critical', value: 10, color: '#ef4444' }
    ];
    setSystemHealthData(healthData);
  }, []);

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

  const getTrend = (metric) => {
    // Simulate trend data - in real app this would come from historical data
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  const getStatusColor = (status) => {
    if (status === 'critical') return 'text-red-600 bg-red-50 border-red-200';
    if (status === 'warning') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">System Analytics Dashboard</h2>
            <p className="text-gray-600">Real-time monitoring with advanced analytics and trend analysis</p>
          </div>
          <div className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 rounded-2xl border border-purple-200">
            <div 
              className={`w-4 h-4 rounded-full mr-3 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              } shadow-lg`}
            />
            <span className="text-sm font-semibold text-gray-700">
              {isConnected ? 'System Online' : 'System Offline'}
            </span>
          </div>
        </div>

        {/* Core System Metrics Table */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Core System Metrics</h3>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Metric</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Trend</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Current Value</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">Threshold</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900 border-r border-gray-100">CPU Usage</td>
                  <td className="px-8 py-6 text-center text-xl border-r border-gray-100">{getTrendIcon(getTrend('cpu'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900 border-r border-gray-100">{metrics.cpuUsage.toFixed(1)}%</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600 border-r border-gray-100">90%</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(getMetricStatus('cpuUsage', metrics.cpuUsage))}`}>
                      {getMetricStatus('cpuUsage', metrics.cpuUsage)}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Memory Usage</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('memory'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{metrics.memoryUsage.toFixed(1)}%</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">95%</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(getMetricStatus('memoryUsage', metrics.memoryUsage))}`}>
                      {getMetricStatus('memoryUsage', metrics.memoryUsage)}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Response Time</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('responseTime'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{metrics.responseTime.toFixed(1)}ms</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">1000ms</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(getMetricStatus('responseTime', metrics.responseTime))}`}>
                      {getMetricStatus('responseTime', metrics.responseTime)}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Error Rate</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('errorRate'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{metrics.errorRate.toFixed(1)}%</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">5%</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(getMetricStatus('errorRate', metrics.errorRate))}`}>
                      {getMetricStatus('errorRate', metrics.errorRate)}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Metrics Table */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">Performance Metrics</h3>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Metric</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Trend</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200 border-r border-gray-200">Current Value</th>
                  <th className="px-8 py-6 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">Unit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Active Users</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('users'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{Math.round(metrics.activeUsers)}</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">users</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Requests/sec</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('requests'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{Math.round(metrics.requestsPerSecond)}</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">req/s</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">DB Connections</td>
                  <td className="px-8 py-6 text-center text-xl">{getTrendIcon(getTrend('db'))}</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{Math.round(metrics.databaseConnections)}</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">connections</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6 text-sm font-medium text-gray-900">Uptime</td>
                  <td className="px-8 py-6 text-center text-xl">↗️</td>
                  <td className="px-8 py-6 text-center text-xl font-semibold text-gray-900">{Math.round(metrics.uptime / 60)}</td>
                  <td className="px-8 py-6 text-center text-sm text-gray-600">minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Performance Analytics</h3>
          <div className="flex space-x-2">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedTimeRange === range
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Time Series Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Trends ({selectedTimeRange})</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* System Health Pie Chart */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">System Health Overview</h3>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={systemHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {systemHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center space-x-6 mt-4">
            {systemHealthData.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Summary */}
      <div className="card">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mr-3"></div>
            System Health Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 shadow-sm"></div>
              <span className="text-green-700 font-medium">Normal: Response time, Users</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 shadow-sm"></div>
              <span className="text-yellow-700 font-medium">Warning: CPU/Memory 70-90%</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3 shadow-sm"></div>
              <span className="text-red-700 font-medium">Critical: Above thresholds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;