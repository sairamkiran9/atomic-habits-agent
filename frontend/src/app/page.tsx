import Link from 'next/link'
import { RegisterDialog } from '@/components/auth/register-dialog'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Better Habits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your life with atomic habits. Track your progress, stay accountable,
            and achieve your goals with our scientifically-proven approach.
          </p>
          <div className="flex gap-4 justify-center">
            <RegisterDialog />
            <Link
              href="/login"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors border border-blue-200"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Atomic Habits Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}