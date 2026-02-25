// Centralized error logging and reporting system
export class ErrorLogger {
  static logs = [];
  static maxLogs = 100;

  static log(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        ...context
      }
    };

    this.logs.push(errorLog);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem('memoryMirror_errorLogs', JSON.stringify(this.logs));
    } catch {
      console.warn('Could not save error logs');
    }

    return errorLog;
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('memoryMirror_errorLogs');
    } catch {
      console.warn('Could not clear error logs');
    }
  }

  static getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }
}

// Global error handler
export const initGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    ErrorLogger.log(event.error, {
      type: 'uncaught',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorObj = event.reason instanceof Error 
      ? event.reason 
      : new Error(typeof event.reason === 'string' ? event.reason : 'Promise rejected');
    
    ErrorLogger.log(errorObj, {
      type: 'unhandled_promise_rejection',
      reason: event.reason
    });
    
    // Prevent default to avoid double error logging
    event.preventDefault();
  });
};

// Initialize on module load
if (typeof window !== 'undefined') {
  initGlobalErrorHandler();
}