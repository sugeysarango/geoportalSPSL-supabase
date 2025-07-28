// main.js corregido para producción (sin import)

// Inicializar jsPDF desde el contexto global
const { jsPDF } = window.jspdf;

// Inicializar el mapa
const map = L.map("map").setView([-1.8312, -78.1834], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Supabase credentials
const supabaseUrl = "https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/";
const apiKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8";

// Cargar capa desde Supabase
async function cargarCapa(nombreTabla, opciones = {}, popupFn = null) {
  const url = `${supabaseUrl}${nombreTabla}?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const data = await res.json();

  const geojson = {
    type: "FeatureCollection",
    features: data.map((f) => ({
      type: "Feature",
      geometry: JSON.parse(f.geom),
      properties: f,
    })),
  };

  return L.geoJSON(geojson, {
    ...opciones,
    onEachFeature: (feature, layer) => {
      if (popupFn) {
        layer.bindPopup(popupFn(feature));
      }
      if (nombreTabla === "base_puntos_validados_ec_gl_1985_2023") {
        layer.on("click", () => {
          document.getElementById("plotid").value = feature.properties.plotid;
        });
      }
    },
  });
}

// Mostrar leyenda simple (puedes personalizarla)
function mostrarLeyenda() {
  const leyenda = document.getElementById("leyenda-clases");
  leyenda.innerHTML = `<b>Leyenda de cobertura:</b>
    <div><span style="background:#006400;width:12px;height:12px;display:inline-block;"></span> Bosque</div>
    <div><span style="background:#FFD700;width:12px;height:12px;display:inline-block;"></span> Agrícola</div>
    <div><span style="background:#FF0000;width:12px;height:12px;display:inline-block;"></span> Urbano</div>
    <div><span style="background:#00FFFF;width:12px;height:12px;display:inline-block;"></span> Humedal</div>
    <div><span style="background:#999999;width:12px;height:12px;display:inline-block;"></span> Sin Información</div>
    <div><span style="background:#FFA500;width:12px;height:12px;display:inline-block;"></span> Otro</div>`;
}

// Vincular checkbox a capa
function vincularCheckbox(idCheckbox, capa) {
  const chk = document.getElementById(idCheckbox);
  chk.addEventListener("change", () => {
    if (chk.checked) {
      capa.addTo(map);
    } else {
      map.removeLayer(capa);
    }
  });
}

// Generar PDF con los datos del formulario
document.getElementById("generarPDF").addEventListener("click", () => {
  const doc = new jsPDF();
  const plotid = document.getElementById("plotid").value;
  const cobertura = document.getElementById("cobertura").value;
  const fecha = document.getElementById("fecha").value;
  const altitud = document.getElementById("altitud").value;
  const direccion = document.getElementById("direccion").value;
  const provincia = document.getElementById("provincia").value;
  const tecnico = document.getElementById("tecnico").value;
  const observacion = document.getElementById("observacion").value;

  doc.text(`Reporte de Validación CUT`, 10, 10);
  doc.text(`PlotID: ${plotid}`, 10, 20);
  doc.text(`Cobertura actual: ${cobertura}`, 10, 30);
  doc.text(`Fecha: ${fecha}`, 10, 40);
  doc.text(`Altitud: ${altitud}`, 10, 50);
  doc.text(`Dirección Provincial: ${direccion}`, 10, 60);
  doc.text(`Provincia: ${provincia}`, 10, 70);
  doc.text(`Técnico: ${tecnico}`, 10, 80);
  doc.text(`Observación: ${observacion}`, 10, 90);

  const foto = document.getElementById("foto").files[0];
  if (foto) {
    const reader = new FileReader();
    reader.onload = function (e) {
      doc.addImage(e.target.result, "JPEG", 10, 100, 100, 75);
      doc.save(`Reporte_${plotid}.pdf`);
    };
    reader.readAsDataURL(foto);
  } else {
    doc.save(`Reporte_${plotid}.pdf`);
  }
});

// Cargar todas las capas y conectar con controles
(async () => {
  const provincias = await cargarCapa("LIMITE_PROVINCIAL_CONALI_CNE_2022_4326", { style: { color: "blue" } }, f => `Provincia: ${f.properties.dpa_despro}`);
  const ecorregiones = await cargarCapa("ECOREGIONES_EC", { style: { color: "green" } }, f => `Ecorregión: ${f.properties.ecoregion}`);
  const poblados = await cargarCapa("POBLADOS", {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 3, color: "black" })
  }, f => `Poblado: ${f.properties.nombre}`);
  const rios = await cargarCapa("RIOS_SIMPLES4326", { style: { color: "cyan" } }, f => `Río`);
  const puntos = await cargarCapa("base_puntos_validados_ec_gl_1985_2023", {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, {
      radius: 6, fillColor: "orange", fillOpacity: 0.7, color: "black", weight: 1
    })
  }, f => `Clase: ${f.properties.clase_2023}`);

  provincias.addTo(map);
  ecorregiones.addTo(map);
  poblados.addTo(map);
  rios.addTo(map);
  puntos.addTo(map);

  vincularCheckbox("chkProvincias", provincias);
  vincularCheckbox("chkEcorregiones", ecorregiones);
  vincularCheckbox("chkPoblados", poblados);
  vincularCheckbox("chkRios", rios);
  vincularCheckbox("chkPuntos", puntos);

  mostrarLeyenda();
})();
