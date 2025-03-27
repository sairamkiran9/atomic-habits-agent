// src/app/page.tsx
import Link from 'next/link'
import { RegisterDialog } from '@/components/auth/register-dialog'
import { DemoButton } from '@/components/layout/demo-button'

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-[#f7e8dc] px-4 dot-pattern-dense">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            Build Better Habits
          </h1>
          <p className="text-xl text-amber-800/80 mb-8 max-w-2xl mx-auto">
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
          
          <div className="mt-8 text-sm text-amber-700/60">
            <p>Want to try it first? Click "Try Demo" to use the app with sample data.</p>
            <p>No account required, and all changes will be saved to your browser.</p>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      {/* <div className="py-16 bg-amber-50/50 dark:bg-amber-950/20 dot-pattern">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-amber-900/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200/50 dark:border-amber-700/30">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[#d58b4b] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-800 dark:text-amber-300">Create Your Habits</h3>
              <p className="text-amber-700/80 dark:text-amber-400/80">Define the habits you want to build with detailed descriptions and schedules.</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-amber-900/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200/50 dark:border-amber-700/30">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[#d58b4b] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-800 dark:text-amber-300">Track Consistently</h3>
              <p className="text-amber-700/80 dark:text-amber-400/80">Check off your habits daily and build streaks to reinforce your progress.</p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-amber-900/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200/50 dark:border-amber-700/30">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-[#d58b4b] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900 dark:text-amber-400">See Your Growth</h3>
              <p className="text-amber-800 dark:text-amber-300/80">Monitor your progress and celebrate your achievements as habits become automatic.</p>
            </div>
          </div>
        </div>
      </div> */}
      
      {/* Footer section is now in layout.tsx */}
    </div>
  );
}