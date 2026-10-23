# Asignador Destinaciones: Asignación Biparitaria de Plazas (Django + Tauri)

Sistema de asignación de plazas aleatoria con **paridad simultánea en Sexo (50/50) y Cuerpo Policial (50/50 Mossos d'Esquadra y Policía Local)**, con cuotas mínimas y máximas flexibles por número absoluto o porcentaje.

Este repositorio está estructurado para funcionar como un **proyecto dual**:
1. **Backend Web con Django**: API REST y panel web.
2. **Aplicación de Escritorio con Tauri (Rust + Frontend Web)**: Interfaz nativa ligera para escritorio que ejecuta el motor de asignación directamente o conectada al backend.
3. **Core Agnóstico (Python & Rust/JS)**: Algoritmo puro reutilizable en ambos entornos.

---

## 🎯 Reglas del Algoritmo
- **Paridad estricta y par:** En destinos con plazas pares, busca el mismo número de hombres y mujeres, y el mismo número de agentes de Mossos d'Esquadra y Policía Local.
- **Mínimos flexibles con prioridad:** Si de algún colectivo no hay suficientes inscritos o no se apunta nadie:
  - No se bloquean las plazas.
  - Quienes se hayan apuntado de ese colectivo entran con máxima prioridad.
  - Las plazas restantes se liberan y se reparten equitativamente entre los demás.
- **Topes máximos:** Si un colectivo alcanza su límite fijado (por número o %), queda excluido de los siguientes sorteos.
- **Sorteo imparcial:** Selección aleatoria dentro de los grupos deficitarios para mantener la neutralidad.

---

## 📁 Estructura del Repositorio

```text
├── core/                   # Algoritmo puro y modelos de datos agnósticos
│   ├── python/             # Motor en Python reutilizable
│   │   ├── asignador.py
│   │   └── test_asignador.py
│   └── rust/               # Lógica para Tauri en Rust
│       └── asignador.rs
├── backend_django/         # Proyecto Django (API REST + Admin)
│   ├── manage.py
│   ├── backend_django/     # Configuración Django (settings, urls, wsgi)
│   ├── asignaciones/       # App Django: modelos, vistas de asignación, serializadores
│   └── requirements.txt
├── app_tauri/              # Aplicación de escritorio Tauri
│   ├── src-tauri/          # Configuración y código nativo Tauri (Rust)
│   │   ├── Cargo.toml
│   │   ├── tauri.conf.json
│   │   └── src/
│   │       └── main.rs
│   ├── src/                # Frontend web (HTML, JS, CSS)
│   │   ├── index.html
│   │   └── app.js
│   └── package.json
└── README.md
```

---

## 🚀 Puesta en Marcha

### 1. Backend Django
```bash
cd backend_django
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
La API estará disponible en `http://localhost:8000/api/asignar/`.

### 2. Desktop Tauri
```bash
cd app_tauri
npm install
npm run tauri dev
```

---

## 📄 Licencia
MIT
