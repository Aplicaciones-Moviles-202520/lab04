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

/**
 * Convierte un string en formato ISO simple (YYYY-MM-DD) a un objeto Date.
 * - Si la cadena es nula o vacía, retorna null.
 * - Si faltan mes o día, asume enero (1) y día 1 por defecto.
 *
 * @param {string|null} s - Cadena con fecha en formato "YYYY-MM-DD".
 * @returns {Date|null} Objeto Date correspondiente o null si no se pudo parsear.
 */
const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/**
 * Determina el signo zodiacal a partir de una fecha.
 * - Usa los rangos de fechas convencionales del zodiaco occidental.
 * - Retorna el nombre en inglés en minúsculas (ej: "aries", "leo").
 *
 * @param {Date|null} date - Fecha de nacimiento.
 * @returns {string|null} Signo zodiacal en inglés o null si no se puede calcular.
 */
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

/**
 * Traduce un signo zodiacal en inglés a su representación en español.
 * - Si el signo no está en el mapa, retorna el valor original.
 *
 * @param {string} s - Signo en inglés (ej: "aries", "leo").
 * @returns {string} Nombre del signo en español o el valor original.
 */
const esSign = (s) => ({
  aries:'Aries', taurus:'Tauro', gemini:'Géminis', cancer:'Cáncer',
  leo:'Leo', virgo:'Virgo', libra:'Libra', scorpio:'Escorpio',
  sagittarius:'Sagitario', capricorn:'Capricornio', aquarius:'Acuario', pisces:'Piscis'
}[s] || s);

/**
 * Reducer para manejar el ciclo de estados en la obtención y traducción del horóscopo.
 *
 * Estados posibles en `state.status`:
 * - "idle": estado inicial, sin acciones realizadas.
 * - "loading": se está obteniendo el texto original del horóscopo.
 * - "loaded": el texto original fue cargado con éxito.
 * - "error": ocurrió un error al obtener el texto original.
 * - "success": se intentó traducir (con éxito o con error).
 *
 * Tipos de acción soportados:
 * - INIT: inicializa el signo zodiacal (`sign`).
 * - FETCH_START: marca el inicio de la carga del horóscopo (reinicia errores y textos).
 * - FETCH_SUCCESS: guarda el texto original obtenido y pasa a estado "loaded".
 * - FETCH_ERROR: registra un error de carga y pasa a estado "error".
 * - TRANSLATE_SUCCESS: guarda el texto traducido y pasa a estado "success".
 * - TRANSLATE_ERROR: registra un error de traducción, mantiene estado "success" pero sin texto traducido.
 *
 * @param {object} state - Estado actual.
 * @param {{type: string, sign?: string, text?: string, error?: any}} action - Acción despachada.
 * @returns {object} Nuevo estado actualizado según la acción.
 */
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
  // 1. Obtener el perfil almacenado en localStorage (puede ser null).
  //    La clave usada en localStorage es "WeatherApp/UserProfile".
  //    Pista: puedes usar el hook useLocalStorageState.
  const [stored] = null/* TODO: hook de localStorage */;

  // 2. Obtener la fecha de nacimiento desde stored. Ver UserProfile.jsx.
  const birthDate = null/* TODO: extraer birthDate de stored */;

  // 3. Calcular el signo zodiacal a partir de la fecha de nacimiento.
  //    Pista: usar useMemo con zodiacFromDate(parseISODate(birthDate)).
  const sign = null/* TODO: calcular signo zodiacal */;

  // 4. Crear estado con useReducer usando el reducer y el estado inicial.
  //    Pasar el signo como parte del estado inicial.
  const [state, dispatch] = [null, null]/* TODO: useReducer */;

  // 5. Hook de efecto: cada vez que cambie el signo,
  //    despachar la acción INIT para guardar el signo en el estado.
  //    Pista: useEffect con dependencias [sign].
  //    dispatch({ type: 'INIT', sign });
  /* TODO: useEffect para INIT */

  // 6. Hook de efecto: obtener el horóscopo del servidor y traducirlo.
  //    - Si no hay signo, no hacer nada.
  //    - Al iniciar: dispatch({ type: 'FETCH_START' }).
  //    - Luego: llamar fetchHoroscope(sign).
  //      Si hay éxito: dispatch({ type: 'FETCH_SUCCESS', text: original }).
  //      Intentar traducir con translateToEs(original).
  //      Si hay éxito: dispatch({ type: 'TRANSLATE_SUCCESS', text: translated }).
  //      Si falla: dispatch({ type: 'TRANSLATE_ERROR', error: ... }).
  //    - Si falla la carga inicial: dispatch({ type: 'FETCH_ERROR', error: ... }).
  //    - Manejar la cancelación con una variable abort = false/true en cleanup.
  /* TODO: useEffect para fetch + translate */

  // 7. Renderizado del componente:
  //    - Si birthDate no está definido: mostrar un mensaje (Typography con caption)
  //      que diga "Fecha de nacimiento no definida" y un Link a profileTo.
  //    - Si sí hay birthDate: renderizar un Card con:
  //        • CardHeader con el título "Horóscopo de {esSign(state.sign)}"
  //        • Mostrar distintos contenidos según state.status:
  //            - "loading": CircularProgress y texto "Obteniendo horóscopo…"
  //            - "error": Alert de error al obtener horóscopo
  //            - "success" con traducción: mostrar texto traducido
  //            - "success" sin traducción: mostrar Alert de error + texto original
  return (
    <Box sx={{ p: 2 }}>
      {/* TODO: escribir JSX según las instrucciones anteriores */}
    </Box>
  );
}
