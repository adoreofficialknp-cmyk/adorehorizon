
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Section Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-16 px-4 w-full flex flex-col items-center justify-center text-center bg-muted/10 border-y border-border">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-serif font-semibold mb-2 text-foreground">Section Unavailable</h3>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            We encountered an issue loading this content. Please try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
