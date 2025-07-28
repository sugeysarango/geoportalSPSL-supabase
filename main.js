
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8";
const urlBase = "https://kkjtytomvcfimovxllpj.supabase.co/rest/v1/";

const capas = {
  "LIMITE_PROVINCIAL_CONALI_CNE_2022_4326": { color: "#000", weight: 1 },
  "ECOREGIONES_EC": { color: "#008000", weight: 1 },
  "POBLADOS": { color: "#800000", weight: 3 },
  "RIOS_SIMPLES4326": { color: "#0000FF", weight: 1 },
  "base_puntos_validados_ec_gl_1985_2023": { color: "#FF0000", weight: 3 }
};

const map = L.map("map").setView([-1.25, -78.5], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

async function cargarCapa(nombreTabla, estilo) {
  try {
    const res = await fetch(`${urlBase}${nombreTabla}?select=geom`, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!res.ok) throw new Error("Error al cargar");
    const data = await res.json();
    const geojson = {
      type: "FeatureCollection",
      features: data.map(d => ({
        type: "Feature",
        geometry: JSON.parse(d.geom),
        properties: d
      }))
    };
    const layer = L.geoJSON(geojson, { style: () => estilo });
    layer.addTo(map);
  } catch (e) {
    console.error(`❌ Error al cargar ${nombreTabla}:`, e);
  }
}

Object.entries(capas).forEach(([nombre, estilo]) => cargarCapa(nombre, estilo));
