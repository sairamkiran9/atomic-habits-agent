"use client";

import { useState } from 'react';
import { X, RefreshCw, LogOut } from 'lucide-react';
import { useDemoMode } from '../providers/demo-mode-provider';

export function DemoBanner() {
  const { isDemoMode, disableDemoMode, resetDemo } = useDemoMode();
  const [dismissed, setDismissed] = useState(false);
  
  if (!isDemoMode || dismissed) {
    return null;
  }
  
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 text-sm md:text-base">
          <span className="font-semibold">Demo Mode</span>: You're using demo data. 
          Changes are saved to your browser and will persist between visits.
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={resetDemo}
            className="p-1.5 rounded-full hover:bg-amber-400 transition-colors"
            title="Reset demo data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={disableDemoMode}
            className="p-1.5 rounded-full hover:bg-amber-400 transition-colors"
            title="Exit demo mode"
          >
            <LogOut className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-full hover:bg-amber-400 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}