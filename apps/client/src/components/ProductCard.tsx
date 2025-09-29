'use client';

import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="w-full h-48 bg-gray-200 mb-4 rounded flex items-center justify-center">
          <span className="text-gray-500">Image</span>
        </div>
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-700">${product.price.toFixed(2)}</p>
      </Link>
      <button
        onClick={() => addItem(product)}
        className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}
