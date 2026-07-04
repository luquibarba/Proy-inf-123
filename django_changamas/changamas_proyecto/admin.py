from django.contrib import admin
from .models import Usuario, PerfilWorker, PerfilClient, ProyectoWorker, Resena, Publicacion, Solicitud, Chat, Mensaje, Valoracion

admin.site.register(Valoracion)
admin.site.register(Usuario)
admin.site.register(PerfilWorker)
admin.site.register(PerfilClient)
admin.site.register(ProyectoWorker)
admin.site.register(Resena)
admin.site.register(Publicacion)
admin.site.register(Solicitud)
admin.site.register(Chat)
admin.site.register(Mensaje)