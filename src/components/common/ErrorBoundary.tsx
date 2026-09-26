import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Enterprise React Error Boundary
 * Gracefully traps unhandled runtime errors during transition/mounting phases
 * to prevent complete application white-screen crashes.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn(
      `[ErrorBoundary] Caught error in ${this.props.moduleName || 'component tree'}:`,
      error,
      errorInfo
    );
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="d-flex align-items-center justify-content-center p-4 min-vh-50">
          <div
            className="card shadow-sm border-0 p-4 text-center"
            style={{ maxWidth: '480px', borderRadius: '16px', background: 'var(--dl-surface, #ffffff)' }}
          >
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: '56px', height: '56px', background: '#fee2e2', color: '#dc2626' }}
            >
              <i className="bi bi-exclamation-triangle fs-3" />
            </div>
            <h5 className="fw-bold mb-2 text-dark">Component Display Recovered</h5>
            <p className="text-secondary small mb-3" style={{ lineHeight: 1.6 }}>
              A UI animation or transition could not complete cleanly during navigation. The rest of the
              application remains active.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary px-3"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
