// src/components/common/ErrorBoundary.tsx
//TS version
import React, { ReactNode } from 'react';

// Define props interface
interface ErrorBoundaryProps {
  children: ReactNode;
}

// Define state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state to display fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="max-w-md mx-auto p-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong.</h2>
          <p className="text-gray-700">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


/* // src/components/common/ErrorBoundary.jsx
//JS version
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to display fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details if needed
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="max-w-md mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
 */