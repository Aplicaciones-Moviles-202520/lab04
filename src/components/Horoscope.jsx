// src/components/Horoscope.jsx
import { useEffect, useMemo, useReducer } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import {
  Box, Card, CardContent, CardHeader, Typography, Link,
  Stack, CircularProgress, Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchHoroscope } from '../api/horoscopeClient';
import { translateToEs } from '../api/translateClient';

// ---------- utils ----------
const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const zodiacFromDate = (date) => {
  if (!date) return null;
  const m = date.getMonth() + 1;
  const d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'aries';
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taurus';
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return 'gemini';
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return 'cancer';
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'leo';
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'virgo';
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return 'libra';
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return 'scorpio';
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittarius';
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorn';
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'aquarius';
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return 'pisces';
  return null;
};
const esSign = (s) => ({
  aries:'Aries', taurus:'Tauro', gemini:'Géminis', cancer:'Cáncer',
  leo:'Leo', virgo:'Virgo', libra:'Libra', scorpio:'Escorpio',
  sagittarius:'Sagitario', capricorn:'Capricornio', aquarius:'Acuario', pisces:'Piscis'
}[s] || s);

// ---------- reducer ----------
const initial = { status: 'idle', sign: null, original: '', translated: '', error: null, tError: null };
function reducer(state, action) {
  switch (action.type) {
    case 'INIT': return { ...state, sign: action.sign };
    case 'FETCH_START': return { ...state, status: 'loading', error: null, tError: null, original: '', translated: '' };
    case 'FETCH_SUCCESS': return { ...state, status: 'loaded', original: action.text };
    case 'FETCH_ERROR': return { ...state, status: 'error', error: action.error };
    case 'TRANSLATE_SUCCESS': return { ...state, status: 'success', translated: action.text };
    case 'TRANSLATE_ERROR': return { ...state, status: 'success', tError: action.error, translated: '' };
    default: return state;
  }
}

export default function Horoscope({ profileTo = '/perfil' }) {
  const [stored] = useLocalStorageState('WeatherApp/UserProfile', { defaultValue: null });
  const birthDate = stored?.birthDate || null;

  const sign = useMemo(() => zodiacFromDate(parseISODate(birthDate)), [birthDate]);
  const [state, dispatch] = useReducer(reducer, { ...initial, sign });

  useEffect(() => { dispatch({ type: 'INIT', sign }); }, [sign]);

  useEffect(() => {
    let abort = false;
    (async () => {
      if (!sign) return;
      dispatch({ type: 'FETCH_START' });
      try {
        const original = await fetchHoroscope(sign);
        if (abort) return;
        dispatch({ type: 'FETCH_SUCCESS', text: original });

        try {
          const translated = await translateToEs(original);
          if (abort) return;
          dispatch({ type: 'TRANSLATE_SUCCESS', text: translated });
        } catch (e) {
          if (abort) return;
          dispatch({ type: 'TRANSLATE_ERROR', error: e?.message || 'translate-failed' });
        }
      } catch (e) {
        if (abort) return;
        dispatch({ type: 'FETCH_ERROR', error: e?.message || 'fetch-failed' });
      }
    })();
    return () => { abort = true; };
  }, [sign]);

  // No birth date defined → caption + RouterLink
  if (!birthDate) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Fecha de nacimiento no definida.{' '}
          <Link component={RouterLink} to={profileTo}>
            Ir al perfil
          </Link>
        </Typography>
      </Box>
    );
  }

  // UI (mobile-first)
  return (
    <Box sx={{ p: 2 }}>
      <Card elevation={2} sx={{ maxWidth: 640, mx: 'auto' }}>
        <CardHeader
          title={`Horóscopo de ${esSign(state.sign)}`}
          subheader="Hoy"
          sx={{ pb: 0.5 }}
        />
        <CardContent>
          <Stack spacing={1.5}>
            {state.status === 'loading' && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CircularProgress size={20} />
                <Typography variant="body2">Obteniendo horóscopo…</Typography>
              </Stack>
            )}

            {state.status === 'error' && (
              <Alert severity="error">No se pudo obtener el horóscopo.</Alert>
            )}

            {/* Translation OK */}
            {state.status === 'success' && state.translated && (
              <Typography variant="body1">{state.translated}</Typography>
            )}

            {/* Translation error → show original with error message */}
            {state.status === 'success' && !state.translated && (
              <>
                <Alert severity="error">Ha ocurrido error de traducción del horóscopo.</Alert>
                <Typography variant="body2" color="text.secondary">
                  {state.original}
                </Typography>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
