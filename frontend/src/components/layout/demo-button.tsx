"use client";

import { useDemoMode } from '../providers/demo-mode-provider';
import { Button } from '../ui/button';
import { PlayCircle } from 'lucide-react';

export function DemoButton() {
  const { enableDemoMode } = useDemoMode();
  
  return (
    <Button 
      onClick={enableDemoMode}
      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-amber-950"
    >
      <PlayCircle className="h-4 w-4" />
      Try Demo
    </Button>
  );
}