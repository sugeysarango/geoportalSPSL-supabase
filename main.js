// main.js

const supabaseUrl = 'https://kkjtytomvcfimovxllpj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`
};

const capas = [
  { nombre: 'ECOREGIONES_EC', columna: 'geom' },
  { nombre: 'LIMITE_PROVINCIAL_CONALI_CNE_2022_4326', columna: 'geom' },
  { nombre: 'POBLADOS', columna: 'geom' },
  { nombre: 'RIOS_SIMPLES4326', columna: 'geom' },
  { nombre: 'base_puntos_validados_ec_gl_1985_2023', columna: 'geometry' }
];

const coloresClases = {
  'Bosque Denso': '#006400',
  'Bosque Abierto': '#228B22',
  'Matorral': '#7CFC00',
  'Herbazal': '#ADFF2F',
  'Manglar': '#2E8B57',
  'Humedal': '#66CDAA',
  'Agricultura': '#FFD700',
  'Pastizal': '#FFA500',
  'Área Urbana': '#FF4500',
  'Infraestructura': '#8B0000',
  'Nieve': '#FFFFFF',
  'Cuerpo de Agua': '#1E90FF',
  'Zona Glaciar': '#ADD8E6',
  'Bosque Plantado': '#90EE90',
  'Cosecha Reciente': '#F0E68C',
  'Tala Selectiva': '#D2B48C',
  'Área Minera': '#B8860B',
  'Área en Recuperación': '#556B2F',
  'Parche Seco': '#DEB887',
  'No Observada': '#A9A9A9',
  'Sin Información': '#D3D3D3'
};

const map = L.map('map').setView([-1.5, -78.5], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const leyendaContenedor = document.getElementById('leyenda-colores');
for (const clase in coloresClases) {
  const item = document.createElement('div');
  item.className = 'leyenda-color';
  item.innerHTML = `<span style="background:${coloresClases[clase]}"></span>${clase}`;
  leyendaContenedor.appendChild(item);
}

const capasGeojson = {};
async function cargarCapa(nombreTabla, columnaGeom, nombreVisor) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${nombreTabla}?select=*,${columnaGeom}`, { headers });
  const data = await res.json();
  if (!Array.isArray(data)) return console.error(`❌ Error al cargar ${nombreVisor}:`, data);

  capasGeojson[nombreTabla] = L.geoJSON(data.map(f => {
    const geom = f[columnaGeom];
    return {
      type: 'Feature',
      geometry: typeof geom === 'string' ? JSON.parse(geom) : geom,
      properties: f
    };
  }), {
    onEachFeature: (feature, layer) => {
      let popup = '';
      for (const key in feature.properties) {
        if (key !== columnaGeom) popup += `<b>${key}</b>: ${feature.properties[key]}<br>`;
      }
      layer.bindPopup(popup);
    }
  }).addTo(map);
}

capas.forEach(c => cargarCapa(c.nombre, c.columna, c.nombre));

// Checkbox para mostrar/ocultar capas
const checkboxes = {
  chkProvincias: 'LIMITE_PROVINCIAL_CONALI_CNE_2022_4326',
  chkEcorregiones: 'ECOREGIONES_EC',
  chkRios: 'RIOS_SIMPLES4326',
  chkPoblados: 'POBLADOS',
  chkPuntos: 'base_puntos_validados_ec_gl_1985_2023'
};
for (const id in checkboxes) {
  document.getElementById(id).addEventListener('change', function () {
    const nombre = checkboxes[id];
    if (this.checked) capasGeojson[nombre]?.addTo(map);
    else map.removeLayer(capasGeojson[nombre]);
  });
}

// Año selector
const selectAnyo = document.getElementById('select-anyo');
for (let y = 1985; y <= 2023; y++) {
  const opt = document.createElement('option');
  opt.value = y;
  opt.innerText = y;
  selectAnyo.appendChild(opt);
}

// PDF
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const plotid = document.getElementById('plotid').value;
  const cobertura = document.getElementById('cobertura_actual').value;
  const altitud = document.getElementById('altitud').value;
  const tecnico = document.getElementById('nombre_tecnico').value;
  const direccion = document.getElementById('direccion_provincial').value;
  const observaciones = document.getElementById('observaciones').value;

  doc.text("Formulario de Verificación de Cobertura", 10, 10);
  doc.text(`PlotID: ${plotid}`, 10, 20);
  doc.text(`Cobertura Actual: ${cobertura}`, 10, 30);
  doc.text(`Altitud: ${altitud}`, 10, 40);
  doc.text(`Nombre del Técnico: ${tecnico}`, 10, 50);
  doc.text(`Dirección Provincial Ambiental: ${direccion}`, 10, 60);
  doc.text(`Observaciones: ${observaciones}`, 10, 70);

  doc.save("reporte_validacion.pdf");
}
