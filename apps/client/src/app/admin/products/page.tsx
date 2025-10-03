'use client';
// This page would be expanded with forms for creating/editing products

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState('Loading products...');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      if (res.data.length === 0) {
        setMessage('No products found.');
      }
    } catch (error) {
      setMessage('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = await getAuthToken(); // Admin token needed
    if (!token) {
        alert("Authentication failed. Cannot delete.");
        return;
    }
    
    try {
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refetch products after deletion
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product. Note: The test user may not be an admin.');
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
      {/* Add a 'Create New' button here in a real app */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Price</th>
              <th className="py-2 px-4 border">Stock</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border">{product.name}</td>
                  <td className="py-2 px-4 border">${product.price.toFixed(2)}</td>
                  <td className="py-2 px-4 border">{product.stock}</td>
                  <td className="py-2 px-4 border text-center">
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    {/* Add an 'Edit' link here in a real app */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4">{message}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
