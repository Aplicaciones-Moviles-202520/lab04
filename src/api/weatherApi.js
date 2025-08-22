import axios from 'axios';

// 1) Geocoding: nombre -> lat/lon

// normaliza para comparar
const norm = (s) =>
  s?.toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

async function geocodeCity(input) {
  // Parseo por coma
  const parts = input.split(",").map(p => p.trim()).filter(Boolean);

  let city = parts[0] || "";
  let admin = null;
  let cc = null; // countryCode

  if (parts.length === 2) {
    // Caso "Ciudad, CL" o "Ciudad, Chile"
    const tail = parts[1];
    if (/^[A-Za-z]{2}$/.test(tail)) cc = tail.toUpperCase(); // ISO-2 detectado
    // Si no es ISO-2, lo dejamos en null y confiamos en 'name'
  } else if (parts.length >= 3) {
    // Caso "Ciudad, Estado/Región, CL"
    admin = parts[1];
    const tail = parts[parts.length - 1];
    if (/^[A-Za-z]{2}$/.test(tail)) cc = tail.toUpperCase();
    // name lo enriquecemos con el admin para reducir ambigüedad
    city = `${city} ${admin}`;
  }

  const params = {
    name: city,
    count: 10,              // trae más resultados para poder filtrar
    language: "es",
    format: "json",
    ...(cc ? { countryCode: cc } : {})
  };

  const resp = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    params,
    validateStatus: () => true,
  });

  if (resp.status !== 200 || !resp.data?.results?.length) return null;

  let results = resp.data.results;

  // Si tenemos admin (estado/provincia), filtramos por admin1
  if (admin) {
    const adminN = norm(admin);
    const filtered = results.filter(r => norm(r.admin1 || "")?.includes(adminN));
    if (filtered.length) results = filtered;
  }

  // Heurística: prioriza ciudad de mayor población
  results.sort((a, b) => (b.population || 0) - (a.population || 0));

  // Retorna el mejor match
  const best = results[0];
  return {
    id: best.id,
    name: best.name,
    latitude: best.latitude,
    longitude: best.longitude,
    country: best.country,
    country_code: best.country_code,
    admin1: best.admin1,
    timezone: best.timezone,
    population: best.population
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

  console.log('Forecast lat lon:', lat, lon);
  console.log('Forecast data:', data);

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
    console.log('Geocoding city:', city);
    console.log('Geocoding result:', geo);

    if (!geo) return null;

    const [fc, obs] = await Promise.all([
      getForecast(geo.latitude, geo.longitude, geo.timezone ?? 'auto'),
      getObservedToday(geo.latitude, geo.longitude, geo.timezone ?? 'auto'),
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
