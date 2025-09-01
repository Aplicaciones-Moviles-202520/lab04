import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// Ajusta los orígenes permitidos (dev y tu dominio prod)
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

// Whitelist de signos para sanitizar entrada
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

// (ya lo tenías) Proxy a Google Translate, nunca la clave en el cliente
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
