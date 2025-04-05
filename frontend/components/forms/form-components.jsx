import React from 'react';
import {
  TextField, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Checkbox, FormControlLabel, RadioGroup,
  Radio, Slider, Switch, Autocomplete, Box, Button,
  Typography, Paper, Divider, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * FormField - A wrapper for form fields with consistent styling
 */
export const FormField = ({ children, label, error, helperText, required, fullWidth = true }) => {
  return (
    <Box sx={{ mb: 2, width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <Typography 
          variant="subtitle2" 
          component="label" 
          sx={{ mb: 0.5, display: 'block' }}
        >
          {label} {required && <span style={{ color: 'error.main' }}>*</span>}
        </Typography>
      )}
      {children}
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

/**
 * TextInput - A text input field with consistent styling
 */
export const TextInput = ({
  label,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  required,
  fullWidth = true,
  type = 'text',
  multiline = false,
  rows = 4,
  disabled = false,
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
      fullWidth={fullWidth}
    >
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        required={required}
        fullWidth={fullWidth}
        type={type}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        disabled={disabled}
        variant="outlined"
        size="small"
        {...props}
      />
    </FormField>
  );
};

/**
 * SelectInput - A select input field with consistent styling
 */
export const SelectInput = ({
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required,
  fullWidth = true,
  disabled = false,
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
      fullWidth={fullWidth}
    >
      <FormControl 
        fullWidth={fullWidth} 
        error={error} 
        required={required}
        disabled={disabled}
        size="small"
      >
        <Select
          value={value}
          onChange={onChange}
          displayEmpty
          {...props}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </FormField>
  );
};

/**
 * CheckboxInput - A checkbox input with consistent styling
 */
export const CheckboxInput = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  ...props
}) => {
  return (
    <FormField error={error} helperText={helperText}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        }
        label={label}
      />
    </FormField>
  );
};

/**
 * RadioGroupInput - A radio group input with consistent styling
 */
export const RadioGroupInput = ({
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required,
  disabled = false,
  row = false,
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
    >
      <RadioGroup
        value={value}
        onChange={onChange}
        row={row}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio disabled={disabled} />}
            label={option.label}
            disabled={disabled || option.disabled}
          />
        ))}
      </RadioGroup>
    </FormField>
  );
};

/**
 * SliderInput - A slider input with consistent styling
 */
export const SliderInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  error,
  helperText,
  required,
  disabled = false,
  marks = false,
  valueLabelDisplay = 'auto',
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
    >
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          marks={marks}
          valueLabelDisplay={valueLabelDisplay}
          disabled={disabled}
          {...props}
        />
      </Box>
    </FormField>
  );
};

/**
 * DateInput - A date input field with consistent styling
 */
export const DateInput = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  fullWidth = true,
  disabled = false,
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
      fullWidth={fullWidth}
    >
      <TextField
        type="date"
        value={value}
        onChange={onChange}
        error={error}
        required={required}
        fullWidth={fullWidth}
        disabled={disabled}
        variant="outlined"
        size="small"
        InputLabelProps={{
          shrink: true,
        }}
        {...props}
      />
    </FormField>
  );
};

/**
 * SwitchInput - A switch input with consistent styling
 */
export const SwitchInput = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  ...props
}) => {
  return (
    <FormField error={error} helperText={helperText}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...props}
          />
        }
        label={label}
      />
    </FormField>
  );
};

/**
 * AutocompleteInput - An autocomplete input with consistent styling
 */
export const AutocompleteInput = ({
  label,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required,
  fullWidth = true,
  disabled = false,
  placeholder = 'Select an option',
  multiple = false,
  ...props
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      helperText={helperText} 
      required={required}
      fullWidth={fullWidth}
    >
      <Autocomplete
        value={value}
        onChange={onChange}
        options={options}
        multiple={multiple}
        disabled={disabled}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={error}
            required={required}
            size="small"
          />
        )}
        {...props}
      />
    </FormField>
  );
};

/**
 * FormSection - A section in a form with a title and optional description
 */
export const FormSection = ({ title, description, children }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {title && <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>}
      {description && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>}
      {children}
    </Box>
  );
};

/**
 * FormContainer - A container for a form with a title and optional actions
 */
export const FormContainer = ({ title, description, onSubmit, actions, children }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {title && <Typography variant="h5" sx={{ mb: 1 }}>{title}</Typography>}
      {description && <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>}
      
      <form onSubmit={onSubmit}>
        {children}
        
        {actions && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {actions}
            </Box>
          </>
        )}
      </form>
    </Paper>
  );
};

/**
 * DynamicFieldArray - A component for managing an array of form fields
 */
export const DynamicFieldArray = ({ 
  fields, 
  onAdd, 
  onRemove, 
  onFieldChange,
  renderField,
  addButtonText = 'Add Item',
  emptyMessage = 'No items added yet'
}) => {
  return (
    <Box>
      {fields.length > 0 ? (
        fields.map((field, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              {renderField(field, index, (updatedField) => onFieldChange(index, updatedField))}
            </Box>
            <IconButton 
              onClick={() => onRemove(index)} 
              color="error" 
              sx={{ mt: 1, ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {emptyMessage}
        </Typography>
      )}
      
      <Button
        startIcon={<AddIcon />}
        onClick={onAdd}
        variant="outlined"
        size="small"
      >
        {addButtonText}
      </Button>
    </Box>
  );
}; 