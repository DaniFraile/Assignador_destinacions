from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import asignador  # Importado directamente desde core/python

class AsignarPlazasView(APIView):
    """
    Endpoint para ejecutar el sorteo biparitario.
    Acepta un JSON con:
    {
      "plazas": 4,
      "candidatos": [
        {"id": "1", "nombre": "Marc", "sexo": "H", "cuerpo": "MOSSOS"}, ...
      ],
      "reglas_sexo": {"M": {"min": 40, "min_pct": true}},
      "reglas_cuerpo": {"MOSSOS": {"max": 50, "max_pct": true}}
    }
    """
    def post(self, request):
        plazas = request.data.get('plazas')
        candidatos = request.data.get('candidatos', [])
        reglas_sexo = request.data.get('reglas_sexo')
        reglas_cuerpo = request.data.get('reglas_cuerpo')
        semilla = request.data.get('semilla')

        if not plazas or not isinstance(plazas, int):
            return Response(
                {"error": "El campo 'plazas' es obligatorio y debe ser un entero."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(candidatos, list):
            return Response(
                {"error": "El campo 'candidatos' debe ser una lista."},
                status=status.HTTP_400_BAD_REQUEST
            )

        resultado = asignador.asignar_plazas_biparitaria(
            total_plazas=plazas,
            candidatos=candidatos,
            reglas_sexo=reglas_sexo,
            reglas_cuerpo=reglas_cuerpo,
            semilla=semilla
        )

        return Response(resultado, status=status.HTTP_200_OK)
