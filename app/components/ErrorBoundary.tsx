'use client'

import React, { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h1>
          <p>We&apos;re sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary