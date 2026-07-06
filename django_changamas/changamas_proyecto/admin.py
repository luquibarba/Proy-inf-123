from django.contrib import admin
from .models import Usuario, PerfilWorker, PerfilClient, ProyectoWorker, Resena, Publicacion, Solicitud, Chat, Mensaje, Valoracion

class ProyectoWorkerInline(admin.TabularInline):
    model = ProyectoWorker
    extra = 0

class PerfilWorkerAdmin(admin.ModelAdmin):
    inlines = [ProyectoWorkerInline]

admin.site.register(Usuario)
admin.site.register(PerfilWorker, PerfilWorkerAdmin)
admin.site.register(PerfilClient)
admin.site.register(ProyectoWorker)
admin.site.register(Resena)
admin.site.register(Publicacion)
admin.site.register(Solicitud)
admin.site.register(Chat)
admin.site.register(Mensaje)
admin.site.register(Valoracion)