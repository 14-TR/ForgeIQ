import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorBoundary - A component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Optional: send error to a logging service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optional: call a reset function provided by the parent
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { fallback, children } = this.props;
    
    if (hasError) {
      // You can render any custom fallback UI
      if (fallback) {
        return fallback(error, errorInfo, this.handleReset);
      }
      
      return (
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            m: 2, 
            backgroundColor: 'error.light',
            color: 'error.contrastText',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ErrorOutlineIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5" component="h2">
              Something went wrong
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            {error && error.toString()}
          </Typography>
          
          {this.props.showDetails && errorInfo && (
            <Box 
              component="details" 
              sx={{ 
                mb: 3,
                '& summary': { 
                  cursor: 'pointer',
                  mb: 1
                }
              }}
            >
              <summary>Error Details</summary>
              <Box 
                component="pre" 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontSize: '0.8rem'
                }}
              >
                {errorInfo.componentStack}
              </Box>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            
            {this.props.resetApp && (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={this.props.resetApp}
              >
                Reset Application
              </Button>
            )}
          </Box>
        </Paper>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

/**
 * withErrorBoundary - A higher-order component that wraps a component with an ErrorBoundary
 * @param {Component} WrappedComponent - The component to wrap
 * @param {Object} errorBoundaryProps - Props to pass to the ErrorBoundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundary = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithErrorBoundary;
};

export default ErrorBoundary; 