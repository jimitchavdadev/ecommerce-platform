'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { items } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = isMounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          E-Commerce Store
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-300">
            Products
          </Link>
          <Link href="/account/orders" className="hover:text-gray-300">
            My Orders
          </Link>
          <Link href="/cart" className="relative hover:text-gray-300">
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
