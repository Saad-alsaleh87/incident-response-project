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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚨 Incident Response Simulation
          </h1>
          <p className="text-xl text-gray-600">
            Professional incident simulation and response training platform
          </p>
        </div>

        {/* Real-time System Metrics */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-3 text-blue-600" />
            Real-time System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Status</p>
                  <p className="text-2xl font-bold">
                    {systemMetrics?.status || 'Loading...'}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">CPU Usage</p>
                  <p className="text-2xl font-bold">
                    {systemMetrics?.cpu?.usage ? `${(systemMetrics.cpu.usage * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
                <Cpu className="w-8 h-8" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Memory</p>
                  <p className="text-2xl font-bold">
                    {systemMetrics?.memory?.usage ? `${(systemMetrics.memory.usage / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                  </p>
                </div>
                <HardDrive className="w-8 h-8" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Uptime</p>
                  <p className="text-2xl font-bold">
                    {systemMetrics?.uptime ? `${Math.floor(systemMetrics.uptime / 60)}m` : 'N/A'}
                  </p>
                </div>
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Incident Triggers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Incidents */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-600" />
              Basic Incident Simulation
            </h3>
            <div className="space-y-3">
              <button
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                  currentIncident?.type === 'cpu-stress' 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
                onClick={() => triggerIncident('cpu-stress')}
                disabled={isLoading}
              >
                <Cpu className="w-5 h-5" />
                <span className="font-semibold">CPU Stress Test (30s)</span>
              </button>
              
              <button
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                  currentIncident?.type === 'memory-leak' 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
                onClick={() => triggerIncident('memory-leak')}
                disabled={isLoading}
              >
                <HardDrive className="w-5 h-5" />
                <span className="font-semibold">Memory Leak (1MB/s)</span>
              </button>
              
              <button
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                  currentIncident?.type === 'database-overload' 
                    ? 'bg-red-100 border-red-500 text-red-700' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
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
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              Advanced Incident Simulation
            </h3>
            <div className="space-y-3">
              <button
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-3"
                onClick={() => triggerIncident('advanced-cpu', { duration: 120000 })}
                disabled={isLoading}
              >
                <Cpu className="w-5 h-5" />
                <span className="font-semibold">Advanced CPU Stress (2min)</span>
              </button>
              
              <button
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-3"
                onClick={() => triggerIncident('advanced-memory', { size: 5, interval: 1000, duration: 60000 })}
                disabled={isLoading}
              >
                <HardDrive className="w-5 h-5" />
                <span className="font-semibold">Advanced Memory Leak (5MB/s)</span>
              </button>
              
              <button
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center space-x-3"
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
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
                Active Incident: {currentIncident.type.replace('-', ' ')}
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                currentIncident.status === 'active' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {currentIncident.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-semibold">{currentIncident.startTime.toLocaleTimeString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">
                  {Math.floor((Date.now() - currentIncident.startTime.getTime()) / 1000)}s
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Severity</p>
                <p className={`font-semibold ${
                  currentIncident.severity === 'critical' ? 'text-red-600' : 
                  currentIncident.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                }`}>
                  {currentIncident.severity ? currentIncident.severity.toUpperCase() : 'UNKNOWN'}
                </p>
              </div>
            </div>

            {/* Mitigation Actions */}
            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Incident Response & Mitigation
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Recommended Actions:</h5>
                  <ul className="space-y-2">
                    {getMitigationSteps(currentIncident.type).map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Quick Actions:</h5>
                  <div className="space-y-2">
                    <button
                      className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                      onClick={() => stopIncident(currentIncident.type)}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Stop Incident</span>
                    </button>
                    
                    {(currentIncident.type === 'memory-leak' || currentIncident.type === 'advanced-memory') && (
                      <button
                        className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                        onClick={clearMemory}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Clear Memory Leak</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incident History */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Incident History
          </h3>
          <div className="space-y-3">
            {incidentHistory.slice(-5).reverse().map((incident, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                incident.status === 'active' ? 'border-red-500 bg-red-50' :
                incident.status === 'mitigated' ? 'border-green-500 bg-green-50' :
                incident.status === 'stopped' ? 'border-yellow-500 bg-yellow-50' :
                'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getIncidentIcon(incident.type)}
                    <div>
                      <p className="font-semibold text-gray-800">{incident.type.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-600">
                        Started: {incident.startTime.toLocaleTimeString()}
                        {incident.endTime && ` | Ended: ${incident.endTime.toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            GCP Monitoring & Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://console.cloud.google.com/monitoring/dashboards?project=incident-sim-1755610221"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>View Monitoring Dashboard</span>
            </a>
            <a
              href="https://console.cloud.google.com/logs/query?project=incident-sim-1755610221"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Info className="w-5 h-5" />
              <span>View Application Logs</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentControls;