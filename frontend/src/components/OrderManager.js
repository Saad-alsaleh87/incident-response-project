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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Order Manager</h2>
        <div className="text-sm text-gray-600">
          Total Orders: {stats.total} | Revenue: ${stats.totalRevenue.toFixed(2)}
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-700">{stats.pending || 0}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.processing || 0}</div>
          <div className="text-sm text-blue-600">Processing</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-700">{stats.shipped || 0}</div>
          <div className="text-sm text-purple-600">Shipped</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">{stats.delivered || 0}</div>
          <div className="text-sm text-green-600">Delivered</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-700">{stats.cancelled || 0}</div>
          <div className="text-sm text-red-600">Cancelled</div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders, customers, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Order ID</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Items</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Total</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-3 font-medium text-blue-600">{order.id}</td>
                <td className="border border-gray-200 px-4 py-3">
                  <div>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm">
                  {order.orderDate.toLocaleDateString()}
                </td>
                <td className="border border-gray-200 px-4 py-3 text-sm">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="border border-gray-200 px-4 py-3 font-semibold">
                  ${order.total.toFixed(2)}
                </td>
                <td className="border border-gray-200 px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="border border-gray-200 px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
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
          <div className="text-center py-8 text-gray-500">
            No orders found matching your search criteria.
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-700">Order ID</h4>
                  <p className="text-blue-600 font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Order Date</h4>
                  <p>{selectedOrder.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Status</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Total</h4>
                  <p className="text-lg font-bold text-green-600">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Customer Information</h4>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder(prev => ({ ...prev, status: e.target.value }));
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors"
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