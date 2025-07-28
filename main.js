const API_URL = "https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8";

const capas = {};

async function cargarCapa(nombre, url, estilo, mapa) {
  try {
    const res = await fetch(url, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`
      }
    });
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error(`⚠️ La respuesta para ${nombre} no es un array:`, data);
      return;
    }

    const geojson = {
      type: "FeatureCollection",
      features: data.map(f => ({
        type: "Feature",
        geometry: f.geom, // geom ya es objeto GeoJSON
        properties: f
      }))
    };

    const capa = L.geoJSON(geojson, { style: estilo }).addTo(mapa);
    capas[nombre] = capa;
  } catch (error) {
    console.error(`❌ Error al cargar ${nombre}:`, error);
  }
}

function toggleCapa(nombre, url, estilo, mapa, visible) {
  if (visible) {
    if (!capas[nombre]) {
      cargarCapa(nombre, url, estilo, mapa);
    } else {
      mapa.addLayer(capas[nombre]);
    }
  } else {
    if (capas[nombre]) {
      mapa.removeLayer(capas[nombre]);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const mapa = L.map("mapa").setView([-1.8312, -78.1834], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mapa);

  const checkboxIds = [
    { id: "chkProvincias", nombre: "LIMITE_PROVINCIAL_CONALI_CNE_2022_4326" },
    { id: "chkEcoregiones", nombre: "ECOREGIONES_EC" },
    { id: "chkPoblados", nombre: "POBLADOS" },
    { id: "chkRios", nombre: "RIOS_SIMPLES4326" },
    { id: "chkPuntos", nombre: "base_puntos_validados_ec_gl_1985_2023" }
  ];

  checkboxIds.forEach(obj => {
    const checkbox = document.getElementById(obj.id);
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        toggleCapa(
          obj.nombre,
          `${API_URL}${obj.nombre}?select=*,geom`,
          {},
          mapa,
          checkbox.checked
        );
      });
    }
  });
});
