
import React, { useState } from 'react';
import { Monitor, Smartphone, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer.jsx';

const SectionPreviewPanel = ({ sectionData }) => {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'

  if (!sectionData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
        <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
        <p>Select or create a section to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted/10 rounded-xl border overflow-hidden">
      {/* Preview Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Live Preview</span>
          {!sectionData.active && (
            <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 px-3 text-xs ${viewMode === 'desktop' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="w-3.5 h-3.5 mr-1.5" /> Desktop
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-7 px-3 text-xs ${viewMode === 'mobile' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="w-3.5 h-3.5 mr-1.5" /> Mobile
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-8">
        <div 
          className={`
            bg-background shadow-2xl overflow-y-auto custom-scrollbar transition-all duration-500 ease-in-out origin-top
            ${viewMode === 'mobile' ? 'w-[375px] h-[812px] rounded-[2rem] border-[8px] border-slate-800' : 'w-full h-full rounded-lg border'}
          `}
        >
          {/* Render the section with pointer events disabled to prevent accidental navigation during preview */}
          <div className="w-full min-h-full pointer-events-none">
            <DynamicSectionRenderer section={{...sectionData, active: true}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionPreviewPanel;
