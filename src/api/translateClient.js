export async function translateToEs(text) {
  const res = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, target: 'es' })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();
  const t = j?.data?.translations?.[0]?.translatedText;
  if (!t) throw new Error('Respuesta de traducción inválida');
  return t;
}
