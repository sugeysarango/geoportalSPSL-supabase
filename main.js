A continuación el code del main.js actualizado

// main.js

// Guardar datos del formulario en Supabase
const form = document.getElementById('form-reporte');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const plotid = document.getElementById('plotid').value;
  const clase = document.getElementById('clase').value;
  const fecha = document.getElementById('fecha').value;
  const tecnico = document.getElementById('tecnico').value;
  const provincia = document.getElementById('provincia').value;
  const altitud = document.getElementById('altitud').value;
  const fotoInput = document.getElementById('foto');
  const foto = fotoInput.files[0];

  if (!plotid || !clase || !fecha || !tecnico || !provincia || !altitud || !foto) {
    alert('Por favor, completa todos los campos antes de guardar.');
    return;
  }

  try {
    const supabaseUrl = 'https://kkjtytomvcfimovxllpj.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtranR5dG9tdmNmaW1vdnhsbHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzMzgsImV4cCI6MjA2ODg4MDMzOH0.BWtig4Et9BLE2t9xno6JudoRho3xBCS4VjFL1h3TT-8';
    const { createClient } = supabase;
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Subir imagen a Supabase Storage
    const filePath = `reportes_fotos/${plotid}_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage.from('reportes_fotos').upload(filePath, foto);

    if (uploadError) throw uploadError;

    const imageUrl = `${supabaseUrl}/storage/v1/object/public/${uploadData.fullPath}`;

    // Insertar en tabla reportes_in_situ
    const { data, error } = await supabaseClient.from('reportes_in_situ').insert([
      {
        plotid,
        clase_verificada: clase,
        fecha_verificacion: fecha,
        tecnico,
        provincia,
        altitud,
        foto_url: imageUrl
      }
    ]);

    if (error) throw error;

    alert('¡Reporte guardado correctamente!');
    form.reset();
  } catch (err) {
    console.error('Error al guardar el reporte:', err);
    alert('Hubo un error al guardar el reporte. Revisa la consola.');
  }
});
