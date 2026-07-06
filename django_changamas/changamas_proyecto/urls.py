from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('chats/', views.lista_chats),
    path('chats/<int:chat_id>/mensajes/', views.mensajes_chat),
    path('perfil/worker/propio/', views.perfil_worker_propio),
    path('perfil/worker/', views.perfil_worker_propio),
    path('perfil/worker/<int:usuario_id>/', views.perfil_worker),
    path('perfil/worker/editar/', views.editar_perfil_worker),
    path('perfil/worker/proyectos/', views.proyectos_worker),
    path('perfil/worker/proyectos/<int:proyecto_id>/', views.eliminar_proyecto),
    path('perfil/client/otro/<int:usuario_id>/', views.perfil_client),
    path('publicaciones/cliente/', views.publicaciones_cliente),
    path('publicaciones/worker/', views.publicaciones_worker),
    path('publicaciones/<int:pub_id>/aceptar/', views.aceptar_publicacion),
    path('solicitudes/<int:solicitud_id>/elegir/', views.elegir_worker),
    path('perfil/worker/<int:usuario_id>/resenas/', views.resenas_worker),
    path('perfil/client/', views.perfil_client_propio),
    path('perfil/client/<int:usuario_id>/resenas/', views.resenas_client),
    path('perfil/usuario/<int:usuario_id>/', views.perfil_usuario_publico),
    path('publicaciones/<int:pub_id>/gestionar/', views.gestionar_publicacion),
    path('chats/<int:chat_id>/completar/worker/', views.completar_trabajo_worker),
    path('chats/<int:chat_id>/completar/client/', views.completar_trabajo_client),
    path('chats/<int:chat_id>/rechazar-finalizacion/', views.rechazar_finalizacion),
    path('workers/destacados/', views.workers_destacados),
    path('chats/<int:chat_id>/resumen/', views.resumen_trabajo),
]