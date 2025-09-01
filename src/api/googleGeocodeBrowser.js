import { Loader } from '@googlemaps/js-api-loader';

let loader;
async function loadMaps() {
  if (!loader) {
    loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['geocoding'],
      language: 'es',
      region: 'CL', // opcional
    });
  }
  await loader.load();
}

function pickBestResult(results) {
  if (!results?.length) return null;
  // Prioriza direcciones “exactas”, luego ruta, luego político
  const score = (types=[]) => (
    types.includes('street_address') ? 100 :
    types.includes('premise') || types.includes('subpremise') ? 90 :
    types.includes('route') ? 80 :
    types.includes('intersection') ? 70 :
    types.includes('sublocality') || types.includes('locality') ? 60 :
    types.includes('political') ? 50 : 10
  );
  return [...results].sort((a,b) => score(b.types)-score(a.types))[0];
}

export async function reverseGeocodeBrowser(lat, lng) {
  await loadMaps();
  const { Geocoder } = await google.maps.importLibrary('geocoding');
  const geocoder = new Geocoder();

  // 1) intento directo
  const r1 = await geocoder.geocode({ location: { lat, lng } });
  console.debug('[geocode] status:', r1.status, 'results:', r1.results?.length);
  let best = pickBestResult(r1.results);
  if (best) {
    const loc = best.geometry?.location;
    return {
      status: r1.status,
      formatted: best.formatted_address,
      placeId: best.place_id,
      lat: typeof loc?.lat === 'function' ? loc.lat() : null,
      lng: typeof loc?.lng === 'function' ? loc.lng() : null,
      types: best.types,
    };
  }

  // 2) fallback: nudge ± ~35 m alrededor para capturar una calle cercana
  const deltas = [
    [0.0003, 0], [-0.0003, 0], [0, 0.0003], [0, -0.0003],
    [0.0002, 0.0002], [-0.0002, 0.0002], [0.0002, -0.0002], [-0.0002, -0.0002],
  ];
  for (const [dy, dx] of deltas) {
    const r = await geocoder.geocode({ location: { lat: lat + dy, lng: lng + dx } });
    console.debug('[geocode fallback] status:', r.status, 'results:', r.results?.length);
    best = pickBestResult(r.results);
    if (best) {
      const loc = best.geometry?.location;
      return {
        status: r.status,
        formatted: best.formatted_address,
        placeId: best.place_id,
        lat: typeof loc?.lat === 'function' ? loc.lat() : null,
        lng: typeof loc?.lng === 'function' ? loc.lng() : null,
        types: best.types,
      };
    }
  }

  return { status: r1.status ?? 'ZERO_RESULTS', formatted: null };
}
