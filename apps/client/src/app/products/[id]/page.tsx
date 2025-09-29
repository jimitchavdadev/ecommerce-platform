import api from '@/lib/api';
import { Product } from '@/types';

async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Product Image</span>
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl text-gray-800 mb-4">${product.price.toFixed(2)}</p>
        <p className="text-gray-600 mb-6">{product.description}</p>
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg hover:bg-blue-600">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
