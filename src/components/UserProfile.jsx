import { useMemo, useState } from 'react';
import {
  Box, Paper, Stack, TextField, Button, Typography,
  Snackbar, Alert, InputAdornment, CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useLocalStorageState from 'use-local-storage-state';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RoomIcon from '@mui/icons-material/Room';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { reverseGeocodeServer } from '../api/geocodeClient';
import { es } from 'date-fns/locale';

/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');
const toLocalISODate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const calcAge = (birth) => {
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const TODAY = new Date();
const MAX_BIRTH_FOR_13 = new Date(
  TODAY.getFullYear() - 13,
  TODAY.getMonth(),
  TODAY.getDate()
);

/* ---------- Validación ---------- */
const schema = Yup.object({
  firstName: Yup.string()
    .required('Obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u, 'Solo letras y espacios'),
  lastName: Yup.string()
    .required('Obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u, 'Solo letras y espacios'),
  address: Yup.string()
    .required('Obligatorio')
    .min(5, 'Muy corta')
    .max(120, 'Máximo 120 caracteres'),
  lat: Yup.number().nullable(),
  lng: Yup.number().nullable(),
  birthDate: Yup.string()
    .nullable()
    .test('valid-iso', 'Fecha inválida', (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v))
    .test('not-future', 'No puede ser futura', (v) => {
      if (!v) return true;
      const d = parseISODate(v);
      return d && d <= TODAY;
    })
    .test('min-age-13', 'Debes tener al menos 13 años', (v) => {
      if (!v) return true;            // permite nula inicialmente
      const d = parseISODate(v);
      const age = d && calcAge(d);
      return age == null ? true : age >= 13;
    }),
});

/* ---------- Estado persistido (incluye age) ---------- */
const defaultPersistedProfile = {
  firstName: '',
  lastName: '',
  birthDate: null,   // ISO string YYYY-MM-DD | null
  address: '',
  lat: null,
  lng: null,
  age: null,         // se calcula; se guarda aquí en persistencia
};

export default function UserProfile() {
  const [storedProfile, setStoredProfile] = useLocalStorageState('WeatherApp/UserProfile', {
    defaultValue: defaultPersistedProfile,
  });

  // Valores del formulario (sin 'age')
  const defaultFormValues = {
    firstName: '',
    lastName: '',
    birthDate: null,
    address: '',
    lat: null,
    lng: null,
  };
  // Tomamos del storage sólo los campos del form (ignorando 'age')
  const initialFormValues = {
    ...defaultFormValues,
    ...(storedProfile || {}),
  };

  const [savedOpen, setSavedOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', sev: 'info' });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: initialFormValues,
    validationSchema: schema,
    validateOnMount: true,
    onSubmit: (values) => {
      // Derivar edad en el submit, y persistirla junto con el resto
      const birth = parseISODate(values.birthDate);
      const computedAge = calcAge(birth);
      const payload = { ...values, age: computedAge ?? null };
      setStoredProfile(payload);
      setSavedOpen(true);
    },
  });

  const err = (f) => Boolean(formik.touched[f] && formik.errors[f]);
  const help = (f) => (formik.touched[f] && formik.errors[f]) || ' ';

  // Edad derivada para mostrar (no se edita)
  const derivedAge = useMemo(() => {
    const d = parseISODate(formik.values.birthDate);
    return calcAge(d);
  }, [formik.values.birthDate]);

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
          const rev = await reverseGeocodeServer(latitude, longitude);
          if (rev?.formatted) {
            formik.setFieldValue('address', rev.formatted, true);
            formik.setFieldValue('lat', rev.lat ?? latitude, false);
            formik.setFieldValue('lng', rev.lng ?? longitude, false);
            setSnack({ open: true, sev: 'success', msg: 'Dirección detectada.' });
          } else {
            setSnack({ open: true, sev: 'warning', msg: `No se encontró dirección (status: ${rev?.status || 'ZERO_RESULTS'}).` });
          }
        } catch {
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

  const handleBirthDateChange = (newDate) => {
    const iso = newDate ? toLocalISODate(newDate) : null;
    formik.setFieldValue('birthDate', iso, true);
    // No tocamos 'age' en el form: se deriva y se guarda en submit
  };

  return (
    <Box sx={{ m: 2 }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Perfil de Usuario
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
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

              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Fecha de nacimiento"
                  value={parseISODate(formik.values.birthDate)}
                  onChange={handleBirthDateChange}
                  disableFuture
                  maxDate={MAX_BIRTH_FOR_13}

                  // 2) Formato mostrado en el input
                  format="dd/MM/yyyy"               // (v6/v7)  -> para v5 usa: inputFormat="dd/MM/yyyy"

                  slotProps={{
                    textField: {
                      name: 'birthDate',
                      onBlur: formik.handleBlur,
                      fullWidth: true,
                      error: err('birthDate'),
                      helperText: help('birthDate'),
                      placeholder: 'DD/MM/AAAA',
                    }
                  }}
                />
              </LocalizationProvider>

              {/* Leyenda opcional: muestra edad derivada si hay fecha válida */}
              {derivedAge != null && (
                <Typography variant="body2" color="text.secondary">
                  Edad: <strong>{derivedAge}</strong> años
                </Typography>
              )}

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
                    startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
                    disabled={locating}
                  >
                    {locating ? 'Obteniendo…' : 'Usar mi ubicación'}
                  </Button>
                </Box>
              </Stack>

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
                  onClick={() => formik.resetForm({ values: initialFormValues })}
                >
                  Restablecer
                </Button>
                <Button
                  type="button"
                  color="secondary"
                  onClick={() => formik.resetForm({ values: defaultFormValues })}
                >
                  Limpiar
                </Button>
              </Stack>
            </Stack>
          </form>
        </LocalizationProvider>
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
