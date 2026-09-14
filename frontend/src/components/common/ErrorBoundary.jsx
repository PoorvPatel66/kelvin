import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Kelvin frontend error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="section">
          <div className="container-sm">
            <span className="eyebrow">Application Error</span>
            <h1>Something went wrong</h1>
            <p>Please refresh the page or try again in a moment.</p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
