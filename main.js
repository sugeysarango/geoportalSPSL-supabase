// main.js actualizado con control de capas y popups detallados

const SUPABASE_URL = 'https://kkjtytomvcfimovxllpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // (API_KEY completa aquí)

const años = Array.from({ length: 2023 - 1985 + 1 }, (_, i) => 1985 + i);

const colores = {
  'Bosque Abierto': '#228B22',
  'Bosque Denso':  '#006400',
  'Pasto':         '#7CFC00',
  'Herbazales de Paramo': '#ADFF2F',
  'Agricultura no especifica': '#FFD700',
  'Sin Informacion': '#A9A9A9',
  // ... Agrega aquí las demás 22 clases
};

let mapa;
const capas = {};

function initMapa() {
  mapa = L.map('map').setView([-1.5, -78.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
}

function initSelector() {
  const select = document.getElementById('select-anyo');
  años.forEach(a => {
    const option = document.createElement('option');
    option.value = a;
    option.textContent = a;
    select.appendChild(option);
  });
  select.addEventListener('change', e => cargarPuntos(+e.target.value));
}

function cargarPuntos(año) {
  if (capas.puntos) mapa.removeLayer(capas.puntos);

  const url = `${SUPABASE_URL}/rest/v1/base_puntos_validados_ec_gl_1985_2023?select=plotid,cut${año},geom`;
  fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const features = data.map(d => ({
        type: 'Feature',
        geometry: d.geom,
        properties: {
          plotid: d.plotid,
          clase: d[`cut${año}`]
        }
      }));
      capas.puntos = L.geoJSON(features, {
        pointToLayer: (f, latlng) => L.circleMarker(latlng, {
          radius: 5,
          fillColor: colores[f.properties.clase] || '#000',
          color: '#000', weight: 1,
          fillOpacity: 0.8
        }),
        onEachFeature: (f, layer) => {
          layer.bindPopup(`<b>PlotID:</b> ${f.properties.plotid}<br><b>Clase ${año}:</b> ${f.properties.clase}`);
        }
      }).addTo(mapa);
      mapa.fitBounds(capas.puntos.getBounds());
    });
}

function cargarGeoJSON(tabla, nombre, estilo, campoPopup) {
  const url = `${SUPABASE_URL}/rest/v1/${tabla}?select=${campoPopup},geom`;
  fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  })
    .then(res => res.json())
    .then(data => {
      const features = data.map(d => ({
        type: 'Feature',
        geometry: d.geom,
        properties: { [campoPopup]: d[campoPopup] }
      }));
      let capa;
      if (tabla === 'POBLADOS') {
        capa = L.geoJSON(features, {
          pointToLayer: (f, latlng) => L.circleMarker(latlng, {
            radius: 4, color: 'blue', fillOpacity: 0.6
          }),
          onEachFeature: (f, l) => l.bindPopup(`<b>Poblado:</b> ${f.properties[campoPopup]}`)
        });
      } else {
        capa = L.geoJSON(features, {
          style: estilo,
          onEachFeature: (f, l) => l.bindPopup(`<b>${nombre}:</b> ${f.properties[campoPopup]}`)
        });
      }
      capas[nombre] = capa.addTo(mapa);
      capa.addTo(controlCapas);
    });
}

let controlCapas;
function initControles() {
  controlCapas = L.layerGroup().addTo(mapa);
  cargarGeoJSON('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'Provincias', { color: 'red', weight: 2 }, 'PROVINCIA');
  cargarGeoJSON('POBLADOS', 'Poblados', {}, 'nombre');
  cargarGeoJSON('ECOREGIONES_EC', 'Ecorregiones', { color: 'green', weight: 1, fillOpacity: 0.3 }, 'NOMBRE');
  cargarGeoJSON('RIOS_SIMPLES4326', 'Rios', { color: 'blue', weight: 1 }, 'NAM');
}

function mostrarTitulo() {
  const div = document.createElement('div');
  div.style = 'position:absolute;top:10px;right:10px;z-index:1000;background:white;padding:6px;border-radius:4px;font-weight:bold';
  div.textContent = 'Verificación y reporte in situ del Muestreo de Validación CUT - serie temporal 1985 a 2023';
  document.body.appendChild(div);
}

window.addEventListener('DOMContentLoaded', () => {
  initMapa();
  initSelector();
  cargarPuntos(años[0]);
  mostrarTitulo();
  initControles();
});
