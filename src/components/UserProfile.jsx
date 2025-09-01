import { useState } from 'react';
import {
  Box, Paper, Stack, TextField, Button, Typography,
  Snackbar, Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useLocalStorageState from 'use-local-storage-state';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { reverseGeocodeBrowser } from '../api/googleGeocodeBrowser';

const schema = Yup.object({
  firstName: Yup.string()
    .required('Obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u, 'Solo letras y espacios'),
  lastName: Yup.string()
    .required('Obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u, 'Solo letras y espacios'),
  age: Yup.number()
    .typeError('Debe ser un número')
    .integer('Debe ser entero')
    .min(1, 'Debe ser mayor que 0')
    .max(120, 'Máx. 120')
    .required('Obligatorio'),
  address: Yup.string()
    .required('Obligatorio')
    .min(5, 'Muy corta')
    .max(120, 'Máximo 120 caracteres'),
  // coords opcionales
  lat: Yup.number().nullable(),
  lng: Yup.number().nullable(),
});

const defaultProfile = { firstName: '', lastName: '', age: '', address: '', lat: null, lng: null };

export default function UserProfile() {
  const [storedProfile, setStoredProfile] = useLocalStorageState('WeatherApp/UserProfile', {
    defaultValue: defaultProfile,
  });

  const [savedOpen, setSavedOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'info' });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: storedProfile || defaultProfile,
    validationSchema: schema,
    validateOnMount: true,
    onSubmit: (values) => {
      setStoredProfile(values);
      setSavedOpen(true);
    },
  });

  const err = (f) => Boolean(formik.touched[f] && formik.errors[f]);
  const help = (f) => (formik.touched[f] && formik.errors[f]) || ' ';

  const geolocErrorMessage = (e) => {
    if (!e) return 'No se pudo obtener tu ubicación';
    switch (e.code) {
      case 1: return 'Permiso de ubicación denegado';
      case 2: return 'Posición no disponible';
      case 3: return 'Tiempo de espera agotado';
      default: return e.message || 'Error de geolocalización';
    }
  };

  const handleUseMyLocation = async () => {
    if (!('geolocation' in navigator)) {
      setSnack({ open: true, sev: 'warning', msg: 'Tu navegador no soporta geolocalización.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const rev = await reverseGeocodeBrowser(latitude, longitude);
          if (rev?.formatted) {
            formik.setFieldValue('address', rev.formatted, true);
            formik.setFieldValue('lat', rev.lat ?? latitude, false);
            formik.setFieldValue('lng', rev.lng ?? longitude, false);
            setSnack({ open: true, sev: 'success', msg: 'Dirección detectada.' });
          } else {
            setSnack({ open: true, sev: 'warning', msg: `No se encontró dirección (status: ${rev?.status || 'ZERO_RESULTS'}).` });
          }
        } catch (e) {
          setSnack({ open: true, sev: 'error', msg: 'Error consultando el geocoder.' });
        } finally {
          setLocating(false);
        }
      },
      (e) => {
        setSnack({ open: true, sev: 'warning', msg: geolocErrorMessage(e) });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <Box sx={{ m: 2 }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Perfil de Usuario
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Nombre"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('firstName')}
                helperText={help('firstName')}
                inputProps={{ maxLength: 50 }}
              />
              <TextField
                fullWidth
                label="Apellido"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('lastName')}
                helperText={help('lastName')}
                inputProps={{ maxLength: 50 }}
              />
            </Stack>

            <TextField
              label="Edad"
              name="age"
              type="number"
              value={formik.values.age}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={err('age')}
              helperText={help('age')}
              inputProps={{ min: 1, max: 120, inputMode: 'numeric', pattern: '[0-9]*' }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
              <TextField
                fullWidth
                label="Dirección"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={err('address')}
                helperText={help('address')}
                multiline
                minRows={2}
                inputProps={{ maxLength: 120 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RoomIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={handleUseMyLocation}
                  variant="outlined"
                  startIcon={
                    locating ? <CircularProgress size={16} /> : <MyLocationIcon />
                  }
                  disabled={locating}
                >
                  {locating ? 'Obteniendo…' : 'Usar mi ubicación'}
                </Button>
              </Box>
            </Stack>

            {/* (Opcional) Mostrar coords guardadas si existen */}
            {(formik.values.lat != null && formik.values.lng != null) && (
              <Typography variant="caption" color="text.secondary">
                Coordenadas guardadas: {formik.values.lat.toFixed(5)}, {formik.values.lng.toFixed(5)}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button type="submit" variant="contained" disabled={!formik.isValid}>
                Guardar
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => formik.resetForm({ values: storedProfile || defaultProfile })}
              >
                Restablecer
              </Button>
              <Button
                type="button"
                color="secondary"
                onClick={() => {
                  formik.resetForm({ values: defaultProfile });
                }}
              >
                Limpiar
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Snackbar
        open={savedOpen || snack.open}
        autoHideDuration={2200}
        onClose={() => { setSavedOpen(false); setSnack(s => ({ ...s, open: false })); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={savedOpen ? 'success' : snack.sev}
          variant="filled"
          onClose={() => { setSavedOpen(false); setSnack(s => ({ ...s, open: false })); }}
        >
          {savedOpen ? 'Perfil guardado' : snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
