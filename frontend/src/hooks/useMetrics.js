// src/hooks/useMetrics.js
import { useState, useEffect } from 'react';

const useMetrics = () => {
  const [metrics, setMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    requestsPerSecond: 0,
    databaseConnections: 0,
    uptime: 0
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time metrics updates
    const generateRandomMetrics = () => {
      setMetrics(prev => ({
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        responseTime: Math.random() * 1000 + 50,
        errorRate: Math.random() * 5,
        activeUsers: Math.floor(Math.random() * 1000) + 100,
        requestsPerSecond: Math.floor(Math.random() * 500) + 50,
        databaseConnections: Math.floor(Math.random() * 50) + 10,
        uptime: prev.uptime + 1
      }));
    };

    // Initial load
    generateRandomMetrics();
    setIsConnected(true);

    // Update metrics every 2 seconds
    const interval = setInterval(generateRandomMetrics, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  const triggerIncident = (type) => {
    switch (type) {
      case 'high-cpu':
        setMetrics(prev => ({ ...prev, cpuUsage: 95 + Math.random() * 5 }));
        break;
      case 'memory-leak':
        setMetrics(prev => ({ ...prev, memoryUsage: 90 + Math.random() * 10 }));
        break;
      case 'slow-response':
        setMetrics(prev => ({ ...prev, responseTime: 5000 + Math.random() * 2000 }));
        break;
      case 'high-error-rate':
        setMetrics(prev => ({ ...prev, errorRate: 15 + Math.random() * 10 }));
        break;
      default:
        break;
    }
  };

  return {
    metrics,
    isConnected,
    triggerIncident
  };
};

export default useMetrics;