'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

// Define a more detailed type for admin view
type AdminOrder = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  shippingAddress: string;
  user: {
      name: string;
      email: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState('Loading orders...');

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = await getAuthToken(); // Needs to be an ADMIN token
      if (!token) {
        setMessage('Authentication failed. Cannot fetch orders.');
        return;
      }

      try {
        const res = await api.get('/orders/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
        if (res.data.length === 0) {
            setMessage('No orders have been placed yet.');
        }
      } catch (error) {
        setMessage('Failed to fetch orders. Ensure the logged-in user is an ADMIN.');
        console.error(error);
      }
    };

    fetchAllOrders();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Orders</h2>
       <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Order ID</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Customer</th>
              <th className="py-2 px-4 border">Total</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border text-xs font-mono">{order.id.substring(0,8)}...</td>
                  <td className="py-2 px-4 border">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border">{order.user.name || order.user.email}</td>
                  <td className="py-2 px-4 border">${order.total.toFixed(2)}</td>
                  <td className="py-2 px-4 border">{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">{message}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
