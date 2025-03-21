// src/app/page.tsx
import Link from 'next/link'
import { RegisterDialog } from '@/components/auth/register-dialog'
import { DemoButton } from '@/components/layout/demo-button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Better Habits
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your life with atomic habits. Track your progress, stay accountable,
            and achieve your goals with our scientifically-proven approach.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <RegisterDialog />
            <Link
              href="/login"
              className="btn-lg btn-outline"
            >
              Login
            </Link>
            <DemoButton />
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Want to try it first? Click "Try Demo" to use the app with sample data.</p>
            <p>No account required, and all changes will be saved to your browser.</p>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Habits</h3>
              <p className="text-gray-600">Define the habits you want to build with detailed descriptions and schedules.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Consistently</h3>
              <p className="text-gray-600">Check off your habits daily and build streaks to reinforce your progress.</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">See Your Growth</h3>
              <p className="text-gray-600">Monitor your progress and celebrate your achievements as habits become automatic.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Atomic Habits Tracker. All rights reserved.</p>
          <p className="mt-2 text-sm">Inspired by James Clear's "Atomic Habits" book.</p>
        </div>
      </footer>
    </div>
  );
}