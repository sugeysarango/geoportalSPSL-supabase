// main.js completo con 22 clases de cobertura, capas base y popups informativos

// 1. Configuración de Supabase
const SUPABASE_URL = 'https://kkjtytomvcfimovxllpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';

// 2. Lista de años disponibles
const años = Array.from({ length: 2023 - 1985 + 1 }, (_, i) => 1985 + i);

// 3. Colores por clase de cobertura
const colores = {
  "Bosque Abierto": "#006400",
  "Bosque Denso": "#228B22",
  "Matorral seco": "#C2B280",
  "Matorral húmedo": "#A2CD5A",
  "Herbazal seco": "#BDB76B",
  "Herbazal húmedo": "#9ACD32",
  "Herbazales de páramo": "#DAA520",
  "Manglar": "#2E8B57",
  "Palmar": "#556B2F",
  "Pasto": "#7CFC00",
  "Cultivo anual": "#FFD700",
  "Cultivo perenne": "#FFA500",
  "Cultivo de arroz": "#F0E68C",
  "Cultivo de caña": "#CD853F",
  "Pastizal con cultivo": "#EEE8AA",
  "Área urbana": "#A9A9A9",
  "Infraestructura": "#D3D3D3",
  "Zona sin vegetación": "#F5F5F5",
  "Cuerpo de agua": "#1E90FF",
  "Nieve / Glaciar": "#FFFFFF",
  "No Observada": "#FF69B4",
  "Sin Información": "#808080"
};

let mapa;
const capas = {};

// 4. Inicializar el mapa
function initMapa() {
  mapa = L.map('map').setView([-1.5, -78.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
}

// 5. Inicializar selector de año
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

// 6. Cargar puntos validados por año
function cargarPuntos(año) {
  if (capas.puntos) mapa.removeLayer(capas.puntos);

  const url = `${SUPABASE_URL}/rest/v1/base_puntos_validados_ec_gl_1985_2023?select=plotid,cut${año},geometry`;
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
      geometry: JSON.parse(d.geometry),
      properties: {
        plotid: d.plotid,
        clase: d[`cut${año}`]
      }
    }));
    capas.puntos = L.geoJSON(features, {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, {
        radius: 5,
        fillColor: colores[f.properties.clase] || '#000',
        color: '#000',
        weight: 1,
        fillOpacity: 0.8
      }),
      onEachFeature: (f, layer) => {
        layer.bindPopup(`<b>PlotID:</b> ${f.properties.plotid}<br><b>Clase CUT ${año}:</b> ${f.properties.clase}`);
      }
    }).addTo(mapa);
    mapa.fitBounds(capas.puntos.getBounds());
  });
}

// 7. Cargar capas base con estilos
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
      geometry: JSON.parse(d.geom),
      properties: { [campoPopup]: d[campoPopup] }
    }));
    let capa;
    if (tabla === 'POBLADOS') {
      capa = L.geoJSON(features, {
        pointToLayer: (f, latlng) => L.circleMarker(latlng, {
          radius: 4,
          color: 'blue',
          fillOpacity: 0.6
        }),
        onEachFeature: (f, l) => l.bindPopup(`<b>Poblado:</b> ${f.properties[campoPopup]}`)
      });
    } else {
      capa = L.geoJSON(features, {
        style: estilo,
        onEachFeature: (f, l) => l.bindPopup(`<b>${campoPopup}:</b> ${f.properties[campoPopup]}`)
      });
    }
    capas[nombre] = capa;
    capa.addTo(mapa);
    controlCapas.addOverlay(capa, nombre);
  });
}

let controlCapas;

// 8. Inicializa todo
window.addEventListener('DOMContentLoaded', () => {
  initMapa();
  initSelector();
  cargarPuntos(años[0]);

  controlCapas = L.control.layers(null, null, { collapsed: false }).addTo(mapa);

  cargarGeoJSON('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'Provincias', { color: 'red', weight: 1 }, 'PROVINCIA');
  cargarGeoJSON('ECOREGIONES_EC', 'Ecorregiones', { color: 'green', weight: 1, fillOpacity: 0.4 }, 'NOMBRE');
  cargarGeoJSON('RIOS_SIMPLES4326', 'Ríos', { color: 'blue', weight: 1 }, 'NAM');
  cargarGeoJSON('POBLADOS', 'Poblados', {}, 'nombre');
});
