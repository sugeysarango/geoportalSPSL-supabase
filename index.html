<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Geoportal de Validación CUT</title>
  <!-- Leaflet CSS -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
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
    #legend {
      position: absolute;
      bottom: 10px;
      left: 10px;
      z-index: 1000;
      background: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
    }
    .checkboxes {
      margin-top: 10px;
    }
    #reporte {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 13px;
      box-shadow: 0 0 6px rgba(0,0,0,0.3);
      width: 220px;
    }
    #reporte h3 { margin-top: 0; }
    #reporte input, #reporte select, #reporte textarea {
      width: 100%;
      margin-bottom: 6px;
      padding: 4px;
      font-size: 13px;
    }
    #boton-imprimir {
      position: absolute;
      top: 260px;
      right: 10px;
      z-index: 1000;
      background: #4CAF50;
      color: white;
      padding: 8px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <!-- Título único -->
  <div style="position:absolute;top:10px;left:10px;z-index:1000;background:white;padding:8px;border-radius:4px;font-weight:bold">
    Verificación y reporte in situ del Muestreo de Validación CUT - serie temporal 1985 a 2023
  </div>

  <!-- Controles -->
  <div id="controls">
    <label for="select-anyo">Año:&nbsp;</label>
    <select id="select-anyo"></select>
    <div class="checkboxes">
      <label><input type="checkbox" id="chkProvincias" checked /> Provincias</label><br />
      <label><input type="checkbox" id="chkPoblados" checked /> Poblados</label><br />
      <label><input type="checkbox" id="chkEcorregiones" checked /> Ecorregiones</label><br />
      <label><input type="checkbox" id="chkRios" checked /> Ríos</label><br />
      <label><input type="checkbox" id="chkPuntos" checked /> Puntos validados</label>
    </div>
  </div>

  <!-- Leyenda -->
  <div id="legend">
    <b>Leyenda:</b><br />
    <span style="color:red;">■</span> Provincias<br />
    <span style="color:blue;">■</span> Ríos<br />
    <span style="color:green;">■</span> Ecorregiones<br />
    <span style="color:orange;">●</span> Puntos validados<br />
    <span style="color:black;">●</span> Poblados
  </div>

  <!-- Formulario de reporte in situ -->
  <div id="reporte">
    <h3>Reporte in situ</h3>
    <form id="form-reporte">
      <input type="hidden" id="plotid" />
      <label>Clase verificada:</label>
      <input type="text" id="clase" required />
      <label>Fecha:</label>
      <input type="date" id="fecha" required />
      <label>Nombre del técnico:</label>
      <input type="text" id="tecnico" required />
      <label>Dirección Provincial:</label>
      <input type="text" id="provincia" required />
      <label>Altitud:</label>
      <input type="number" id="altitud" required />
      <label>Fotografía (código incluido):</label>
      <input type="file" id="foto" accept="image/*" required />
      <button type="submit">Guardar reporte</button>
    </form>
  </div>

  <!-- Botón para imprimir reporte -->
  <button id="boton-imprimir" onclick="generarPDF()">📄 Generar reporte PDF</button>

  <!-- Contenedor del mapa -->
  <div id="map"></div>

  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <!-- Script principal -->
  <script defer src="main.js"></script>

  <!-- Función para generar PDF -->
  <script>
    async function generarPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const clase = document.getElementById("clase").value;
      const fecha = document.getElementById("fecha").value;
      const tecnico = document.getElementById("tecnico").value;
      const provincia = document.getElementById("provincia").value;
      const altitud = document.getElementById("altitud").value;
      const foto = document.getElementById("foto").files[0];

      doc.setFontSize(12);
      doc.text(`Clase verificada: ${clase}`, 10, 20);
      doc.text(`Fecha: ${fecha}`, 10, 30);
      doc.text(`Técnico: ${tecnico}`, 10, 40);
      doc.text(`Dirección Provincial: ${provincia}`, 10, 50);
      doc.text(`Altitud: ${altitud} m`, 10, 60);

      if (foto) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imgData = e.target.result;
          doc.addImage(imgData, 'JPEG', 10, 70, 100, 75);
          doc.save(`Reporte_${plotid.value || 'sin_id'}.pdf`);
        };
        reader.readAsDataURL(foto);
      } else {
        doc.save(`Reporte_${plotid.value || 'sin_id'}.pdf`);
      }
    }
  </script>
</body>
</html>
