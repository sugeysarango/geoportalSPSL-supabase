const apiUrl = 'https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';

const capas = [
  'LIMITE_PROVINCIAL_CONALI_CNE_2022_4326',
  'ECOREGIONES_EC',
  'POBLADOS',
  'RIOS_SIMPLES4326',
  'base_puntos_validados_ec_gl_1985_2023'
];

const map = L.map('map').setView([-1.4, -78.5], 6);

// Mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(map);

const capasGeojson = {};

function cargarCapa(nombre) {
  fetch(`${apiUrl}${nombre}?select=geom`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error(`❌ Error al cargar ${nombre}`);
      return res.json();
    })
    .then(datos => {
      if (!Array.isArray(datos)) throw new Error(`⚠️ ${nombre} no devolvió una lista`);
      
      const features = datos.map(f => {
        return {
          type: 'Feature',
          geometry: JSON.parse(f.geom),
          properties: {}
        };
      });

      const geojson = {
        type: 'FeatureCollection',
        features: features
      };

      const layer = L.geoJSON(geojson).addTo(map);
      capasGeojson[nombre] = layer;
    })
    .catch(err => {
      console.error(`❌ Error al cargar ${nombre}:`, err.message);
    });
}

// Cargar todas las capas
capas.forEach(cargarCapa);
