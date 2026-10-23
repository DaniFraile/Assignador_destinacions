from django.urls import path
from .views import AsignarPlazasView

urlpatterns = [
    path('asignar/', AsignarPlazasView.as_view(), name='api-asignar-plazas'),
]
