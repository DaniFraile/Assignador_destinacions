// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[path = "../../core/rust/asignador.rs"]
mod asignador;

use asignador::{asignar_plazas_rust, Candidato, ReglaCupo, ResultadoAsignacion};
use std::collections::HashMap;

#[tauri::command]
fn ejecutar_asignacion(
    total_plazas: usize,
    candidatos: Vec<Candidato>,
    reglas_sexo: HashMap<String, ReglaCupo>,
    reglas_cuerpo: HashMap<String, ReglaCupo>,
) -> ResultadoAsignacion {
    asignar_plazas_rust(total_plazas, candidatos, reglas_sexo, reglas_cuerpo)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![ejecutar_asignacion])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
