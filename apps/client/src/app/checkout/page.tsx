'use client';

import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import useRazorpay from 'razorpay/react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const Razorpay = useRazorpay();
  const router = useRouter();

  useEffect(() => {
    // Pre-fetch auth token on component mount
    const fetchToken = async () => {
      const authToken = await getAuthToken();
      setToken(authToken);
    };
    fetchToken();
  }, []);

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const handlePayment = async () => {
    if (items.length === 0) {
      setStatusMessage('Your cart is empty.');
      return;
    }
    if (!shippingAddress) {
      setStatusMessage('Please enter a shipping address.');
      return;
    }
    if (!token) {
      setStatusMessage('Authentication failed. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Preparing your order...');

    try {
      // Step 1: Create a 'PENDING' order in our own database
      const appOrderResponse = await api.post(
        '/orders',
        {
          shippingAddress,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const internalOrder = appOrderResponse.data;

      // Step 2: Create a Razorpay order
      const razorpayOrderResponse = await api.post(
        '/payments/create-order',
        {
          amount: internalOrder.total,
          receipt: internalOrder.id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const razorpayOrder = razorpayOrderResponse.data;

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'E-Commerce Platform',
        description: `Order #${internalOrder.id}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // Step 4: Verify payment on our backend
          setStatusMessage('Verifying payment...');
          try {
            await api.post(
              '/payments/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internal_order_id: internalOrder.id,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            setStatusMessage('Order placed successfully! Redirecting...');
            clearCart();
            setTimeout(() => router.push('/account/orders'), 2000);
          } catch (verifyError: any) {
            setStatusMessage(`Payment verification failed: ${verifyError.response?.data?.message}`);
          }
        },
        prefill: {
          name: 'Test User', // Can be dynamically filled
          email: 'user@test.com',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setStatusMessage(`Payment Failed: ${response.error.description}`);
        setIsLoading(false);
      });
      rzp.open();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to initialize payment.';
      setStatusMessage(`Error: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !statusMessage.includes('successfully')) {
      return (
          <div>
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <p>Your cart is empty. <Link href="/" className="text-blue-500">Go shopping!</Link></p>
          </div>
      )
  }

  if (statusMessage.includes('successfully')) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Thank You!</h1>
            <p className="text-green-600">{statusMessage}</p>
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {/* Order Summary UI as before */}
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
          <h2 className="text-xl font-semibold mb-4">Shipping & Payment</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handlePayment}
              disabled={isLoading || !token}
              className="w-full bg-green-500 text-white py-3 rounded-lg text-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {isLoading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
            </button>
            {statusMessage && <p className="mt-4 text-center">{statusMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
