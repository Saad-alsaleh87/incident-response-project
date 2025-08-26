// src/components/OrderManager.js
import React, { useState, useEffect } from 'react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Sample initial data
  useEffect(() => {
    const sampleOrders = [
      {
        id: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@email.com',
        items: [
          { name: 'Laptop Pro', quantity: 1, price: 1299.99 },
          { name: 'Wireless Mouse', quantity: 2, price: 29.99 }
        ],
        total: 1359.97,
        status: 'pending',
        orderDate: new Date('2024-01-15'),
        shippingAddress: '123 Main St, City, State 12345'
      },
      {
        id: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@email.com',
        items: [
          { name: 'Office Chair', quantity: 1, price: 199.99 }
        ],
        total: 199.99,
        status: 'shipped',
        orderDate: new Date('2024-01-14'),
        shippingAddress: '456 Oak Ave, Town, State 67890'
      },
      {
        id: 'ORD-003',
        customerName: 'Bob Johnson',
        customerEmail: 'bob.johnson@email.com',
        items: [
          { name: 'Coffee Mug', quantity: 3, price: 12.99 },
          { name: 'Wireless Mouse', quantity: 1, price: 29.99 }
        ],
        total: 68.96,
        status: 'delivered',
        orderDate: new Date('2024-01-13'),
        shippingAddress: '789 Pine Rd, Village, State 54321'
      },
      {
        id: 'ORD-004',
        customerName: 'Alice Wilson',
        customerEmail: 'alice.wilson@email.com',
        items: [
          { name: 'Laptop Pro', quantity: 1, price: 1299.99 }
        ],
        total: 1299.99,
        status: 'cancelled',
        orderDate: new Date('2024-01-12'),
        shippingAddress: '321 Elm St, Borough, State 98765'
      }
    ];
    setOrders(sampleOrders);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.orderDate) - new Date(a.orderDate);
        case 'customer': return a.customerName.localeCompare(b.customerName);
        case 'total': return b.total - a.total;
        case 'status': return a.status.localeCompare(b.status);
        default: return 0;
      }
    });

  const getOrderStats = () => {
    const stats = orders.reduce((acc, order) => {
      acc.total++;
      acc.totalRevenue += order.total;
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, { total: 0, totalRevenue: 0 });

    return stats;
  };

  const stats = getOrderStats();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Manager</h2>
          <p className="text-gray-600">Track and manage customer orders and fulfillment</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600 mb-1">Total Orders: <span className="font-semibold text-indigo-600">{stats.total}</span></div>
          <div className="text-lg font-bold text-green-600">Revenue: ${stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-700 mb-2">{stats.pending || 0}</div>
          <div className="text-sm font-semibold text-yellow-600">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl text-center border border-indigo-200">
          <div className="text-3xl font-bold text-indigo-700 mb-2">{stats.processing || 0}</div>
          <div className="text-sm font-semibold text-indigo-600">Processing</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border border-purple-200">
          <div className="text-3xl font-bold text-purple-700 mb-2">{stats.shipped || 0}</div>
          <div className="text-sm font-semibold text-purple-600">Shipped</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200">
          <div className="text-3xl font-bold text-green-700 mb-2">{stats.delivered || 0}</div>
          <div className="text-sm font-semibold text-green-600">Delivered</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl text-center border border-red-200">
          <div className="text-3xl font-bold text-red-700 mb-2">{stats.cancelled || 0}</div>
          <div className="text-sm font-semibold text-red-600">Cancelled</div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders, customers, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="customer">Sort by Customer</option>
            <option value="total">Sort by Total</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Order ID</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Customer</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Date</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Items</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Total</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300">
                <td className="px-6 py-4 font-medium text-indigo-600 border-b border-gray-100">{order.id}</td>
                <td className="px-6 py-4 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-gray-800">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-100">
                  {order.orderDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-100">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800 border-b border-gray-100">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 border-b border-gray-100">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-2 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} transition-all duration-300`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 border-b border-gray-100">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm rounded-2xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredAndSortedOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg">No orders found matching your search criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Order ID</h4>
                  <p className="text-indigo-600 font-medium text-lg">{selectedOrder.id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Order Date</h4>
                  <p className="text-gray-800">{selectedOrder.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Status</h4>
                  <span className={`px-3 py-2 rounded-full text-xs font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Total</h4>
                  <p className="text-2xl font-bold text-green-600">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Customer Information</h4>
                <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50">
                  <p className="mb-2"><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p className="mb-2"><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white hover:shadow-md transition-all duration-300">
                      <div>
                        <h5 className="font-medium text-gray-800">{item.name}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-2xl hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;