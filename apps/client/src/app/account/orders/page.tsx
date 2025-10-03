'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { Product } from '@/types';

// Define more specific types for the order data
type OrderItem = {
  quantity: number;
  product: Product;
};

type Order = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  shippingAddress: string;
  items: OrderItem[];
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      const token = await getAuthToken();
      if (!token) {
        setError('Could not authenticate to fetch orders.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/orders/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <p>Loading your orders...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-3 flex-wrap">
                <div>
                  <h2 className="text-xl font-semibold">
                    Order #{order.id.substring(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{' '}
                    <span className="font-medium text-blue-600">
                      {order.status}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <h3 className="font-semibold mb-2">Items:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {order.items.map((item) => (
                    <li key={item.product.id}>
                      {item.product.name} ({item.quantity} x $
                      {item.product.price.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
