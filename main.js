<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Geoportal de Validación CUT</title>
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; left: 0; right: 0; }
    #controls {
      position: absolute;
      top: 60px;
      left: 10px;
      z-index: 1000;
      background: white;
      padding: 8px;
      border-radius: 4px;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
    }
    #select-anyo {
      font-size: 14px;
    }
  </style>
</head>
<body>
  <!-- Título -->
  <div style="position:absolute;top:10px;left:10px;z-index:1000;background:white;padding:8px;border-radius:4px;font-weight:bold">
    Verificación y reporte in situ del Muestreo de Validación CUT - serie temporal 1985 a 2023
  </div>

  <!-- Controles -->
  <div id="controls">
    <label for="select-anyo">Año:&nbsp;</label>
    <select id="select-anyo"></select>
  </div>

  <!-- Contenedor del mapa -->
  <div id="map"></div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <!-- Script principal -->
  <script defer src="main.js"></script>
</body>
</html>
