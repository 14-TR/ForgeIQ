import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, IconButton, Typography, Box,
  Slide, Paper, Modal, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Transition for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * ConfirmDialog - A dialog for confirming actions
 * @param {Boolean} open - Whether the dialog is open
 * @param {Function} onClose - Function to call when dialog is closed
 * @param {String} title - Dialog title
 * @param {String} message - Dialog message
 * @param {Function} onConfirm - Function to call when action is confirmed
 * @param {String} confirmText - Text for confirm button
 * @param {String} cancelText - Text for cancel button
 */
export const ConfirmDialog = ({
  open,
  onClose,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={() => {
          onConfirm();
          onClose();
        }} color={confirmColor} autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * ContentModal - A modal for displaying content
 * @param {Boolean} open - Whether the modal is open
 * @param {Function} onClose - Function to call when modal is closed
 * @param {String} title - Modal title
 * @param {Node} children - Modal content
 * @param {Object} maxWidth - Max width of the modal (xs, sm, md, lg, xl)
 */
export const ContentModal = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'sm',
  fullWidth = true,
  actions
}) => {
  // Calculate max width in pixels
  const getMaxWidthPx = () => {
    switch (maxWidth) {
      case 'xs': return '444px';
      case 'sm': return '600px';
      case 'md': return '900px';
      case 'lg': return '1200px';
      case 'xl': return '1536px';
      default: return '600px';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Paper
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: fullWidth ? getMaxWidthPx() : 'auto',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          p: 0,
          borderRadius: 1,
          boxShadow: 24,
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" component="h2" id="modal-title">
            {title}
          </Typography>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 3 }} id="modal-description">
          {children}
        </Box>
        
        {actions && (
          <>
            <Divider />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              p: 2,
              gap: 1
            }}>
              {actions}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );
};

/**
 * InfoDialog - A simple dialog for displaying information
 * @param {Boolean} open - Whether the dialog is open
 * @param {Function} onClose - Function to call when dialog is closed
 * @param {String} title - Dialog title
 * @param {String|Node} content - Dialog content
 */
export const InfoDialog = ({
  open,
  onClose,
  title = 'Information',
  content
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      aria-labelledby="info-dialog-title"
    >
      <DialogTitle id="info-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {typeof content === 'string' ? (
          <DialogContentText>{content}</DialogContentText>
        ) : (
          content
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 