"use client";

import { useDemoMode } from '../providers/demo-mode-provider';
import { Button } from '../ui/button';
import { PlayCircle } from 'lucide-react';

export function DemoButton() {
  const { enableDemoMode } = useDemoMode();
  
  return (
    <Button 
      onClick={enableDemoMode}
      className="flex items-center gap-2 bg-[#524839] hover:from-amber-800 hover:to-amber-700 text-white shadow-md hover:shadow-lg border border-amber-800/20 transition-all duration-200"
    >
      <PlayCircle className="" /> 
      Try Demo
    </Button>
  );
}