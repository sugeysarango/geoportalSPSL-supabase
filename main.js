// Configuración básica
const API_URL = "https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8";

// Inicializar el mapa
const mapa = L.map("map").setView([-1.6, -78.6], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);

// Capas y nombres
const capas = {
  "LIMITE_PROVINCIAL_CONALI_CNE_2022_4326": "Provincias",
  "ECOREGIONES_EC": "Ecorregiones",
  "POBLADOS": "Poblados",
  "RIOS_SIMPLES4326": "Ríos",
  "base_puntos_validados_ec_gl_1985_2023": "Puntos validados"
};

const controlCapas = L.control.layers(null, null, { collapsed: false }).addTo(mapa);

// Cargar cada capa desde Supabase
for (const [tabla, nombre] of Object.entries(capas)) {
  fetch(`${API_URL}${tabla}?select=*`, {
    headers: { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` }
  })
    .then((res) => res.json())
    .then((data) => {
      const geojson = {
        type: "FeatureCollection",
        features: data.map((item) => ({
          type: "Feature",
          geometry: JSON.parse(item.geom),
          properties: item
        }))
      };
      const capa = L.geoJSON(geojson, {
        style: { color: "blue", weight: 1, fillOpacity: 0.2 },
        onEachFeature: (feature, layer) => {
          let popup = "";
          for (const key in feature.properties) {
            if (key !== "geom") {
              popup += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
            }
          }
          layer.bindPopup(popup);
        }
      }).addTo(mapa);
      controlCapas.addOverlay(capa, nombre);
    })
    .catch((err) => {
      console.error(`❌ Error al cargar ${tabla}:`, err);
    });
}
