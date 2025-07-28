// ✅ main.js actualizado para cargar tus capas Supabase correctamente

const supabaseUrl = 'https://kkjtytomvcfimovxllpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';

// Iniciar mapa Leaflet
const map = L.map('map').setView([-1.8312, -78.1834], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

// Función para cargar capas desde Supabase REST API
async function cargarCapa(nombreTabla, nombreCampo, estilo, popupCallback) {
  const url = `${supabaseUrl}/rest/v1/${nombreTabla}?select=*`;
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    const capa = L.geoJSON(data, {
      style: estilo,
      onEachFeature: function (feature, layer) {
        if (popupCallback) popupCallback(feature, layer);
      }
    });
    capa.addTo(map);
    capasBase[nombreTabla] = capa;
    controlCapas.addOverlay(capa, nombreTabla);
  } catch (error) {
    console.error(`Error al cargar ${nombreTabla}:`, error);
  }
}

const capasBase = {};
const controlCapas = L.control.layers(null, null, { collapsed: false }).addTo(map);

// Cargar capas vectoriales
cargarCapa('ECOREGIONES_EC', 'NOMBRE', { color: 'green' }, (f, l) => {
  l.bindPopup(`<b>Ecorregión:</b> ${f.properties.NOMBRE}`);
});

cargarCapa('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'PROVINCIA', { color: 'purple', weight: 2 }, (f, l) => {
  l.bindPopup(`<b>Provincia:</b> ${f.properties.PROVINCIA}`);
});

cargarCapa('POBLADOS', 'nombre', { color: 'black', weight: 1 }, (f, l) => {
  l.bindPopup(`<b>Poblado:</b> ${f.properties.nombre}`);
});

cargarCapa('RIOS_SIMPLES4326', 'NAM', { color: 'blue', weight: 1 }, (f, l) => {
  l.bindPopup(`<b>Río:</b> ${f.properties.NAM}`);
});

// Cargar puntos validados (con leyenda de las 22 clases)
async function cargarPuntos() {
  const url = `${supabaseUrl}/rest/v1/base_puntos_validados_ec_gl_1985_2023?select=*`;
  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    const capa = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        const clase = feature.properties.clase2023 || 'Sin Información';
        const color = coloresClases[clase] || 'gray';
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: color,
          color: '#000',
          weight: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        let contenido = `<b>PlotID:</b> ${props.plotid}<br>`;
        for (let y = 1985; y <= 2023; y++) {
          if (props[`clase${y}`]) {
            contenido += `<b>${y}:</b> ${props[`clase${y}`]}<br>`;
          }
        }
        layer.bindPopup(contenido);
      }
    });
    capa.addTo(map);
    capasBase['Puntos validados'] = capa;
    controlCapas.addOverlay(capa, 'Puntos validados');
  } catch (error) {
    console.error('Error al cargar puntos validados:', error);
  }
}

// Diccionario de colores para las 22 clases
const coloresClases = {
  'Bosque': '#228B22',
  'Pastos': '#BDB76B',
  'Agricultura': '#FFFF00',
  'Zona urbana': '#FF0000',
  'Cuerpos de agua': '#1E90FF',
  'Manglar': '#8B4513',
  'Humedal': '#00CED1',
  'Paramo': '#A9A9A9',
  'Afloramientos rocosos': '#808080',
  'Sin vegetación': '#F5DEB3',
  'Bosque seco': '#CD853F',
  'Zonas mineras': '#FFA500',
  'Playas': '#FFFACD',
  'Salinas': '#F08080',
  'Cementerio': '#C0C0C0',
  'Cultivo permanente': '#98FB98',
  'Cultivo transitorio': '#EEE8AA',
  'Suelo desnudo': '#DEB887',
  'Zona industrial': '#D2691E',
  'Zonas eriales': '#FAFAD2',
  'Infraestructura': '#708090',
  'Sin Información': '#D3D3D3'
};

cargarPuntos();
