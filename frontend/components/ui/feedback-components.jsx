import React, { useState, forwardRef } from 'react';
import { 
  Snackbar, Alert as MuiAlert, CircularProgress, 
  LinearProgress, Box, Typography, Backdrop
} from '@mui/material';

// Custom Alert component
const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

/**
 * Notification - A snackbar notification component
 * @param {Boolean} open - Whether the notification is open
 * @param {Function} onClose - Function to call when notification is closed
 * @param {String} message - The message to display
 * @param {String} severity - The severity level (error, warning, info, success)
 * @param {Number} duration - How long to display the notification (ms)
 */
export const Notification = ({ 
  open, 
  onClose, 
  message, 
  severity = 'info', 
  duration = 6000 
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

/**
 * NotificationProvider - A component to manage multiple notifications
 * Usage: 
 * const { showNotification } = useNotification();
 * showNotification('Data loaded successfully', 'success');
 */
export const NotificationContext = React.createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, severity = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, severity, open: true }]);
    return id;
  };

  const closeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, open: false } 
          : notification
      )
    );
    
    // Remove from array after animation completes
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 500);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map(({ id, message, severity, open }) => (
        <Notification
          key={id}
          open={open}
          message={message}
          severity={severity}
          onClose={() => closeNotification(id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * LoadingSpinner - A circular loading indicator with optional label
 * @param {String} size - The size of the spinner (small, medium, large)
 * @param {String} label - Optional label to display
 */
export const LoadingSpinner = ({ size = 'medium', label }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <CircularProgress size={size === 'small' ? 24 : size === 'large' ? 48 : 40} />
      {label && <Typography variant="body2" color="text.secondary">{label}</Typography>}
    </Box>
  );
};

/**
 * LoadingBar - A linear progress indicator
 * @param {Number} value - Progress value (0-100), if undefined shows indeterminate progress
 * @param {String} label - Optional label to display
 */
export const LoadingBar = ({ value, label }) => {
  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {value !== undefined && (
            <Typography variant="body2" color="text.secondary">{Math.round(value)}%</Typography>
          )}
        </Box>
      )}
      {value !== undefined ? (
        <LinearProgress variant="determinate" value={value} />
      ) : (
        <LinearProgress />
      )}
    </Box>
  );
};

/**
 * FullScreenLoader - A full screen loading overlay
 * @param {Boolean} open - Whether the loader is visible
 * @param {String} message - Optional message to display
 */
export const FullScreenLoader = ({ open, message }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress color="inherit" />
        {message && <Typography variant="h6">{message}</Typography>}
      </Box>
    </Backdrop>
  );
}; 