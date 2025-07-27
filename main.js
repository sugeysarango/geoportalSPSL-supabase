// main.js

// 1. Configuración de Supabase
const SUPA_URL = 'https://kkjtytomvcfimovxllpj.supabase.co';
const SUPA_KEY = 'TU_ANON_KEY_AQUI';

// 2. Lista de años 1985–2023
const años = Array.from({ length: 2023 - 1985 + 1 }, (_, i) => 1985 + i);

// 3. Mapa de clases a colores
const colores = {
  'Bosque Abierto': '#228B22',
  'Bosque Denso':  '#006400',
  'Pasto':         '#7CFC00',
  'Herbazales de Paramo': '#ADFF2F',
  'Agricultura no especifica': '#FFD700',
  'Sin Informacion': '#A9A9A9',
  // ... tus otros valores
};

let mapa, capaActual;

// 4. Inicializa Leaflet
function initMapa() {
  mapa = L.map('map').setView([-1.5, -79.0], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapa);
}

// 5. Población del selector de años
function initSelector() {
  const select = document.getElementById('select-anyo');
  años.forEach(año => {
    const opt = document.createElement('option');
    opt.value = año;
    opt.textContent = año;
    select.appendChild(opt);
  });
  select.addEventListener('change', e => cargarPuntos(+e.target.value));
}

// 6. Fetch a Supabase
function fetchGeo(año) {
  const params = `select=plotid,cut${año},geojson`;
  return fetch(`${SUPA_URL}/rest/v1/puntos_validos_geo?${params}`, {
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

// 7. Dibuja los puntos en el mapa
function cargarPuntos(año) {
  if (capaActual) mapa.removeLayer(capaActual);

  fetchGeo(año)
    .then(rows => {
      const features = rows.map(r => ({
        type: 'Feature',
        geometry: r.geojson,
        properties: {
          plotid: r.plotid,
          clase:  r[`cut${año}`]
        }
      }));

      capaActual = L.geoJSON(
        { type: 'FeatureCollection', features },
        {
          pointToLayer: (f, latlng) => L.circleMarker(latlng, {
            radius: 5,
            fillColor: colores[f.properties.clase] || '#000',
            color: '#000',
            weight: 1,
            fillOpacity: 0.8
          }),
          onEachFeature: (f, layer) => {
            layer.bindPopup(
              `PlotID: ${f.properties.plotid}<br>Clase: ${f.properties.clase}`
            );
          }
        }
      ).addTo(mapa);

      mapa.fitBounds(capaActual.getBounds());
    })
    .catch(err => console.error('Error cargando puntos:', err));
}

// 8. Arranca todo al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  initMapa();
  initSelector();
  cargarPuntos(años[0]);
});
