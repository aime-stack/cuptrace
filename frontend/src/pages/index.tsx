import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">CupTrace</h1>
        <p className="text-gray-600">Tea Management System</p>
        <div className="space-y-4">
          <Link href="/login" className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Login
          </Link>
          <Link href="/signup" className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Sign Up
          </Link>
          <Link href="/tea" className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Tea Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}