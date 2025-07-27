<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// main.js completo para el Geoportal con Supabase y Leaflet + generación de PDF con fotos

// 1. Configuración de Supabase
const SUPABASE_URL = 'https://kkjtytomvcfimovxllpj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';

// 2. Lista de años
const años = Array.from({ length: 2023 - 1985 + 1 }, (_, i) => 1985 + i);

// 3. Colores por clase
const colores = {
  'Bosque Abierto': '#228B22',
  'Bosque Denso':  '#006400',
  'Pasto':         '#7CFC00',
  'Herbazales de Paramo': '#ADFF2F',
  'Agricultura no especifica': '#FFD700',
  'Sin Informacion': '#A9A9A9'
};

let mapa;
const capas = {}; // Guarda las capas activas

// 4. Inicializa el mapa
function initMapa() {
  mapa = L.map('map').setView([-1.5, -78.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
}

// 5. Crea el selector de año
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

  const url = `${SUPABASE_URL}/rest/v1/puntos_validos_geo?select=plotid,cut${año},geojson`;
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
        color: '#000', weight: 1,
        fillOpacity: 0.8
      }),
      onEachFeature: (f, layer) => {
        layer.bindPopup(`PlotID: ${f.properties.plotid}<br>Clase: ${f.properties.clase}`);
        layer.on('click', () => {
          document.getElementById('plotid').value = f.properties.plotid;
        });
      }
    }).addTo(mapa);
    mapa.fitBounds(capas.puntos.getBounds());
  });
}

// 7. Cargar capas adicionales
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
          radius: 3,
          color: 'black',
          fillOpacity: 0.6
        }),
        onEachFeature: (f, l) => l.bindPopup(`${f.properties[campoPopup]}`)
      });
    } else {
      capa = L.geoJSON(features, {
        style: estilo,
        onEachFeature: (f, l) => l.bindPopup(`${f.properties[campoPopup]}`)
      });
    }
    capas[tabla] = capa.addTo(mapa);
  });
}

// 8. Guardar datos del formulario en Supabase
const form = document.getElementById('form-reporte');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const plotid = document.getElementById('plotid').value;
  const clase = document.getElementById('clase').value;
  const fecha = document.getElementById('fecha').value;
  const tecnico = document.getElementById('tecnico').value;
  const provincia = document.getElementById('provincia').value;
  const altitud = document.getElementById('altitud').value;
  const fotoInput = document.getElementById('foto');
  const foto = fotoInput.files[0];

  if (!plotid || !clase || !fecha || !tecnico || !provincia || !altitud || !foto) {
    alert('Por favor, completa todos los campos antes de guardar.');
    return;
  }

  try {
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    const filePath = `reportes_fotos/${plotid}_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('reportes_fotos').upload(filePath, foto);

    if (uploadError) throw uploadError;

    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${uploadData.fullPath}`;

    const { data, error } = await supabaseClient.from('reportes_in_situ').insert([
      { plotid, clase_verificada: clase, fecha_verificacion: fecha, tecnico, provincia, altitud, foto_url: imageUrl }
    ]);

    if (error) throw error;

    alert('¡Reporte guardado correctamente!');
    form.reset();
  } catch (err) {
    console.error('Error al guardar el reporte:', err);
    alert('Hubo un error al guardar el reporte. Revisa la consola.');
  }
});

// 9. Generar PDF con los reportes del día
async function generarReportePDF() {
  const hoy = new Date().toISOString().split('T')[0];
  const { createClient } = supabase;
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: reportes, error } = await supabaseClient
    .from('reportes_in_situ')
    .select('*')
    .eq('fecha_verificacion', hoy);

  if (error) {
    alert('Error al cargar los reportes del día');
    return;
  }

  const pdf = new jsPDF();
  let y = 10;

  for (const r of reportes) {
    pdf.text(`PlotID: ${r.plotid}`, 10, y);
    pdf.text(`Clase: ${r.clase_verificada}`, 10, y += 7);
    pdf.text(`Técnico: ${r.tecnico}`, 10, y += 7);
    pdf.text(`Provincia: ${r.provincia}`, 10, y += 7);
    pdf.text(`Altitud: ${r.altitud}`, 10, y += 7);
    pdf.text(`Fecha: ${r.fecha_verificacion}`, 10, y += 7);

    const img = await fetch(r.foto_url).then(res => res.blob()).then(blob => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    });

    pdf.addImage(img, 'JPEG', 120, y - 35, 60, 45);
    y += 60;

    if (y > 260) {
      pdf.addPage();
      y = 10;
    }
  }

  pdf.save(`Reporte_verificacion_${hoy}.pdf`);
}

// 10. Inicializa todo
window.addEventListener('DOMContentLoaded', () => {
  initMapa();
  initSelector();
  cargarPuntos(años[0]);

  cargarGeoJSON('LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', 'Provincias', { color: 'red', weight: 2 }, 'PROVINCIA');
  cargarGeoJSON('POBLADOS', 'Poblados', {}, 'nombre');
  cargarGeoJSON('ECOREGIONES_EC', 'Ecorregiones', { color: 'green', weight: 1, fillOpacity: 0.4 }, 'NOMBRE');
  cargarGeoJSON('RIOS_SIMPLES4326', 'Ríos', { color: 'blue', weight: 1 }, 'NAM');
  cargarGeoJSON('base_puntos_validados_ec_gl_1985_2023', 'Puntos validados', {
    radius: 3, fillColor: 'orange', fillOpacity: 0.7, color: 'gray', weight: 0.5
  }, 'plotid');
});
