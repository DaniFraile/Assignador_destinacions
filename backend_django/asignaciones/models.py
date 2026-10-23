from django.db import models

class Convocatoria(models.Model):
    nombre = models.CharField(max_length=200)
    plazas_totales = models.PositiveIntegerField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.plazas_totales} plazas)"

class Candidato(models.Model):
    SEXO_CHOICES = [('H', 'Hombre'), ('M', 'Mujer')]
    CUERPO_CHOICES = [('MOSSOS', "Mossos d'Esquadra"), ('PL', 'Policía Local')]

    convocatoria = models.ForeignKey(Convocatoria, related_name='candidatos', on_delete=models.CASCADE)
    nombre = models.CharField(max_length=150)
    dni = models.CharField(max_length=20, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES)
    cuerpo = models.CharField(max_length=10, choices=CUERPO_CHOICES)

    def __str__(self):
        return f"{self.nombre} ({self.sexo} - {self.cuerpo})"
