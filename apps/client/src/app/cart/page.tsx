'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex justify-between items-center border p-4 rounded-lg"
              >
                <div>
                  <h2 className="text-xl font-semibold">{item.product.name}</h2>
                  <p>
                    ${item.product.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-right">
            <h2 className="text-2xl font-bold">
              Total: ${totalPrice.toFixed(2)}
            </h2>
            <button
              onClick={clearCart}
              className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Clear Cart
            </button>
            <Link href="/checkout" className="mt-4 ml-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
