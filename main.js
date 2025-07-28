// main.js corregido

const { jsPDF } = window.jspdf;
let map = L.map("map").setView([-1.8312, -78.1834], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Función de carga de capas GeoJSON
async function cargarCapa(tabla, estilo, popupProperty) {
  const response = await fetch(`https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/${tabla}?select=*`, {
    headers: {
      apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8"
    }
  });
  const data = await response.json();
  const geojson = {
    type: "FeatureCollection",
    features: data.map(d => ({
      type: "Feature",
      geometry: JSON.parse(d.geom),
      properties: d,
    })),
  };
  return L.geoJSON(geojson, {
    style,
    onEachFeature: (feature, layer) => layer.bindPopup(`${popupProperty}: ${feature.properties[popupProperty]}`),
  });
}

Promise.all([
  cargarCapa("LIMITE_PROVINCIAL_CONALI_CNE_2022_4326", {color: "blue"}, "dpa_despro"),
  cargarCapa("ECOREGIONES_EC", {color: "green"}, "ecoregion"),
  cargarCapa("POBLADOS", {}, "nombre"),
  cargarCapa("RIOS_SIMPLES4326", {color: "cyan"}, "nombre"),
  cargarCapa("base_puntos_validados_ec_gl_1985_2023", {}, "plotid")
]).then(([provincias, ecoregiones, poblados, rios, puntos]) => {
  provincias.addTo(map); ecoregiones.addTo(map); puntos.addTo(map);
  poblados.addTo(map); rios.addTo(map);
});

// Leyenda (personaliza las 22 clases aquí)
document.getElementById("leyenda-clases").innerHTML = `
  <b>Leyenda de cobertura:</b>
  <div><span style="background:#006400;width:12px;height:12px;display:inline-block;"></span> Bosque</div>
  <!-- Repite con todas las clases -->
`;

// Generar PDF
document.getElementById("generarPDF").onclick = function () {
  const doc = new jsPDF();
  doc.text(`PlotID: ${document.getElementById("plotid").value}`, 10, 10);
  // Añade más campos aquí
  doc.save(`Reporte_${document.getElementById("plotid").value}.pdf`);
};
