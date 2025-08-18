import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import fetchWeather from '../api/weatherApi';

const Weather = () => {
  const [weather, setWeather] = useState(null);     // objeto de datos
  const [loading, setLoading] = useState(true);     // estado de carga
  const [error, setError] = useState('');           // mensaje de error

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const temps = await fetchWeather('Santiago de Chile'); // Open‑Meteo version

        if (!isMounted) return;

        if (temps) {
          setWeather(temps);
        } else {
          setError('No se pudo obtener el clima.');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        if (!isMounted) return;
        setError('Ocurrió un error al obtener el clima.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body1" component="p">
          Cargando datos del clima...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" component="p" color="error">
        {error}
      </Typography>
    );
  }

  if (!weather) return null;

  const {
    label,                // "Santiago, Región Metropolitana, Chile"
    temp,                 // actual (aprox.)
    tempMinForecast,      // mínima pronosticada hoy
    tempMaxForecast,      // máxima pronosticada hoy
  } = weather;

  return (
    <Box>
      <Typography variant="h6" component="h1" gutterBottom>
        {label || 'Santiago, Chile'}
      </Typography>

      {temp != null && (
        <Typography variant="body1" component="p">
          Actual: {temp} °C
        </Typography>
      )}

      {(tempMinForecast != null || tempMaxForecast != null) && (
        <Typography variant="body2" component="p">
          Mín. pronosticada hoy: {tempMinForecast ?? '—'} °C — Máx. pronosticada hoy: {tempMaxForecast ?? '—'} °C
        </Typography>
      )}
    </Box>
  );
};

export default Weather;
