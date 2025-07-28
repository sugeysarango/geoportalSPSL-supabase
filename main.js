// main.js para Geoportal CUT con Supabase, Leaflet, formulario y leyenda de 22 clases

// 1. Configuración de Supabase
const SUPABASE_URL = 'https://kkjtytomvcfimovxllpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';

// 2. Lista de años
const años = Array.from({ length: 2023 - 1985 + 1 }, (_, i) => 1985 + i);

// 3. Colores para 22 clases de cobertura
const colores = {
  "Bosque Abierto": "#228B22",
  "Bosque Denso": "#006400",
  "Páramo": "#ADFF2F",
  "Pasto": "#7CFC00",
  "Herbazal": "#9ACD32",
  "Cuerpo de Agua": "#1E90FF",
  "Agricultura no especificada": "#FFD700",
  "Agricultura Irrigada": "#FFA500",
  "Agricultura de Secano": "#FF8C00",
  "Área Urbana": "#D2691E",
  "Infraestructura": "#A52A2A",
  "Zonas Quemadas": "#B22222",
  "Nieve o Hielo": "#F0FFFF",
  "Manglar": "#556B2F",
  "Humedal": "#00CED1",
  "Río": "#4682B4",
  "Playa": "#DAA520",
  "Zonas Rocosas": "#A9A9A9",
  "Suelo Desnudo": "#DEB887",
  "Vegetación Secundaria": "#32CD32",
  "Sin Información": "#808080",
  "No Observada": "#D3D3D3"
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
  const url = `${SUPABASE_URL}/rest/v1/base_puntos_validados_ec_gl_1985_2023?select=plotid,cut${año},geojson`;
  fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  })
  .then(res => res.json())
  .then(data => {
    const features = data.map(d => ({
      type: "Feature",
      geometry: d.geojson,
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
        layer.bindPopup(`PlotID: ${f.properties.plotid}<br>Clase: ${f.properties.clase}`);
        layer.on('click', () => document.getElementById('plotid').value = f.properties.plotid);
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
      type: "Feature",
      geometry: d.geom,
      properties: { [campoPopup]: d[campoPopup] }
    }));
    let capa = L.geoJSON(features, {
      style: estilo,
      onEachFeature: (f, l) => l.bindPopup(`${f.properties[campoPopup]}`)
    });
    if (tabla === 'POBLADOS') {
      capa = L.geoJSON(features, {
        pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 3, color: "blue", fillOpacity: 0.6 }),
        onEachFeature: (f, l) => l.bindPopup(f.properties[campoPopup])
      });
    }
    capas[tabla] = capa.addTo(mapa);
  });
}

function crearLeyenda() {
  const leyenda = document.getElementById("leyenda");
  Object.entries(colores).forEach(([clase, color]) => {
    const div = document.createElement("div");
    div.innerHTML = `<span class="legend-color" style="background:${color}"></span>${clase}`;
    leyenda.appendChild(div);
  });
}

function guardarReporte() {
  alert("Reporte guardado localmente (puedes implementar guardado en Supabase si lo deseas).");
}

function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Reporte de Verificación CUT", 10, 10);
  doc.text(`PlotID: ${document.getElementById('plotid').value}`, 10, 20);
  doc.text(`Clase verificada: ${document.getElementById('clase').value}`, 10, 30);
  doc.text(`Fecha: ${document.getElementById('fecha').value}`, 10, 40);
  doc.text(`Técnico: ${document.getElementById('tecnico').value}`, 10, 50);
  doc.text(`Dirección: ${document.getElementById('direccion').value}`, 10, 60);
  doc.text(`Altitud: ${document.getElementById('altitud').value}`, 10, 70);
  doc.save("reporte_verificacion.pdf");
}

window.addEventListener("DOMContentLoaded", () => {
  initMapa();
  initSelector();
  crearLeyenda();
  cargarPuntos(años[0]);
  cargarGeoJSON("LIMITE_PROVINCIAL_CONALI_CNE_2022_4326", "Provincias", { color: "red", weight: 1 }, "PROVINCIA");
  cargarGeoJSON("POBLADOS", "Poblados", {}, "nombre");
  cargarGeoJSON("ECOREGIONES_EC", "Ecorregiones", { color: "green", weight: 1, fillOpacity: 0.3 }, "NOMBRE");
  cargarGeoJSON("RIOS_SIMPLES4326", "Ríos", { color: "blue", weight: 1 }, "NAM");
});
