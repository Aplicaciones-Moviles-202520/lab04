import axios from 'axios';

// 1) Geocoding: nombre -> lat/lon
async function geocodeCity(name) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search';
  const { data } = await axios.get(url, {
    params: {
      name,
      count: 1,
      language: 'es',
      format: 'json',
    },
  });
  if (!data?.results?.length) return null;
  const c = data.results[0];
  return {
    lat: c.latitude,
    lon: c.longitude,
    label: [c.name, c.admin1, c.country].filter(Boolean).join(', '),
    timezone: c.timezone, // útil para formatear horas locales si quisieras
  };
}

// 2) Forecast (actual + min/max pronosticadas del día)
async function getForecast(lat, lon, timezone = 'auto') {
  const url = 'https://api.open-meteo.com/v1/forecast';
  // daily min/max pronosticadas; current temperatura actual
  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      timezone,
      current: 'temperature_2m',
      daily: 'temperature_2m_min,temperature_2m_max',
      forecast_days: 1, // solo hoy
    },
  });

  const current = data?.current?.temperature_2m;
  const dailyMin = data?.daily?.temperature_2m_min?.[0];
  const dailyMax = data?.daily?.temperature_2m_max?.[0];

  return {
    current: typeof current === 'number' ? current : null,
    forecastMin: typeof dailyMin === 'number' ? dailyMin : null,
    forecastMax: typeof dailyMax === 'number' ? dailyMax : null,
  };
}

// 3) Histórico horario del día en curso (min/max observados hasta ahora)
async function getObservedToday(lat, lon, timezone = 'auto') {
  const url = 'https://archive-api.open-meteo.com/v1/archive';

  // Hoy (YYYY-MM-DD) en la zona de la ciudad no es necesario si usas 'timezone'
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await axios.get(url, {
    params: {
      latitude: lat,
      longitude: lon,
      timezone,
      start_date: today,
      end_date: today,
      hourly: 'temperature_2m',
    },
  });

  const temps = data?.hourly?.temperature_2m ?? [];
  if (!temps.length) return { observedMin: null, observedMax: null };

  // Filtra solo las horas <= ahora local (para no mezclar futuro del modelo reanálisis)
  const times = data.hourly.time; // ISO strings
  const now = Date.now();
  const observed = temps.filter((_, i) => new Date(times[i]).getTime() <= now);

  if (!observed.length) return { observedMin: null, observedMax: null };

  const observedMin = Math.min(...observed);
  const observedMax = Math.max(...observed);
  return { observedMin, observedMax };
}

// 4) Función principal
const fetchWeather = async (city) => {
  try {
    const geo = await geocodeCity(city);
    if (!geo) return null;

    const [fc, obs] = await Promise.all([
      getForecast(geo.lat, geo.lon, geo.timezone ?? 'auto'),
      getObservedToday(geo.lat, geo.lon, geo.timezone ?? 'auto'),
    ]);

    // Escoge “actual” con fallback: forecast.current -> promedio últimas observaciones
    let temp = fc.current;
    if (temp == null) {
      // fallback simple: usa el máximo entre min y max observados recientes
      temp = obs.observedMin != null && obs.observedMax != null
        ? (obs.observedMin + obs.observedMax) / 2
        : null;
    }

    return {
      label: geo.label,                 // "Santiago, Región Metropolitana, Chile"
      temp: temp != null ? temp.toFixed(1) : null,
      // Observadas hoy hasta ahora (lo que buscabas para mínima real de la madrugada)
      tempMinObserved: obs.observedMin != null ? obs.observedMin.toFixed(1) : null,
      tempMaxObserved: obs.observedMax != null ? obs.observedMax.toFixed(1) : null,
      // Pronosticadas para hoy (útil para el resto del día)
      tempMinForecast: fc.forecastMin != null ? fc.forecastMin.toFixed(1) : null,
      tempMaxForecast: fc.forecastMax != null ? fc.forecastMax.toFixed(1) : null,
    };
  } catch (err) {
    console.error('Open‑Meteo fetch failed:', err);
    return null;
  }
};

export default fetchWeather;
