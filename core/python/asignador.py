"""
Core del Asignador Biparitario (Python)
Compatible con Django, CLI, Scripts y microservicios.
"""

import math
import random
from typing import List, Dict, Any, Optional, Tuple


def resolver_cupo(
    valor: Optional[float],
    es_pct: bool,
    total_plazas: int,
    redondeo: str = "round"
) -> Optional[int]:
    """Calcula el número absoluto a partir de un valor entero o porcentaje."""
    if valor is None:
        return None
    if es_pct:
        num = (valor / 100.0) * total_plazas
        if redondeo == "ceil":
            return math.ceil(num)
        elif redondeo == "floor":
            return math.floor(num)
        return round(num)
    return int(valor)


def asignar_plazas_biparitaria(
    total_plazas: int,
    candidatos: List[Dict[str, Any]],
    reglas_sexo: Optional[Dict[str, Dict[str, Any]]] = None,
    reglas_cuerpo: Optional[Dict[str, Dict[str, Any]]] = None,
    semilla: Optional[int] = None
) -> Dict[str, Any]:
    if semilla is not None:
        random.seed(semilla)

    reglas_sexo = reglas_sexo or {}
    reglas_cuerpo = reglas_cuerpo or {}

    celdas: Dict[Tuple[str, str], List[Dict[str, Any]]] = {
        ('M', 'MOSSOS'): [],
        ('M', 'PL'): [],
        ('H', 'MOSSOS'): [],
        ('H', 'PL'): []
    }

    for c in candidatos:
        s = str(c.get('sexo', '')).strip().upper()
        if s in ['M', 'MUJER', 'F', 'FEMENINO']:
            s = 'M'
        elif s in ['H', 'HOMBRE', 'MASCULINO']:
            s = 'H'

        crp = str(c.get('cuerpo', '')).strip().upper()
        if 'MOSS' in crp:
            crp = 'MOSSOS'
        elif 'LOCAL' in crp or 'PL' in crp:
            crp = 'PL'

        clave = (s, crp)
        if clave not in celdas:
            celdas[clave] = []
        celdas[clave].append(dict(c))

    for lista in celdas.values():
        random.shuffle(lista)

    conteo_sexo = {'M': 0, 'H': 0}
    conteo_cuerpo = {'MOSSOS': 0, 'PL': 0}

    limites_sexo = {}
    for s in ['M', 'H']:
        r = reglas_sexo.get(s, {})
        def_min = 50 if (total_plazas % 2 == 0) else None
        min_abs = resolver_cupo(r.get('min', def_min), r.get('min_pct', True), total_plazas, 'ceil') or 0
        max_abs = resolver_cupo(r.get('max'), r.get('max_pct', False), total_plazas, 'floor')
        if max_abs is None:
            max_abs = total_plazas
        limites_sexo[s] = {'min': min_abs, 'max': max_abs}

    limites_cuerpo = {}
    for crp in ['MOSSOS', 'PL']:
        r = reglas_cuerpo.get(crp, {})
        def_min = 50 if (total_plazas % 2 == 0) else None
        min_abs = resolver_cupo(r.get('min', def_min), r.get('min_pct', True), total_plazas, 'ceil') or 0
        max_abs = resolver_cupo(r.get('max'), r.get('max_pct', False), total_plazas, 'floor')
        if max_abs is None:
            max_abs = total_plazas
        limites_cuerpo[crp] = {'min': min_abs, 'max': max_abs}

    asignados: List[Dict[str, Any]] = []

    def es_elegible(s: str, crp: str) -> bool:
        if conteo_sexo.get(s, 0) >= limites_sexo.get(s, {}).get('max', total_plazas):
            return False
        if conteo_cuerpo.get(crp, 0) >= limites_cuerpo.get(crp, {}).get('max', total_plazas):
            return False
        return True

    while len(asignados) < total_plazas:
        celdas_validas = [
            clave for clave, lista in celdas.items()
            if len(lista) > 0 and es_elegible(clave[0], clave[1])
        ]

        if not celdas_validas:
            break

        puntuaciones = []
        for (s, crp) in celdas_validas:
            deficit_score = conteo_sexo.get(s, 0) + conteo_cuerpo.get(crp, 0)

            if conteo_sexo.get(s, 0) < limites_sexo.get(s, {}).get('min', 0):
                deficit_score -= 100
            if conteo_cuerpo.get(crp, 0) < limites_cuerpo.get(crp, {}).get('min', 0):
                deficit_score -= 100

            puntuaciones.append(((s, crp), deficit_score))

        min_score = min(score for _, score in puntuaciones)
        mejores_celdas = [clave for clave, score in puntuaciones if score == min_score]

        celda_elegida = random.choice(mejores_celdas)
        s_elegido, crp_elegido = celda_elegida

        cand = celdas[celda_elegida].pop(0)
        cand['motivo_asignacion'] = f'Equilibrio paritario ({s_elegido} / {crp_elegido})'
        asignados.append(cand)
        conteo_sexo[s_elegido] = conteo_sexo.get(s_elegido, 0) + 1
        conteo_cuerpo[crp_elegido] = conteo_cuerpo.get(crp_elegido, 0) + 1

    no_asignados = []
    for (s, crp), lista in celdas.items():
        for cand in lista:
            cand_copy = dict(cand)
            motivo = 'Sin plazas vacantes o cupo máximo alcanzado'
            cand_copy['motivo_exclusion'] = motivo
            no_asignados.append(cand_copy)

    return {
        'total_plazas_ofertadas': total_plazas,
        'plazas_cubiertas': len(asignados),
        'plazas_desiertas': total_plazas - len(asignados),
        'resumen_sexo': {
            'conteo': conteo_sexo,
            'limites': limites_sexo
        },
        'resumen_cuerpo': {
            'conteo': conteo_cuerpo,
            'limites': limites_cuerpo
        },
        'asignados': asignados,
        'no_asignados': no_asignados
    }
