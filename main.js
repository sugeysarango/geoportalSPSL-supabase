// Inserta esto en tu archivo main.js debajo de las otras capas existentes

// API y URL base
const supabaseUrl = 'https://kkjtytomvcfimovxllpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';
const options = { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } };

// Función para cargar GeoJSON y añadir al mapa
async function cargarGeoJSON(tabla, capaNombre, estilo, popupField) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${tabla}?select=*`, options);
  const data = await response.json();

  const capa = L.geoJSON(data, {
    style: estilo,
    pointToLayer: (feature, latlng) => {
      if (tabla === 'POBLADOS') {
        return L.circleMarker(latlng, { radius: 5, fillColor: 'blue', fillOpacity: 0.8, color: 'white', weight: 1 });
      }
      return L.marker(latlng);
    },
    onEachFeature: function (feature, layer) {
      if (popupField && feature.properties[popupField]) {
        layer.bindPopup(`<strong>${feature.properties[popupField]}</strong>`);
      }
    }
  });

  capa.addTo(map);
  capasDisponibles[capaNombre] = capa;
  agregarCheckbox(capaNombre);
}

// Crear objeto de capas disponibles
const capasDisponibles = {};

// Agregar checkboxes
function agregarCheckbox(nombre) {
  const capaDiv = document.getElementById('capas');
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = true;
  input.onchange = () => {
    if (input.checked) {
      capasDisponibles[nombre].addTo(map);
    } else {
      map.removeLayer(capasDisponibles[nombre]);
    }
  };
  label.appendChild(input);
  label.appendChild(document.createTextNode(` ${nombre}`));
  capaDiv.appendChild(label);
  capaDiv.appendChild(document.createElement('br'));
}

// Cargar todas las capas
cargarGeoJSON('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'Provincias', { color: 'red', weight: 2 }, 'PROVINCIA');
cargarGeoJSON('POBLADOS', 'Poblados', {}, 'nombre');
cargarGeoJSON('ECOREGIONES_EC', 'Ecorregiones', { color: 'green', weight: 1, fillOpacity: 0.4 }, 'NOMBRE');
cargarGeoJSON('RIOS_SIMPLES4326', 'Ríos', { color: 'blue', weight: 1 }, 'NAM');
cargarGeoJSON('base_puntos_validados_ec_gl_1985_2023', 'Puntos validados', {
  radius: 3, fillColor: 'orange', fillOpacity: 0.7, color: 'gray', weight: 0.5
}, 'plotid');
