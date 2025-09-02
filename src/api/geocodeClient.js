export async function reverseGeocodeServer(lat, lng, lang = 'es') {
  const qs = new URLSearchParams({ lat: String(lat), lng: String(lng), lang });
  const r = await fetch(`/api/geocode/reverse?${qs.toString()}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json(); // { formatted, placeId, lat, lng, ... }
}

export async function forwardGeocodeServer(address, lang = 'es') {
  const qs = new URLSearchParams({ address, lang });
  const r = await fetch(`/api/geocode/forward?${qs.toString()}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}