import PropTypes from 'prop-types';
// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { TextField } from '@mui/material';
// components
// ----------------------------------------------------------------------
RHFDatePicker.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string
};
export default function RHFDatePicker({ name, label, ...other }) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        {...other}
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <DateTimePicker
            label={label}
            value={field.value}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            renderInput={(params) => <TextField {...params} fullWidth error={!!error} helperText={error?.message} />}
          />
        )}
      />
    </LocalizationProvider>
  );
}
