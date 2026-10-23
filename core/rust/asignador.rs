// Implementación nativa del algoritmo de asignación para Rust / Tauri
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Candidato {
    pub id: String,
    pub nombre: String,
    pub sexo: String,     // "M" o "H"
    pub cuerpo: String,   // "MOSSOS" o "PL"
    #[serde(default)]
    pub motivo_asignacion: Option<String>,
    #[serde(default)]
    pub motivo_exclusion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReglaCupo {
    pub min: Option<f64>,
    pub min_pct: Option<bool>,
    pub max: Option<f64>,
    pub max_pct: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResultadoAsignacion {
    pub total_plazas_ofertadas: usize,
    pub plazas_cubiertas: usize,
    pub plazas_desiertas: usize,
    pub conteo_sexo: HashMap<String, usize>,
    pub conteo_cuerpo: HashMap<String, usize>,
    pub asignados: Vec<Candidato>,
    pub no_asignados: Vec<Candidato>,
}

fn resolver_cupo(valor: Option<f64>, es_pct: bool, total_plazas: usize, ceil: bool) -> Option<usize> {
    valor.map(|v| {
        if es_pct {
            let num = (v / 100.0) * (total_plazas as f64);
            if ceil { num.ceil() as usize } else { num.floor() as usize }
        } else {
            v as usize
        }
    })
}

pub fn asignar_plazas_rust(
    total_plazas: usize,
    mut candidatos: Vec<Candidato>,
    reglas_sexo: HashMap<String, ReglaCupo>,
    reglas_cuerpo: HashMap<String, ReglaCupo>,
) -> ResultadoAsignacion {
    // Normalizar datos
    for c in candidatos.iter_mut() {
        let s = c.sexo.trim().to_uppercase();
        if s.starts_with('M') || s.starts_with('F') {
            c.sexo = "M".to_string();
        } else {
            c.sexo = "H".to_string();
        }

        let crp = c.cuerpo.trim().to_uppercase();
        if crp.contains("MOSS") {
            c.cuerpo = "MOSSOS".to_string();
        } else {
            c.cuerpo = "PL".to_string();
        }
    }

    // Organizar por celdas (M, MOSSOS), (M, PL), (H, MOSSOS), (H, PL)
    let mut celdas: HashMap<(String, String), Vec<Candidato>> = HashMap::new();
    for c in candidatos {
        celdas.entry((c.sexo.clone(), c.cuerpo.clone())).or_default().push(c);
    }

    let mut conteo_sexo: HashMap<String, usize> = [("M".to_string(), 0), ("H".to_string(), 0)].into();
    let mut conteo_cuerpo: HashMap<String, usize> = [("MOSSOS".to_string(), 0), ("PL".to_string(), 0)].into();

    let mut asignados: Vec<Candidato> = Vec::new();

    while asignados.len() < total_plazas {
        let mut candidatas_validas = Vec::new();

        for ((s, crp), cola) in celdas.iter() {
            if !cola.is_empty() {
                candidatas_validas.push((s.clone(), crp.clone()));
            }
        }

        if candidatas_validas.is_empty() {
            break;
        }

        // Seleccionar la celda con menor asignación acumulada (para máxima paridad)
        candidatas_validas.sort_by_key(|(s, crp)| {
            conteo_sexo.get(s).unwrap_or(&0) + conteo_cuerpo.get(crp).unwrap_or(&0)
        });

        let (sel_s, sel_crp) = candidatas_validas[0].clone();
        if let Some(cola) = celdas.get_mut(&(sel_s.clone(), sel_crp.clone())) {
            let mut elegido = cola.remove(0);
            elegido.motivo_asignacion = Some(format!("Equilibrio paritario ({} / {})", sel_s, sel_crp));
            *conteo_sexo.entry(sel_s).or_default() += 1;
            *conteo_cuerpo.entry(sel_crp).or_default() += 1;
            asignados.push(elegido);
        }
    }

    let mut no_asignados = Vec::new();
    for ((_, _), cola) in celdas {
        for mut c in cola {
            c.motivo_exclusion = Some("Sin plazas disponibles o límite de cupo alcanzado".to_string());
            no_asignados.push(c);
        }
    }

    let cubiertas = asignados.len();
    ResultadoAsignacion {
        total_plazas_ofertadas: total_plazas,
        plazas_cubiertas: cubiertas,
        plazas_desiertas: total_plazas.saturating_sub(cubiertas),
        conteo_sexo,
        conteo_cuerpo,
        asignados,
        no_asignados,
    }
}
