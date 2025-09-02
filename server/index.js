import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// CORS (ajusta dominios)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://tu-dominio.com',
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
}));

// ===== util común =====
const GOOGLE_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
if (!GOOGLE_KEY) {
  console.warn('[WARN] Falta GOOGLE_GEOCODING_API_KEY en entorno');
}

// Cache simple en memoria (TTL ms)
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const cache = new Map();
const cacheGet = (k) => {
  const v = cache.get(k);
  if (!v) return null;
  const { t, data } = v;
  if (Date.now() - t > CACHE_TTL) {
    cache.delete(k);
    return null;
  }
  return data;
};
const cacheSet = (k, data) => cache.set(k, { t: Date.now(), data });

// “Score” de tipos para elegir la mejor coincidencia
const pickBestResult = (results = []) => {
  if (!results.length) return null;
  const score = (types = []) =>
    types.includes('street_address') ? 100 :
    (types.includes('premise') || types.includes('subpremise')) ? 90 :
    types.includes('route') ? 80 :
    types.includes('intersection') ? 70 :
    (types.includes('sublocality') || types.includes('locality')) ? 60 :
    types.includes('political') ? 50 : 10;

  return [...results].sort((a, b) => score(b.types) - score(a.types))[0];
};

// ====== Geocoding: Reverse ======
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const language = (req.query.lang || 'es').toString();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'invalid lat/lng' });
    }
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_GEOCODING_API_KEY' });

    const key = `rev:${lat.toFixed(6)},${lng.toFixed(6)}:${language}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const u = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    u.searchParams.set('latlng', `${lat},${lng}`);
    u.searchParams.set('language', language);
    // Opcional: prioriza direcciones de calle
    // u.searchParams.set('result_type', 'street_address|route');
    u.searchParams.set('key', GOOGLE_KEY);

    const r = await fetch(u.toString(), {
      headers: { 'user-agent': 'WeatherApp-Server/1.0' },
      timeout: 10000,
    });
    const data = await r.json();

    if (data.status !== 'OK') {
      return res.status(502).json({ status: data.status, error: data.error_message || 'geocode-failed' });
    }

    const best = pickBestResult(data.results);
    if (!best) {
      return res.json({ status: 'ZERO_RESULTS', formatted: null, results: [] });
    }

    const loc = best.geometry?.location || {};
    const payload = {
      status: data.status,
      formatted: best.formatted_address,
      placeId: best.place_id,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      types: best.types,
      components: best.address_components,
    };
    cacheSet(key, payload);
    return res.json(payload);
  } catch (e) {
    return res.status(502).json({ error: 'reverse-geocode-proxy-failed' });
  }
});

// ====== Geocoding: Forward ======
app.get('/api/geocode/forward', async (req, res) => {
  try {
    const address = (req.query.address || '').toString().trim();
    const language = (req.query.lang || 'es').toString();

    if (!address) return res.status(400).json({ error: 'address required' });
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_GEOCODING_API_KEY' });

    const key = `fwd:${address}:${language}`;
    const cached = cacheGet(key);
    if (cached) return res.json(cached);

    const u = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    u.searchParams.set('address', address);
    u.searchParams.set('language', language);
    u.searchParams.set('key', GOOGLE_KEY);

    const r = await fetch(u.toString(), {
      headers: { 'user-agent': 'WeatherApp-Server/1.0' },
      timeout: 10000,
    });
    const data = await r.json();

    if (data.status !== 'OK') {
      return res.status(502).json({ status: data.status, error: data.error_message || 'geocode-failed' });
    }

    const best = pickBestResult(data.results);
    const loc = best?.geometry?.location || {};
    const payload = best ? {
      status: data.status,
      formatted: best.formatted_address,
      placeId: best.place_id,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      types: best.types,
      components: best.address_components,
    } : { status: 'ZERO_RESULTS', formatted: null };
    cacheSet(key, payload);
    return res.json(payload);
  } catch {
    return res.status(502).json({ error: 'forward-geocode-proxy-failed' });
  }
});

// ====== Tus endpoints existentes (ejemplo) ======

// Whitelist signos
const SIGNS = new Set([
  'aries','taurus','gemini','cancer','leo','virgo','libra',
  'scorpio','sagittarius','capricorn','aquarius','pisces'
]);

// Proxy de horóscopo
app.get('/api/horoscope', async (req, res) => {
  try {
    const sign = String(req.query.sign || '').toLowerCase();
    const day = (req.query.day || 'today').toString();
    if (!SIGNS.has(sign)) return res.status(400).json({ error: 'invalid sign' });

    const url = `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${encodeURIComponent(sign)}&day=${encodeURIComponent(day)}`;
    const r = await fetch(url, { headers: { 'user-agent': 'WeatherApp/1.0' }});
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch (e) {
    return res.status(502).json({ error: 'horoscope-proxy-failed' });
  }
});

// Google Translate (como ya lo tenías)
app.post('/api/translate', async (req, res) => {
  try {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!key) return res.status(500).json({ error: 'Missing API key' });

    const { q, target = 'es', source } = req.body || {};
    const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, target, format: 'text', ...(source ? { source } : {}) }),
    });
    const json = await r.json();
    return res.status(r.status).json(json);
  } catch {
    return res.status(502).json({ error: 'translate-proxy-failed' });
  }
});

app.listen(5174, () => console.log('API server on http://localhost:5174'));
