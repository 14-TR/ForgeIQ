import React, { useState } from 'react';
import {
  Button, Box, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Typography,
  IconButton, Tooltip, Divider, Paper, List, ListItem,
  ListItemText, ListItemIcon
} from '@mui/material';

// Icons
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DataObjectIcon from '@mui/icons-material/DataObject';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloseIcon from '@mui/icons-material/Close';

/**
 * ExportButton - A button with dropdown for exporting data in different formats
 * @param {Function} onExportCSV - Function to export data as CSV
 * @param {Function} onExportJSON - Function to export data as JSON
 * @param {Function} onExportPDF - Function to export data as PDF
 * @param {Function} onExportImage - Function to export data as image
 */
export const ExportButton = ({
  onExportCSV,
  onExportJSON,
  onExportPDF,
  onExportImage,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (exportFn) => {
    handleClose();
    exportFn();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        disabled={disabled}
        aria-controls={open ? 'export-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        Export
      </Button>
      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'export-button',
        }}
      >
        {onExportCSV && (
          <MenuItem onClick={() => handleExport(onExportCSV)}>
            <ListItemIcon>
              <DataObjectIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as CSV</ListItemText>
          </MenuItem>
        )}
        {onExportJSON && (
          <MenuItem onClick={() => handleExport(onExportJSON)}>
            <ListItemIcon>
              <DataObjectIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as JSON</ListItemText>
          </MenuItem>
        )}
        {onExportPDF && (
          <MenuItem onClick={() => handleExport(onExportPDF)}>
            <ListItemIcon>
              <PictureAsPdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
        )}
        {onExportImage && (
          <MenuItem onClick={() => handleExport(onExportImage)}>
            <ListItemIcon>
              <ImageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Image</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

/**
 * ShareButton - A button with dropdown for sharing data
 * @param {String} shareUrl - URL to share
 * @param {String} title - Title to share
 * @param {String} description - Description to share
 */
export const ShareButton = ({
  shareUrl,
  title = 'Check out this data',
  description = 'Interesting data visualization',
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    handleClose();
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`;
    handleClose();
  };

  const handleSocialShare = (platform) => {
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
    
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={handleClick}
        disabled={disabled}
        aria-controls={open ? 'share-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        Share
      </Button>
      <Menu
        id="share-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'share-button',
        }}
      >
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEmailShare}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Email</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('twitter')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('facebook')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSocialShare('linkedin')}>
          <ListItemIcon>
            <LinkedInIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>LinkedIn</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          setShowShareDialog(true);
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>More Options</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Share
            <IconButton onClick={() => setShowShareDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Share this link
          </Typography>
          <Box sx={{ display: 'flex', mb: 3 }}>
            <TextField
              fullWidth
              value={shareUrl}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
              }}
            />
            <Tooltip title="Copy link">
              <IconButton onClick={handleCopyLink}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Share on social media
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <IconButton 
              color="primary" 
              onClick={() => handleSocialShare('twitter')}
              sx={{ bgcolor: 'rgba(29, 161, 242, 0.1)' }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={() => handleSocialShare('facebook')}
              sx={{ bgcolor: 'rgba(59, 89, 152, 0.1)' }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={() => handleSocialShare('linkedin')}
              sx={{ bgcolor: 'rgba(0, 119, 181, 0.1)' }}
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={handleEmailShare}
              sx={{ bgcolor: 'rgba(0, 0, 0, 0.1)' }}
            >
              <EmailIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * ReportGenerator - A component for generating and downloading reports
 * @param {Array} data - Data to include in the report
 * @param {Array} reportOptions - Options for report generation
 */
export const ReportGenerator = ({
  data,
  reportOptions = [
    { id: 'summary', label: 'Summary Report' },
    { id: 'detailed', label: 'Detailed Report' },
    { id: 'custom', label: 'Custom Report' }
  ],
  onGenerateReport
}) => {
  const [selectedReport, setSelectedReport] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const handleGenerateReport = () => {
    if (onGenerateReport) {
      onGenerateReport(selectedReport, data);
    }
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => setShowDialog(true)}
      >
        Generate Report
      </Button>

      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select the type of report you want to generate:
          </Typography>
          <Paper variant="outlined" sx={{ mb: 2 }}>
            <List>
              {reportOptions.map((option) => (
                <ListItem
                  key={option.id}
                  button
                  selected={selectedReport === option.id}
                  onClick={() => setSelectedReport(option.id)}
                >
                  <ListItemIcon>
                    <PictureAsPdfIcon />
                  </ListItemIcon>
                  <ListItemText primary={option.label} secondary={option.description} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateReport} 
            variant="contained" 
            disabled={!selectedReport}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 