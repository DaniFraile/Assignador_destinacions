// Cliente Frontend dual para Tauri (invocación Rust) o Backend Django (API HTTP)
const invoke = window.__TAURI__ ? window.__TAURI__.invoke : null;

const candidatosEjemplo = [
  { id: "1", nombre: "Marc Soler", sexo: "H", cuerpo: "MOSSOS" },
  { id: "2", nombre: "Jordi Puig", sexo: "H", cuerpo: "MOSSOS" },
  { id: "3", nombre: "David Gomez", sexo: "H", cuerpo: "PL" },
  { id: "4", nombre: "Laura Mas", sexo: "M", cuerpo: "MOSSOS" },
  { id: "5", nombre: "Nuria Bosch", sexo: "M", cuerpo: "PL" },
  { id: "6", nombre: "Albert Vidal", sexo: "H", cuerpo: "PL" }
];

document.getElementById('btnAsignar').addEventListener('click', async () => {
  const plazas = parseInt(document.getElementById('plazas').value, 10);
  const modo = document.getElementById('modo').value;

  let resultado = null;

  try {
    if (modo === 'rust' && invoke) {
      // Invocación nativa Tauri Rust
      resultado = await invoke('ejecutar_asignacion', {
        totalPlazas: plazas,
        candidatos: candidatosEjemplo,
        reglasSexo: {},
        reglasCuerpo: {}
      });
    } else {
      // Petición al Backend Django
      const res = await fetch('http://localhost:8000/api/asignar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plazas: plazas,
          candidatos: candidatosEjemplo
        })
      });
      resultado = await res.json();
    }

    mostrarResultado(resultado);
  } catch (err) {
    alert("Error al ejecutar la asignación: " + err);
  }
});

function mostrarResultado(data) {
  document.getElementById('resultadoCard').style.display = 'block';
  document.getElementById('resCubiertas').innerText = `${data.plazas_cubiertas} / ${data.total_plazas_ofertadas}`;
  
  const sexo = data.resumen_sexo ? data.resumen_sexo.conteo : data.conteo_sexo;
  const cuerpo = data.resumen_cuerpo ? data.resumen_cuerpo.conteo : data.conteo_cuerpo;

  document.getElementById('resSexo').innerText = `M: ${sexo.M || 0} | H: ${sexo.H || 0}`;
  document.getElementById('resCuerpo').innerText = `Mossos: ${cuerpo.MOSSOS || 0} | PL: ${cuerpo.PL || 0}`;

  const lista = document.getElementById('listaAsignados');
  lista.innerHTML = '';
  (data.asignados || []).forEach(cand => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${cand.nombre}</strong> (${cand.sexo} - ${cand.cuerpo}) <br><small style="color: #94a3b8">${cand.motivo_asignacion || ''}</small>`;
    lista.appendChild(li);
  });
}
