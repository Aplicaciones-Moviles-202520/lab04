import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import 'dotenv/config';

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

// helpers arriba del archivo
const maskUrl = (url) => url.replace(/([?&]key=)[^&]+/, '$1***');

async function fetchJsonWithTimeout(url, { headers, timeoutMs = 10000 } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers, signal: ctrl.signal });
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { ok: r.ok, status: r.status, json, text };
  } finally {
    clearTimeout(id);
  }
}

// ===== Reverse =====
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const language = (req.query.lang || 'es').toString();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'invalid lat/lng' });
    }

    const u = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    u.searchParams.set('latlng', `${lat},${lng}`);
    u.searchParams.set('language', language);
    // u.searchParams.set('result_type', 'street_address|route'); // opcional
    u.searchParams.set('key', GOOGLE_KEY);

    const { ok, status, json } = await fetchJsonWithTimeout(u.toString(), {
      headers: { 'user-agent': 'WeatherApp-Server/1.0' },
      timeoutMs: 10000,
    });

    console.log('[rev]', status, json?.status, maskUrl(u.toString()));

    if (!ok) {
      return res.status(502).json({
        error: 'google-http',
        httpStatus: status,
        url: maskUrl(u.toString()),
      });
    }

    if (json?.status !== 'OK') {
      return res.status(502).json({
        error: 'google-status',
        googleStatus: json?.status,
        errorMessage: json?.error_message,
        url: maskUrl(u.toString()),
      });
    }

    const best = (json.results || [])[0]; // o tu pickBestResult si lo tienes
    if (!best) return res.json({ status: 'ZERO_RESULTS', formatted: null, results: [] });

    const loc = best.geometry?.location || {};
    return res.json({
      status: json.status,
      formatted: best.formatted_address,
      placeId: best.place_id,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      types: best.types,
      components: best.address_components,
    });
  } catch (err) {
    console.error('[rev] fetch failed:', err?.name, err?.message);
    return res.status(502).json({
      error: 'reverse-geocode-proxy-failed',
      message: err?.name === 'AbortError' ? 'timeout' : 'network',
    });
  }
});

// ===== Forward =====
app.get('/api/geocode/forward', async (req, res) => {
  try {
    const address = (req.query.address || '').toString().trim();
    const language = (req.query.lang || 'es').toString();

    if (!address) return res.status(400).json({ error: 'address required' });
    if (!GOOGLE_KEY) return res.status(500).json({ error: 'Missing GOOGLE_GEOCODING_API_KEY' });

    const u = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    u.searchParams.set('address', address);
    u.searchParams.set('language', language);
    u.searchParams.set('key', GOOGLE_KEY);

    const { ok, status, json } = await fetchJsonWithTimeout(u.toString(), {
      headers: { 'user-agent': 'WeatherApp-Server/1.0' },
      timeoutMs: 10000,
    });

    console.log('[fwd]', status, json?.status, maskUrl(u.toString()));

    if (!ok) {
      return res.status(502).json({
        error: 'google-http',
        httpStatus: status,
        url: maskUrl(u.toString()),
      });
    }
    if (json?.status !== 'OK') {
      return res.status(502).json({
        error: 'google-status',
        googleStatus: json?.status,
        errorMessage: json?.error_message,
        url: maskUrl(u.toString()),
      });
    }

    const best = (json.results || [])[0];
    const loc = best?.geometry?.location || {};
    return res.json({
      status: json.status,
      formatted: best.formatted_address,
      placeId: best.place_id,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      types: best.types,
      components: best.address_components,
    });
  } catch (err) {
    console.error('[fwd] fetch failed:', err?.name, err?.message);
    return res.status(502).json({
      error: 'forward-geocode-proxy-failed',
      message: err?.name === 'AbortError' ? 'timeout' : 'network',
    });
  }
});

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
