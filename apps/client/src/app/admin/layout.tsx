import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, this layout would be protected and verify ADMIN role
  return (
    <div>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <nav className="flex space-x-4 mt-2">
            <Link href="/admin/products" className="text-blue-600 hover:underline">Product Management</Link>
            <Link href="/admin/orders" className="text-blue-600 hover:underline">Order Management</Link>
        </nav>
      </div>
      <main>{children}</main>
    </div>
  );
}
