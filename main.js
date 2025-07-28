// main.js actualizado con geometrías corregidas y leyenda de 22 clases

const supabaseUrl = 'https://kkjtytomvcfimovxllpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // (tu key completa)

// Funciones auxiliares para cargar capas
async function cargarCapa(nombreTabla, nombreCapa, nombreColumnaGeom = 'geom') {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${nombreTabla}?select=*,${nombreColumnaGeom}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    const data = await response.json();
    const geojson = {
      type: 'FeatureCollection',
      features: data.map((row) => {
        return {
          type: 'Feature',
          geometry: JSON.parse(row[nombreColumnaGeom]),
          properties: row,
        };
      }),
    };
    const layer = L.geoJSON(geojson, {
      onEachFeature: function (feature, layer) {
        const props = feature.properties;
        let contenido = `<strong>${nombreCapa}</strong><br>`;
        for (const key in props) {
          if (key !== nombreColumnaGeom && props[key]) {
            contenido += `<b>${key}:</b> ${props[key]}<br>`;
          }
        }
        layer.bindPopup(contenido);
      },
      style: nombreTabla === 'LIMITE_PROVINCIAL_CONALI_CNE_2022_4326' ? {
        color: '#3333cc', weight: 1.5, fillOpacity: 0.1
      } : nombreTabla === 'ECOREGIONES_EC' ? {
        color: '#66cc66', weight: 1.2, fillOpacity: 0.1
      } : nombreTabla === 'RIOS_SIMPLES4326' ? {
        color: '#3366cc', weight: 0.7
      } : undefined,
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: '#ff6600',
          fillOpacity: 0.9,
          color: '#fff',
          weight: 1
        });
      }
    });
    capas[nombreCapa] = layer;
    layer.addTo(mapa);
  } catch (error) {
    console.error(`Error al cargar ${nombreCapa}:`, error);
  }
}

// Inicializar mapa
const mapa = L.map('map').setView([-1.5, -78.0], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

const capas = {};

// Cargar todas las capas necesarias con sus columnas geom
cargarCapa('base_puntos_validados_ec_gl_1985_2023', 'Puntos Validados', 'geometry');
cargarCapa('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'Provincias', 'geom');
cargarCapa('ECOREGIONES_EC', 'Ecorregiones', 'geom');
cargarCapa('POBLADOS', 'Poblados', 'geom');
cargarCapa('RIOS_SIMPLES4326', 'Ríos', 'geom');

// Control de capas
const control = L.control.layers(null, capas, { collapsed: false }).addTo(mapa);

// Leyenda (22 clases ejemplo, puedes personalizar colores)
const clases = [
  'Bosque Denso', 'Bosque Abierto', 'Matorral', 'Herbazal', 'Manglar', 'Humedal', 'Agricultura', 'Pastizal',
  'Área Urbana', 'Infraestructura', 'Suelo Desnudo', 'Nieve', 'Cuerpo de Agua', 'Zona Glaciar',
  'Bosque Plantado', 'Cosecha Reciente', 'Tala Selectiva', 'Área Minera', 'Zona en Recuperación', 'Parche Seco',
  'No Observada', 'Sin Información'
];
const colores = [
  '#006400', '#228B22', '#7CFC00', '#ADFF2F', '#2E8B57', '#66CDAA', '#FFD700', '#FFA500',
  '#FF4500', '#A0522D', '#DEB887', '#FFFFFF', '#4682B4', '#B0E0E6',
  '#32CD32', '#BDB76B', '#8FBC8F', '#A9A9A9', '#98FB98', '#CD853F',
  '#999999', '#cccccc'
];

const leyenda = L.control({ position: 'bottomright' });
leyenda.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  clases.forEach((clase, i) => {
    div.innerHTML += `<i style="background:${colores[i]}; width:18px; height:18px; float:left; margin-right:6px; opacity:0.9;"></i>${clase}<br>`;
  });
  return div;
};
leyenda.addTo(mapa);
