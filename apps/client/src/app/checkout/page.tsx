'use client';

import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import api from '@/lib/api';

const getAuthToken = async () => {
  try {
    const res = await api.post('/auth/login', {
      email: 'user@test.com',
      password: 'password123',
    });
    return res.data.access_token;
  } catch (error) {
    console.error('Failed to log in', error);
    return null;
  }
};

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setOrderStatus('Your cart is empty.');
      return;
    }
    if (!shippingAddress) {
      setOrderStatus('Please enter a shipping address.');
      return;
    }

    setIsLoading(true);
    setOrderStatus('Placing order...');

    const token = await getAuthToken();
    if (!token) {
      setOrderStatus('Could not authenticate user. Please try again.');
      setIsLoading(false);
      return;
    }

    const orderData = {
      shippingAddress,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      await api.post('/orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrderStatus('Order placed successfully!');
      clearCart();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to place order.';
      setOrderStatus(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {items.length === 0 && orderStatus === '' ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your full shipping address"
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 rounded-lg text-lg hover:bg-green-600 disabled:bg-gray-400"
              >
                {isLoading ? 'Placing Order...' : 'Place Order'}
              </button>
              {orderStatus && <p className="mt-4 text-center">{orderStatus}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
