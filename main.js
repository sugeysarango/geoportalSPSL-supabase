const { jsPDF } = window.jspdf;
const map = L.map("map").setView([-1.8312, -78.1834], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);

const supabaseUrl = "https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8";

async function cargarCapa(nombreTabla, opciones = {}, popupFn = null) {
  const url = `${supabaseUrl}${nombreTabla}?select=*,geom=st_asgeojson(geom)`;
  const res = await fetch(url, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` }
  });

  if (!res.ok) {
    console.error(`❌ Error al cargar ${nombreTabla}: ${res.statusText}`);
    return L.layerGroup();
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error(`❌ Datos inesperados para ${nombreTabla}:`, data);
    return L.layerGroup();
  }

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
      if (popupFn) layer.bindPopup(popupFn(feature));
      if (nombreTabla === "base_puntos_validados_ec_gl_1985_2023") {
        layer.on("click", () => {
          document.getElementById("plotid").value = feature.properties.plotid;
        });
      }
    },
  });
}

document.getElementById("generarPDF").addEventListener("click", () => {
  const doc = new jsPDF();
  const campos = ["plotid", "cobertura", "fecha", "altitud", "direccion", "provincia", "tecnico", "observacion"];
  campos.forEach((id, i) => {
    const val = document.getElementById(id).value;
    doc.text(`${id.charAt(0).toUpperCase() + id.slice(1)}: ${val}`, 10, 10 + (i * 10));
  });
  const foto = document.getElementById("foto").files[0];
  if (foto) {
    const reader = new FileReader();
    reader.onload = function (e) {
      doc.addImage(e.target.result, "JPEG", 10, 100, 100, 75);
      doc.save(`Reporte_${document.getElementById("plotid").value}.pdf`);
    };
    reader.readAsDataURL(foto);
  } else {
    doc.save(`Reporte_${document.getElementById("plotid").value}.pdf`);
  }
});

(async () => {
  const capas = {
    chkProvincias: await cargarCapa("LIMITE_PROVINCIAL_CONALI_CNE_2022_4326", { style: { color: "blue" } }, f => `Provincia: ${f.properties.PROVINCIA}`),
    chkEcorregiones: await cargarCapa("ECOREGIONES_EC", { style: { color: "green" } }, f => `Ecorregión: ${f.properties.ecoregion}`),
    chkPoblados: await cargarCapa("POBLADOS", {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 3, color: "black" })
    }, f => `Poblado: ${f.properties.nombre}`),
    chkRios: await cargarCapa("RIOS_SIMPLES4326", { style: { color: "cyan" } }, () => `Río`),
    chkPuntos: await cargarCapa("base_puntos_validados_ec_gl_1985_2023", {
      pointToLayer: (f, latlng) => L.circleMarker(latlng, {
        radius: 6, fillColor: "orange", fillOpacity: 0.7, color: "black", weight: 1
      })
    }, f => `Clase: ${f.properties.clase_2023}`)
  };

  for (const [id, capa] of Object.entries(capas)) {
    capa.addTo(map);
    document.getElementById(id).addEventListener("change", (e) => {
      if (e.target.checked) {
        capa.addTo(map);
      } else {
        map.removeLayer(capa);
      }
    });
  }

  document.getElementById("leyenda-clases").innerHTML = `
    <b>Leyenda de cobertura:</b>
    <div><span style="background:#006400;width:12px;height:12px;display:inline-block;"></span> Bosque</div>
    <div><span style="background:#FFD700;width:12px;height:12px;display:inline-block;"></span> Agrícola</div>
    <div><span style="background:#FF0000;width:12px;height:12px;display:inline-block;"></span> Urbano</div>
    <div><span style="background:#00FFFF;width:12px;height:12px;display:inline-block;"></span> Humedal</div>
    <div><span style="background:#999999;width:12px;height:12px;display:inline-block;"></span> Sin Información</div>
  `;
})();
