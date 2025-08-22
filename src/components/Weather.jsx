import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import fetchWeather from '../api/weatherApi';
import PropTypes from 'prop-types';

const Weather = ({ location = 'Santiago de Chile' }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchWeather(location);
        if (isMounted) setWeather(data);
      } catch {
        if (isMounted) setError('No se pudo cargar el clima.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [location]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={18} />
        <Typography variant="body2">Cargando clima…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        {error}
      </Typography>
    );
  }

  if (!weather) return null;

  const {
    label,                // "Santiago, Región Metropolitana, Chile" (según tu API)
    temp,                 // actual
    tempMinForecast,      // mínima pronosticada hoy
    tempMaxForecast,      // máxima pronosticada hoy
    tempMinObserved,      // mínima observada hoy (fallback)
    tempMaxObserved,      // máxima observada hoy (fallback)
  } = weather;

  // Tomamos pronóstico si existe; si no, caemos a observada
  const maxToday = (tempMaxForecast ?? tempMaxObserved);
  const minToday = (tempMinForecast ?? tempMinObserved);

  const fmt = (v) => (v == null ? '—' : `${v} °C`);

  return (
    <Box>
      {/* Título de la tarjeta (puedes ocultarlo si prefieres usar sólo el header de la card) */}
      {label && (
        <Typography variant="h6" component="h2" gutterBottom>
          {label}
        </Typography>
      )}

      <Typography variant="body1"><strong>Actual:</strong> {fmt(temp)}</Typography>
      <Typography variant="body1"><strong>Máxima:</strong> {fmt(maxToday)}</Typography>
      <Typography variant="body1"><strong>Mínima:</strong> {fmt(minToday)}</Typography>
    </Box>
  );
};

Weather.propTypes = {
  location: PropTypes.string,
};

export default Weather;
