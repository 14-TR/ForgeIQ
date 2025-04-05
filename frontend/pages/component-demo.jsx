import React, { useState } from 'react';
import { Box, Typography, Grid, Button, Paper, Divider } from '@mui/material';

// Import chart components
import { EventBarChart, EventPieChart, ChartPanel } from './chart-components';

// Import table component
import DataTable from './data-table';

// Import feedback components
import { LoadingSpinner, LoadingBar, Notification } from './feedback-components';

// Import modal components
import { ConfirmDialog, ContentModal, InfoDialog } from './modal-components';

// Import form components
import {
  FormContainer,
  FormSection,
  TextInput,
  SelectInput,
  CheckboxInput,
  RadioGroupInput,
  SliderInput,
  SwitchInput,
  DateInput
} from './form-components';

// Import export components
import { ExportButton, ShareButton } from './export-components';

// Sample data for charts
const chartData = [
  { name: 'Battles', value: 45 },
  { name: 'Explosions', value: 28 },
  { name: 'Protests', value: 17 },
  { name: 'Riots', value: 10 }
];

// Sample data for table
const tableData = [
  { id: 1, event_type: 'Battle', location: 'Kyiv', date: '2022-02-24', fatalities: 120 },
  { id: 2, event_type: 'Explosion', location: 'Kharkiv', date: '2022-03-01', fatalities: 45 },
  { id: 3, event_type: 'Protest', location: 'Lviv', date: '2022-03-05', fatalities: 0 },
  { id: 4, event_type: 'Battle', location: 'Mariupol', date: '2022-03-10', fatalities: 350 },
  { id: 5, event_type: 'Riot', location: 'Odesa', date: '2022-03-15', fatalities: 12 }
];

// Table columns
const tableColumns = [
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'event_type', label: 'Event Type', minWidth: 100 },
  { id: 'location', label: 'Location', minWidth: 120 },
  { id: 'date', label: 'Date', minWidth: 100 },
  { 
    id: 'fatalities', 
    label: 'Fatalities', 
    minWidth: 100,
    format: (value) => value.toLocaleString()
  }
];

const ComponentDemo = () => {
  // State for form inputs
  const [formValues, setFormValues] = useState({
    name: '',
    eventType: '',
    isActive: false,
    priority: 'medium',
    importance: 50,
    notifications: true,
    eventDate: new Date().toISOString().split('T')[0] // Add date in YYYY-MM-DD format
  });

  // State for modals
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  // State for notification
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormValues({ ...formValues, [field]: value });
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', formValues);
    setNotificationOpen(true);
  };

  // Export functions
  const handleExportCSV = () => {
    console.log('Exporting as CSV...');
    setNotificationOpen(true);
  };

  const handleExportJSON = () => {
    console.log('Exporting as JSON...');
    setNotificationOpen(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Component Demo
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates the new components added to the project.
      </Typography>

      {/* Charts Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Data Visualization Components
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ChartPanel title="Event Distribution" description="Distribution of event types">
              <EventPieChart 
                data={chartData} 
                nameKey="name" 
                valueKey="value" 
                height={300} 
              />
            </ChartPanel>
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartPanel title="Event Counts" description="Count of events by type">
              <EventBarChart 
                data={chartData} 
                xKey="name" 
                yKey="value" 
                height={300} 
              />
            </ChartPanel>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Data Table Component
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <DataTable 
          data={tableData} 
          columns={tableColumns} 
          title="Event Data" 
          rowsPerPage={5} 
        />
      </Paper>

      {/* Form Section */}
      <FormContainer 
        title="Form Components" 
        description="Example of form components"
        onSubmit={handleSubmit}
        actions={
          <>
            <Button variant="outlined">Cancel</Button>
            <Button variant="contained" type="submit">Submit</Button>
          </>
        }
      >
        <FormSection title="Basic Information" description="Enter the basic event information">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                label="Event Name" 
                value={formValues.name} 
                onChange={handleInputChange('name')} 
                placeholder="Enter event name" 
                required 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SelectInput 
                label="Event Type" 
                value={formValues.eventType} 
                onChange={handleInputChange('eventType')} 
                options={[
                  { value: 'battle', label: 'Battle' },
                  { value: 'explosion', label: 'Explosion' },
                  { value: 'protest', label: 'Protest' },
                  { value: 'riot', label: 'Riot' }
                ]} 
                required 
              />
            </Grid>
          </Grid>
        </FormSection>

        <FormSection title="Additional Settings" description="Configure additional event settings">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CheckboxInput 
                label="Active Event" 
                checked={formValues.isActive} 
                onChange={handleInputChange('isActive')} 
              />
              
              <RadioGroupInput 
                label="Priority" 
                value={formValues.priority} 
                onChange={handleInputChange('priority')} 
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]} 
                row 
              />
              
              <DateInput
                label="Event Date"
                value={formValues.eventDate}
                onChange={handleInputChange('eventDate')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SliderInput 
                label="Importance" 
                value={formValues.importance} 
                onChange={(e, newValue) => setFormValues({ ...formValues, importance: newValue })} 
                min={0} 
                max={100} 
                step={10} 
                marks 
              />
              
              <SwitchInput 
                label="Enable Notifications" 
                checked={formValues.notifications} 
                onChange={handleInputChange('notifications')} 
              />
            </Grid>
          </Grid>
        </FormSection>
      </FormContainer>

      {/* Feedback Components */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Feedback Components
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Loading Spinner</Typography>
              <LoadingSpinner label="Loading data..." />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Loading Bar</Typography>
              <LoadingBar value={70} label="Processing data" />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Notification</Typography>
              <Button 
                variant="contained" 
                onClick={() => setNotificationOpen(true)}
              >
                Show Notification
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modal Components */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Modal Components
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Confirm Dialog</Typography>
              <Button 
                variant="contained" 
                onClick={() => setConfirmDialogOpen(true)}
              >
                Open Confirm Dialog
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Content Modal</Typography>
              <Button 
                variant="contained" 
                onClick={() => setContentModalOpen(true)}
              >
                Open Content Modal
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Info Dialog</Typography>
              <Button 
                variant="contained" 
                onClick={() => setInfoDialogOpen(true)}
              >
                Open Info Dialog
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Export Components */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Export & Share Components
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Export Button</Typography>
              <ExportButton 
                onExportCSV={handleExportCSV}
                onExportJSON={handleExportJSON}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Share Button</Typography>
              <ShareButton 
                shareUrl="https://example.com/conflict-data"
                title="Conflict Data Visualization"
                description="Interactive visualization of conflict data"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Modals */}
      <ConfirmDialog 
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        title="Confirm Action"
        message="Are you sure you want to perform this action? This cannot be undone."
        onConfirm={() => {
          console.log('Action confirmed');
          setNotificationOpen(true);
        }}
        confirmText="Proceed"
        cancelText="Cancel"
        confirmColor="error"
      />

      <ContentModal
        open={contentModalOpen}
        onClose={() => setContentModalOpen(false)}
        title="Detailed Information"
        actions={
          <>
            <Button onClick={() => setContentModalOpen(false)}>Close</Button>
            <Button variant="contained" onClick={() => setContentModalOpen(false)}>Save</Button>
          </>
        }
      >
        <Typography variant="body1" paragraph>
          This is a content modal that can display any content you want. It's useful for showing detailed information or forms.
        </Typography>
        <Typography variant="body1" paragraph>
          You can include any React components inside this modal.
        </Typography>
      </ContentModal>

      <InfoDialog 
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title="Information"
        content="This is an informational message to notify the user about something important."
      />

      <Notification 
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        message="Operation completed successfully!"
        severity="success"
      />
    </Box>
  );
};

export default ComponentDemo; 