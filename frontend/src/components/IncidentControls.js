// src/components/IncidentControls.js
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  Database, 
  Cpu, 
  HardDrive, 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const IncidentControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [incidentHistory, setIncidentHistory] = useState([]);
  const [apiUrl] = useState(process.env.REACT_APP_API_URL || 'https://incident-sim-1755610221.uc.r.appspot.com');

  // Fetch system metrics every 5 seconds
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/health`);
        if (response.ok) {
          const data = await response.json();
          setSystemMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const triggerIncident = async (type, config = {}) => {
    setIsLoading(true);
    const incident = { 
      type, 
      startTime: new Date(), 
      config, 
      status: 'triggering',
      severity: getIncidentSeverity(type)
    };
    setCurrentIncident(incident);

    try {
      let endpoint = '';
      let method = 'POST';
      let body = '';

      switch (type) {
        case 'cpu-stress':
          endpoint = '/api/stress-test';
          break;
        case 'memory-leak':
          endpoint = '/api/memory-leak';
          break;
        case 'database-overload':
          endpoint = '/api/db-overload';
          break;
        case 'advanced-cpu':
          endpoint = '/api/admin/cpu-stress';
          body = JSON.stringify({ duration: config.duration || 120000 });
          break;
        case 'advanced-memory':
          endpoint = '/api/admin/memory-leak';
          body = JSON.stringify({ 
            size: config.size || 5, 
            interval: config.interval || 1000, 
            duration: config.duration || 60000 
          });
          break;
        case 'advanced-db':
          endpoint = '/api/admin/db-stress';
          body = JSON.stringify({ 
            connections: config.connections || 20, 
            duration: config.duration || 60000 
          });
          break;
        default:
          throw new Error('Unknown incident type');
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body || undefined,
      });

      if (response.ok) {
        const result = await response.json();
        const updatedIncident = {
          ...incident,
          result,
          status: 'active'
        };
        
        setCurrentIncident(updatedIncident);
        setIncidentHistory(prev => [...prev, updatedIncident]);
      } else {
        throw new Error('Failed to trigger incident');
      }
    } catch (error) {
      console.error('Error triggering incident:', error);
      setCurrentIncident(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getIncidentSeverity = (type) => {
    switch (type) {
      case 'cpu-stress':
      case 'advanced-cpu':
        return 'critical';
      case 'memory-leak':
      case 'advanced-memory':
        return 'critical';
      case 'database-overload':
      case 'advanced-db':
        return 'high';
      default:
        return 'medium';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'cpu-stress':
      case 'advanced-cpu':
        return <Cpu className="w-6 h-6" />;
      case 'memory-leak':
      case 'advanced-memory':
        return <HardDrive className="w-6 h-6" />;
      case 'database-overload':
      case 'advanced-db':
        return <Database className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getIncidentColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 hover:bg-red-600 border-red-600';
      case 'high':
        return 'bg-orange-500 hover:bg-orange-600 border-orange-600';
      case 'medium':
        return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
    }
  };

  const stopIncident = async (type) => {
    try {
      if (type === 'memory-leak' || type === 'advanced-memory') {
        await fetch(`${apiUrl}/api/memory-leak`, { method: 'POST' });
      }
      setCurrentIncident(null);
      setIncidentHistory(prev => 
        prev.map(incident => 
          incident.type === type 
            ? { ...incident, status: 'stopped', endTime: new Date() }
            : incident
        )
      );
    } catch (error) {
      console.error('Error stopping incident:', error);
    }
  };

  const clearMemory = async () => {
    try {
      await fetch(`${apiUrl}/api/admin/clear-memory`, { method: 'POST' });
      setIncidentHistory(prev => 
        prev.map(incident => 
          incident.type === 'memory-leak' || incident.type === 'advanced-memory'
            ? { ...incident, status: 'mitigated', endTime: new Date() }
            : incident
        )
      );
      setCurrentIncident(null);
    } catch (error) {
      console.error('Error clearing memory:', error);
    }
  };

  const getMitigationSteps = (type) => {
    switch (type) {
      case 'cpu-stress':
      case 'advanced-cpu':
        return [
          'Stop CPU-intensive processes',
          'Scale up instances if needed',
          'Check for infinite loops',
          'Monitor CPU usage trends'
        ];
      case 'memory-leak':
      case 'advanced-memory':
        return [
          'Clear memory leak simulation',
          'Restart affected instances',
          'Check for memory leaks in code',
          'Monitor memory usage patterns'
        ];
      case 'database-overload':
      case 'advanced-db':
        return [
          'Close excess database connections',
          'Optimize database queries',
          'Scale database resources',
          'Check for connection pooling issues'
        ];
      default:
        return ['Investigate root cause', 'Apply appropriate fix'];
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          🚨 Incident Response Simulation
        </h1>
        <p className="text-lg text-gray-600">
          Professional incident simulation and response training platform
        </p>
      </div>

      {/* Real-time System Metrics */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-3 text-indigo-600" />
          Real-time System Health
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="text-lg font-semibold text-green-600">
                {systemMetrics?.status || 'Loading...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">CPU:</span>
              <span className="text-lg font-semibold text-indigo-600">
                {systemMetrics?.cpu?.usage ? `${(systemMetrics.cpu.usage * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Memory:</span>
              <span className="text-lg font-semibold text-purple-600">
                {systemMetrics?.memory?.usage ? `${(systemMetrics.memory.usage / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Uptime:</span>
              <span className="text-lg font-semibold text-orange-600">
                {systemMetrics?.uptime ? `${Math.floor(systemMetrics.uptime / 60)}m` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Incidents */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-3 text-yellow-600" />
            Basic Incident Simulation
          </h3>
          <div className="space-y-4">
            <button
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
                currentIncident?.type === 'cpu-stress' 
                  ? 'bg-red-100 border-red-500 text-red-700 shadow-lg' 
                  : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50 hover:shadow-lg'
              }`}
              onClick={() => triggerIncident('cpu-stress')}
              disabled={isLoading}
            >
              <Cpu className="w-5 h-5" />
              <span className="font-semibold">CPU Stress Test (30s)</span>
            </button>
            
            <button
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
                currentIncident?.type === 'memory-leak' 
                  ? 'bg-red-100 border-red-500 text-red-700 shadow-lg' 
                  : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:shadow-lg'
              }`}
              onClick={() => triggerIncident('memory-leak')}
              disabled={isLoading}
            >
              <HardDrive className="w-5 h-5" />
              <span className="font-semibold">Memory Leak (1MB/s)</span>
            </button>
            
            <button
              className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center space-x-3 ${
                currentIncident?.type === 'database-overload' 
                  ? 'bg-red-100 border-red-500 text-red-700 shadow-lg' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
              }`}
              onClick={() => triggerIncident('database-overload')}
              disabled={isLoading}
            >
              <Database className="w-5 h-5" />
              <span className="font-semibold">Database Overload</span>
            </button>
          </div>
        </div>

        {/* Advanced Incidents */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-3 text-purple-600" />
            Advanced Incident Simulation
          </h3>
          <div className="space-y-4">
            <button
              className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
              onClick={() => triggerIncident('advanced-cpu', { duration: 120000 })}
              disabled={isLoading}
            >
              <Cpu className="w-5 h-5" />
              <span className="font-semibold">Advanced CPU Stress (2min)</span>
            </button>
            
            <button
              className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
              onClick={() => triggerIncident('advanced-memory', { size: 5, interval: 1000, duration: 60000 })}
              disabled={isLoading}
            >
              <HardDrive className="w-5 h-5" />
              <span className="font-semibold">Advanced Memory Leak (5MB/s)</span>
            </button>
            
            <button
              className="w-full p-5 rounded-2xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
              onClick={() => triggerIncident('advanced-db', { connections: 20, duration: 60000 })}
              disabled={isLoading}
            >
              <Database className="w-5 h-5" />
              <span className="font-semibold">Advanced DB Stress (20 connections)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Incident & Mitigation */}
      {currentIncident && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
              Active Incident: {currentIncident.type.replace('-', ' ')}
            </h3>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              currentIncident.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {currentIncident.status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Started</p>
              <p className="font-semibold text-lg">{currentIncident.startTime.toLocaleTimeString()}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Duration</p>
              <p className="font-semibold text-lg">
                {Math.floor((Date.now() - currentIncident.startTime.getTime()) / 1000)}s
              </p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Severity</p>
              <p className={`font-semibold text-lg ${
                currentIncident.severity === 'critical' ? 'text-red-600' : 
                currentIncident.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
              }`}>
                {currentIncident.severity ? currentIncident.severity.toUpperCase() : 'UNKNOWN'}
              </p>
            </div>
          </div>

          {/* Mitigation Actions */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-green-600" />
              Incident Response & Mitigation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">Recommended Actions:</h5>
                <ul className="space-y-3">
                  {getMitigationSteps(currentIncident.type).map((step, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">Quick Actions:</h5>
                <div className="space-y-3">
                  <button
                    className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                    onClick={() => stopIncident(currentIncident.type)}
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Stop Incident</span>
                  </button>
                  
                  {(currentIncident.type === 'memory-leak' || currentIncident.type === 'advanced-memory') && (
                    <button
                      className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                      onClick={clearMemory}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Clear Memory Leak</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident History */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-3 text-gray-600" />
          Incident History
        </h3>
        <div className="space-y-4">
          {incidentHistory.slice(-5).reverse().map((incident, index) => (
            <div key={index} className={`p-5 rounded-2xl border-l-4 transition-all duration-300 hover:shadow-lg ${
              incident.status === 'active' ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100' :
              incident.status === 'mitigated' ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100' :
              incident.status === 'stopped' ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100' :
              'border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getIncidentIcon(incident.type)}
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{incident.type.replace('-', ' ')}</p>
                    <p className="text-sm text-gray-600">
                      Started: {incident.startTime.toLocaleTimeString()}
                      {incident.endTime && ` | Ended: ${incident.endTime.toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-2 rounded-full text-sm font-semibold ${
                  incident.status === 'active' ? 'bg-red-100 text-red-800' :
                  incident.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                  incident.status === 'stopped' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {incident.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GCP Monitoring Links */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-3 text-blue-600" />
          GCP Monitoring & Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">View Monitoring Dashboard</span>
          </a>
          <a
            href="https://console.cloud.google.com/logs/query?project=incident-sim-1755610221"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Info className="w-5 h-5" />
            <span className="font-semibold">View Application Logs</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default IncidentControls;