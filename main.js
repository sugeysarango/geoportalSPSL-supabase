// main.js

import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

let map = L.map("map").setView([-1.8312, -78.1834], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Variables globales para capas
let capaProvincias, capaEcorregiones, capaPoblados, capaRios, capaPuntos;

// Función para cargar GeoJSON desde Supabase
async function cargarCapa(nombreTabla, estilo, onEachFeature) {
  const url = `https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/${nombreTabla}?select=*`;
  const response = await fetch(url, {
    headers: {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8",
    },
  });

  const data = await response.json();
  const geojson = {
    type: "FeatureCollection",
    features: data.map((d) => ({
      type: "Feature",
      geometry: JSON.parse(d.geom),
      properties: d,
    })),
  };
  return L.geoJSON(geojson, {
    style,
    onEachFeature,
    pointToLayer: estilo.pointToLayer,
  });
}

function toggleCapa(checkboxId, capa) {
  document.getElementById(checkboxId).addEventListener("change", (e) => {
    if (e.target.checked) {
      capa.addTo(map);
    } else {
      map.removeLayer(capa);
    }
  });
}

function crearLeyenda(clases) {
  const leyenda = document.getElementById("leyenda-clases");
  leyenda.innerHTML = "<b>Leyenda:</b><br>";
  clases.forEach((c) => {
    leyenda.innerHTML += `<div><span style="background:${c.color};width:12px;height:12px;display:inline-block;margin-right:4px"></span>${c.nombre}</div>`;
  });
}

function generarReportePDF() {
  const clase = document.getElementById("clase").value;
  const fecha = document.getElementById("fecha").value;
  const tecnico = document.getElementById("tecnico").value;
  const provincia = document.getElementById("provincia").value;
  const altitud = document.getElementById("altitud").value;
  const plotid = document.getElementById("plotid").value;
  const foto = document.getElementById("foto").files[0];

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`PlotID: ${plotid}`, 10, 10);
  doc.text(`Clase verificada: ${clase}`, 10, 20);
  doc.text(`Fecha: ${fecha}`, 10, 30);
  doc.text(`Técnico: ${tecnico}`, 10, 40);
  doc.text(`Provincia: ${provincia}`, 10, 50);
  doc.text(`Altitud: ${altitud}`, 10, 60);

  if (foto) {
    const reader = new FileReader();
    reader.onload = function (e) {
      doc.addImage(e.target.result, "JPEG", 10, 70, 100, 75);
      doc.save(`Reporte_${plotid}.pdf`);
    };
    reader.readAsDataURL(foto);
  } else {
    doc.save(`Reporte_${plotid}.pdf`);
  }
}

// Inicialización de capas
(async () => {
  capaProvincias = await cargarCapa("LIMITE_PROVINCIAL_CONALI_CNE_2022_4326", {
    color: "red",
    weight: 1,
  }, (feature, layer) => {
    layer.bindPopup(`Provincia: ${feature.properties.dpa_despro}`);
  });
  capaEcorregiones = await cargarCapa("ecoregiones_geo", {
    color: "green",
    weight: 1,
  }, (feature, layer) => {
    layer.bindPopup(`Ecorregión: ${feature.properties.ecoregion}`);
  });
  capaPoblados = await cargarCapa("POBLADOS", {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 3, color: "black" }),
  }, (feature, layer) => {
    layer.bindPopup(`Poblado: ${feature.properties.nombre}`);
  });
  capaRios = await cargarCapa("RIOS", {
    color: "blue",
    weight: 0.8,
  }, (feature, layer) => {
    layer.bindPopup(`Río`);
  });
  capaPuntos = await cargarCapa("base_puntos_validados_ec_gl_1985_2023", {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, {
      radius: 5,
      fillColor: "orange",
      fillOpacity: 0.7,
      color: "black",
      weight: 1,
    }),
  }, (feature, layer) => {
    layer.on("click", () => {
      document.getElementById("plotid").value = feature.properties.plotid;
    });
    layer.bindPopup(`Clase: ${feature.properties.clase_2023}`);
  });

  capaProvincias.addTo(map);
  capaEcorregiones.addTo(map);
  capaPoblados.addTo(map);
  capaRios.addTo(map);
  capaPuntos.addTo(map);

  toggleCapa("chkProvincias", capaProvincias);
  toggleCapa("chkEcorregiones", capaEcorregiones);
  toggleCapa("chkPoblados", capaPoblados);
  toggleCapa("chkRios", capaRios);
  toggleCapa("chkPuntos", capaPuntos);

  crearLeyenda([
    { nombre: "Bosque", color: "#006400" },
    { nombre: "Agrícola", color: "#FFD700" },
    { nombre: "Urbano", color: "#FF0000" },
    { nombre: "Humedal", color: "#00FFFF" },
    { nombre: "Sin información", color: "#999999" },
    { nombre: "Otro", color: "#FFA500" },
  ]);
})();
