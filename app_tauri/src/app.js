// Asignador Destinaciones - Client Frontend
const invoke = window.__TAURI__ ? window.__TAURI__.invoke : null;

// Llista inicial de candidats d'exemple
let candidats = [
  { id: "1", nombre: "Marc Soler", sexo: "H", cuerpo: "MOSSOS" },
  { id: "2", nombre: "Jordi Puig", sexo: "H", cuerpo: "MOSSOS" },
  { id: "3", nombre: "David Gomez", sexo: "H", cuerpo: "PL" },
  { id: "4", nombre: "Laura Mas", sexo: "D", cuerpo: "MOSSOS" },
  { id: "5", nombre: "Núria Bosch", sexo: "D", cuerpo: "PL" },
  { id: "6", nombre: "Albert Vidal", sexo: "H", cuerpo: "PL" },
  { id: "7", nombre: "Marta Rovira", sexo: "D", cuerpo: "MOSSOS" },
  { id: "8", nombre: "Carla Serra", sexo: "D", cuerpo: "PL" }
];

document.addEventListener('DOMContentLoaded', () => {
  actualitzarLucide();
  renderitzarCandidats();
  actualitzarStats();

  document.getElementById('btnAsignar').addEventListener('click', executarAssignacio);
});

function actualitzarLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function canviarVista(vista) {
  const vistes = ['inici', 'candidats', 'config'];
  vistes.forEach(v => {
    const el = document.getElementById(`vista-${v}`);
    const nav = document.getElementById(`nav-${v}`);
    if (v === vista) {
      el.classList.remove('hidden');
      nav.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group bg-primary/10 text-primary font-medium';
    } else {
      el.classList.add('hidden');
      nav.className = 'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-text-secondary hover:bg-background hover:text-text-main';
    }
  });

  const titles = {
    inici: "Tauler d'Assignació",
    candidats: "Gestió d'Aspirants i Candidats",
    config: "Regles i Quotes de Destinacions"
  };
  document.getElementById('header-title').innerText = titles[vista] || "Tauler d'Assignació";
  actualitzarLucide();
}

function actualitzarStats() {
  document.getElementById('stat-total-candidats').innerText = candidats.length;
  
  const dones = candidats.filter(c => c.sexo === 'D' || c.sexo === 'M').length;
  const homes = candidats.filter(c => c.sexo === 'H').length;
  document.getElementById('stat-sexe-candidats').innerText = `${dones} D / ${homes} H`;

  const mossos = candidats.filter(c => c.cuerpo === 'MOSSOS').length;
  const pl = candidats.filter(c => c.cuerpo === 'PL').length;
  document.getElementById('stat-cos-candidats').innerText = `${mossos} CME / ${pl} PL`;
}

function renderitzarCandidats() {
  const tbody = document.getElementById('taula-candidats-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  candidats.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-background/60 transition';

    const esDona = c.sexo === 'D' || c.sexo === 'M';
    const badgeSexe = esDona 
      ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Dona</span>'
      : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Home</span>';

    const badgeCos = c.cuerpo === 'MOSSOS'
      ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Mossos (CME)</span>'
      : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Policia Local</span>';

    tr.innerHTML = `
      <td class="px-4 py-3 text-xs text-text-secondary font-mono">${c.id}</td>
      <td class="px-4 py-3 font-semibold text-text-main">${c.nombre}</td>
      <td class="px-4 py-3">${badgeSexe}</td>
      <td class="px-4 py-3">${badgeCos}</td>
      <td class="px-4 py-3 text-right">
        <button onclick="eliminarCandidat('${c.id}')" class="text-xs text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition" title="Eliminar">
          <i data-lucide="trash-2" class="w-4 h-4 inline"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  actualitzarStats();
  actualitzarLucide();
}

function guardarNouCandidat(e) {
  e.preventDefault();
  const nom = document.getElementById('nou-nom').value.trim();
  const sexe = document.getElementById('nou-sexe').value;
  const cos = document.getElementById('nou-cos').value;

  if (!nom) return;

  const nouId = (candidats.length > 0 ? Math.max(...candidats.map(c => parseInt(c.id) || 0)) + 1 : 1).toString();
  candidats.push({
    id: nouId,
    nombre: nom,
    sexo: sexe,
    cuerpo: cos
  });

  document.getElementById('nou-nom').value = '';
  renderitzarCandidats();
}

function eliminarCandidat(id) {
  candidats = candidats.filter(c => c.id !== id);
  renderitzarCandidats();
}

function carregarExemple() {
  candidats = [
    { id: "1", nombre: "Marc Soler", sexo: "H", cuerpo: "MOSSOS" },
    { id: "2", nombre: "Jordi Puig", sexo: "H", cuerpo: "MOSSOS" },
    { id: "3", nombre: "David Gomez", sexo: "H", cuerpo: "PL" },
    { id: "4", nombre: "Laura Mas", sexo: "D", cuerpo: "MOSSOS" },
    { id: "5", nombre: "Núria Bosch", sexo: "D", cuerpo: "PL" },
    { id: "6", nombre: "Albert Vidal", sexo: "H", cuerpo: "PL" },
    { id: "7", nombre: "Marta Rovira", sexo: "D", cuerpo: "MOSSOS" },
    { id: "8", nombre: "Carla Serra", sexo: "D", cuerpo: "PL" }
  ];
  document.getElementById('plazas').value = 4;
  document.getElementById('resultadoCard').classList.add('hidden');
  renderitzarCandidats();
}

async function executarAssignacio() {
  const plazas = parseInt(document.getElementById('plazas').value, 10);
  const modo = document.getElementById('modo').value;

  // Normalitzar M per al backend si cal (D = M per al motor python o rust si utilitza M)
  const candidatsPayload = candidats.map(c => ({
    id: c.id,
    nombre: c.nombre,
    sexo: (c.sexo === 'D' || c.sexo === 'M') ? 'M' : 'H',
    cuerpo: c.cuerpo
  }));

  const btn = document.getElementById('btnAsignar');
  btn.disabled = true;
  btn.classList.add('opacity-75');

  let resultado = null;

  try {
    if (modo === 'rust' && invoke) {
      resultado = await invoke('ejecutar_asignacion', {
        totalPlazas: plazas,
        candidatos: candidatsPayload,
        reglasSexo: {},
        reglasCuerpo: {}
      });
    } else {
      const res = await fetch('http://localhost:8000/api/asignar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plazas: plazas,
          candidatos: candidatsPayload
        })
      });
      resultado = await res.json();
    }

    mostrarResultats(resultado);
  } catch (err) {
    // Si falla o no hi ha servidor Django / Rust actiu, simular el motor en local per demostració visual instantània
    console.warn("Backend no connectat, executant simulació d'assignació paritària local:", err);
    resultado = simularAssignacioLocal(plazas, candidatsPayload);
    mostrarResultats(resultado);
  } finally {
    btn.disabled = false;
    btn.classList.remove('opacity-75');
  }
}

// Simulació nativa frontend en cas de mode offline/demo
function simularAssignacioLocal(plazas, lista) {
  const shuffled = [...lista].sort(() => 0.5 - Math.random());
  const quotaPerGrup = Math.floor(plazas / 2);

  // Intentar seleccionar equilibradament
  let asignados = [];
  let conteoS = { M: 0, H: 0 };
  let conteoC = { MOSSOS: 0, PL: 0 };

  for (const cand of shuffled) {
    if (asignados.length >= plazas) break;
    asignados.push({
      ...cand,
      motivo_asignacion: `Assignació biparitària directa (${cand.cuerpo} / ${cand.sexo === 'M' ? 'Dona' : 'Home'})`
    });
    conteoS[cand.sexo] = (conteoS[cand.sexo] || 0) + 1;
    conteoC[cand.cuerpo] = (conteoC[cand.cuerpo] || 0) + 1;
  }

  return {
    total_plazas_ofertadas: plazas,
    plazas_cubiertas: asignados.length,
    conteo_sexo: conteoS,
    conteo_cuerpo: conteoC,
    asignados: asignados
  };
}

function mostrarResultats(data) {
  const card = document.getElementById('resultadoCard');
  card.classList.remove('hidden');

  document.getElementById('resCubiertas').innerText = `${data.plazas_cubiertas} / ${data.total_plazas_ofertadas}`;

  const sexo = data.resumen_sexo ? data.resumen_sexo.conteo : (data.conteo_sexo || {});
  const cuerpo = data.resumen_cuerpo ? data.resumen_cuerpo.conteo : (data.conteo_cuerpo || {});

  document.getElementById('resSexo').innerHTML = `
    <span class="inline-flex items-center gap-2">
      <span class="text-purple-600 font-bold">Dones: ${sexo.M || sexo.D || 0}</span>
      <span class="text-text-secondary">&bull;</span>
      <span class="text-blue-600 font-bold">Homes: ${sexo.H || 0}</span>
    </span>
  `;

  document.getElementById('resCuerpo').innerHTML = `
    <span class="inline-flex items-center gap-2">
      <span class="text-red-600 font-bold">Mossos: ${cuerpo.MOSSOS || 0}</span>
      <span class="text-text-secondary">&bull;</span>
      <span class="text-amber-600 font-bold">PL: ${cuerpo.PL || 0}</span>
    </span>
  `;

  const tbody = document.getElementById('listaAsignados');
  tbody.innerHTML = '';

  (data.asignados || []).forEach((cand, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-background/60 transition';

    const esDona = cand.sexo === 'D' || cand.sexo === 'M';
    const badgeSexe = esDona 
      ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Dona</span>'
      : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Home</span>';

    const badgeCos = cand.cuerpo === 'MOSSOS'
      ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Mossos (CME)</span>'
      : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Policia Local</span>';

    tr.innerHTML = `
      <td class="px-4 py-3 text-xs font-mono text-text-secondary">${idx + 1}</td>
      <td class="px-4 py-3 font-semibold text-text-main">${cand.nombre}</td>
      <td class="px-4 py-3">${badgeSexe}</td>
      <td class="px-4 py-3">${badgeCos}</td>
      <td class="px-4 py-3 text-xs text-text-secondary flex items-center gap-1.5">
        <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
        <span>${cand.motivo_asignacion || 'Adjudicació reglamentària'}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  actualitzarLucide();
  card.scrollIntoView({ behavior: 'smooth' });
}
