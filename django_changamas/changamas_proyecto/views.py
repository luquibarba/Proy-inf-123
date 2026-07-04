from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Usuario, Chat, Mensaje, PerfilWorker, PerfilClient, ProyectoWorker, Publicacion, Solicitud, Valoracion


# ====================
# REGISTER
# ====================
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data

    if Usuario.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'El email ya está registrado'}, status=400)

    if Usuario.objects.filter(dni=data.get('dni')).exists():
        return Response({'error': 'El DNI ya está registrado'}, status=400)

    user = Usuario.objects.create_user(
        username=data.get('email'),
        email=data.get('email'),
        password=data.get('password'),
        first_name=data.get('nombre'),
        last_name=data.get('apellido'),
        genero=data.get('genero'),
        fecha_nac=data.get('fecha_nac'),
        dni=data.get('dni'),
        provincia=data.get('provincia'),
        calle=data.get('calle'),
        numero=data.get('numero'),
        rol=data.get('rol'),
    )

    if user.rol == 'worker':
        PerfilWorker.objects.create(usuario=user)
    else:
        PerfilClient.objects.create(usuario=user)

    refresh = RefreshToken.for_user(user)

    return Response({
        'mensaje': 'Usuario registrado correctamente',
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'rol': user.rol,
        'nombre': user.first_name,
        'apellido': user.last_name,
    }, status=201)


# ====================
# LOGIN
# ====================
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(request, username=email, password=password)

    if user is None:
        return Response({'error': 'Email o contraseña incorrectos'}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'rol': user.rol,
        'nombre': user.first_name,
        'apellido': user.last_name,
    })


# ====================
# LISTA DE CHATS
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_chats(request):
    usuario = request.user

    if usuario.rol == 'worker':
        chats = Chat.objects.filter(worker=usuario)
    else:
        chats = Chat.objects.filter(client=usuario)

    data = []
    for chat in chats:
        otro_usuario = chat.client if usuario.rol == 'worker' else chat.worker
        ultimo_mensaje = chat.mensajes.order_by('-enviado_en').first()

        data.append({
            'id': chat.id,
            'otro_usuario_id': otro_usuario.id,
            'name': f"{otro_usuario.first_name} {otro_usuario.last_name}",
            'lastMessage': ultimo_mensaje.texto if ultimo_mensaje else 'Sin mensajes',
            'time': ultimo_mensaje.enviado_en.strftime('%H:%M') if ultimo_mensaje else '',
            'unread': chat.mensajes.filter(leido=False).exclude(emisor=usuario).count(),
            'online': False,
        })

    return Response(data)


# ====================
# MENSAJES DE UN CHAT
# ====================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def mensajes_chat(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id)
    except Chat.DoesNotExist:
        return Response({'error': 'Chat no encontrado'}, status=404)

    if request.method == 'GET':
        mensajes = chat.mensajes.order_by('enviado_en')
        data = [{
            'id': m.id,
            'senderId': m.emisor.id,
            'content': m.texto,
            'time': m.enviado_en.strftime('%H:%M'),
        } for m in mensajes]

        chat.mensajes.filter(leido=False).exclude(emisor=request.user).update(leido=True)

        return Response({
            'mensajes': data,
            'mi_id': request.user.id,
            'mi_rol': request.user.rol,
            'nombre_otro': f"{chat.client.first_name}" if request.user.rol == 'worker' else f"{chat.worker.first_name}",
            'otro_id': chat.client.id if request.user.rol == 'worker' else chat.worker.id,
            'worker_completo': chat.worker_completo,
            'client_completo': chat.client_completo,
            'publicacion_estado': chat.publicacion.estado,
            'publicacion_titulo': chat.publicacion.titulo,
        })

    if request.method == 'POST':
        texto = request.data.get('texto')
        if not texto:
            return Response({'error': 'El mensaje no puede estar vacío'}, status=400)

        mensaje = Mensaje.objects.create(
            chat=chat,
            emisor=request.user,
            texto=texto,
        )

        return Response({
            'id': mensaje.id,
            'senderId': mensaje.emisor.id,
            'content': mensaje.texto,
            'time': mensaje.enviado_en.strftime('%H:%M'),
        }, status=201)


# ====================
# PERFIL WORKER
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_worker(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        perfil = PerfilWorker.objects.get(usuario=usuario)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    except PerfilWorker.DoesNotExist:
        return Response({'error': 'Perfil no encontrado'}, status=404)

    return Response({
        'id': perfil.id,
        'nombre': usuario.first_name,
        'apellido': usuario.last_name,
        'foto': request.build_absolute_uri(perfil.foto.url) if perfil.foto else None,
        'descripcion': perfil.descripcion,
        'categorias': perfil.categorias,
        'precio_hora': str(perfil.precio_hora) if perfil.precio_hora else None,
        'zona': perfil.zona,
        'radio_km': perfil.radio_km,
        'disponibilidad': perfil.disponibilidad,
        'calificacion': str(perfil.calificacion),
        'cantidad_trabajos': perfil.cantidad_trabajos,
        'verificado': perfil.verificado,
        'en_linea': perfil.en_linea,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def editar_perfil_worker(request):
    try:
        perfil, created = PerfilWorker.objects.get_or_create(usuario=request.user)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

    data = request.data

    if 'descripcion' in data:
        perfil.descripcion = data['descripcion']
    if 'categorias' in data:
        perfil.categorias = data['categorias']
    if 'precio_hora' in data:
        perfil.precio_hora = data['precio_hora']
    if 'zona' in data:
        perfil.zona = data['zona']
    if 'radio_km' in data:
        perfil.radio_km = data['radio_km']
    if 'disponibilidad' in data:
        perfil.disponibilidad = data['disponibilidad']
    if 'foto' in request.FILES:
        perfil.foto = request.FILES['foto']

    perfil.save()

    return Response({'mensaje': 'Perfil actualizado correctamente'})


from .models import PerfilWorker, ProyectoWorker

# ====================
# PERFIL WORKER PROPIO
# ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def perfil_worker_propio(request):
    perfil, created = PerfilWorker.objects.get_or_create(usuario=request.user)
    
    if request.method == 'GET':
        proyectos = [{
            'id': p.id,
            'archivo': request.build_absolute_uri(p.archivo.url),
            'descripcion': p.descripcion,
        } for p in perfil.proyectos.all()]

        return Response({
            'usuario_id': request.user.id,
            'id': perfil.id,
            'nombre': request.user.first_name,
            'apellido': request.user.last_name,
            'provincia': request.user.provincia,
            'foto': request.build_absolute_uri(perfil.foto.url) if perfil.foto else None,
            'descripcion': perfil.descripcion,
            'categorias': perfil.categorias,
            'precio_hora': str(perfil.precio_hora) if perfil.precio_hora else None,
            'zona': perfil.zona,
            'radio_km': perfil.radio_km,
            'disponibilidad': perfil.disponibilidad,
            'calificacion': str(perfil.calificacion),
            'cantidad_trabajos': perfil.cantidad_trabajos,
            'verificado': perfil.verificado,
            'en_linea': perfil.en_linea,
            'proyectos': proyectos,
        })

    if request.method == 'PUT':
        if 'descripcion' in request.data:
            perfil.descripcion = request.data['descripcion']
        if 'categorias' in request.data:
            import json
            perfil.categorias = json.loads(request.data['categorias'])
        if 'precio_hora' in request.data:
            perfil.precio_hora = request.data['precio_hora']
        if 'zona' in request.data:
            perfil.zona = request.data['zona']
        if 'radio_km' in request.data:
            perfil.radio_km = request.data['radio_km']
        if 'disponibilidad' in request.data:
            import json
            perfil.disponibilidad = json.loads(request.data['disponibilidad'])
        if 'foto' in request.FILES:
            perfil.foto = request.FILES['foto']

        perfil.save()
        return Response({'mensaje': 'Perfil actualizado correctamente'})


# ====================
# PROYECTOS WORKER
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def proyectos_worker(request):
    perfil, created = PerfilWorker.objects.get_or_create(usuario=request.user)

    archivo = request.FILES.get('archivo')
    if not archivo:
        return Response({'error': 'No se envió archivo'}, status=400)

    proyecto = ProyectoWorker.objects.create(
        worker=perfil,
        archivo=archivo,
        descripcion=request.data.get('descripcion', ''),
    )

    return Response({
        'id': proyecto.id,
        'archivo': request.build_absolute_uri(proyecto.archivo.url),
        'descripcion': proyecto.descripcion,
    }, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_proyecto(request, proyecto_id):
    try:
        proyecto = ProyectoWorker.objects.get(id=proyecto_id, worker__usuario=request.user)
        proyecto.delete()
        return Response({'mensaje': 'Proyecto eliminado'})
    except ProyectoWorker.DoesNotExist:
        return Response({'error': 'Proyecto no encontrado'}, status=404)


# ====================
# PERFIL CLIENT
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_client(request):
    try:
        perfil = request.user.perfil_client
    except PerfilClient.DoesNotExist:
        perfil = PerfilClient.objects.create(usuario=request.user)

    foto_url = request.build_absolute_uri(perfil.foto.url) if perfil.foto else None

    return Response({
        'nombre': request.user.first_name,
        'apellido': request.user.last_name,
        'email': request.user.email,
        'provincia': request.user.provincia,
        'foto': foto_url,
        'zona': perfil.zona,
        'calificacion': str(perfil.calificacion),
    })

# ====================
# PERFIL CLIENT PROPIO
# ====================
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def perfil_client_propio(request):
    perfil, created = PerfilClient.objects.get_or_create(usuario=request.user)

    if request.method == 'GET':
        publicaciones = request.user.publicaciones.order_by('-creada_en')[:5]
        pubs_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'categoria': p.categoria,
            'estado': p.estado,
            'creada_en': p.creada_en.strftime('%d/%m/%Y'),
        } for p in publicaciones]

        return Response({
            'usuario_id': request.user.id,
            'nombre': request.user.first_name,
            'apellido': request.user.last_name,
            'provincia': request.user.provincia,
            'foto': request.build_absolute_uri(perfil.foto.url) if perfil.foto else None,
            'zona': perfil.zona or request.user.provincia,
            'calificacion': str(perfil.calificacion),
            'publicaciones': pubs_data,
        })

    if request.method == 'PUT':
        if 'zona' in request.data:
            perfil.zona = request.data['zona']
        if 'foto' in request.FILES:
            perfil.foto = request.FILES['foto']
        perfil.save()
        return Response({'mensaje': 'Perfil actualizado correctamente'})


# ====================
# RESEÑAS CLIENT
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resenas_client(request, usuario_id):
    valoraciones = Valoracion.objects.filter(
        receptor__id=usuario_id,
        receptor__rol='client'
    ).order_by('-creada_en')

    data = [{
        'id': v.id,
        'calificacion': round((v.atencion + v.trabajo + v.hospitalidad) / 3, 1),
        'comentario': v.comentario,
        'worker_nombre': f"{v.emisor.first_name} {v.emisor.last_name}",
        'worker_foto': request.build_absolute_uri(v.emisor.perfil_worker.foto.url) if hasattr(v.emisor, 'perfil_worker') and v.emisor.perfil_worker.foto else None,
        'creada_en': v.creada_en.strftime('%d/%m/%Y'),
        'atencion': v.atencion,
        'trabajo': v.trabajo,
        'hospitalidad': v.hospitalidad,
    } for v in valoraciones]

    return Response(data)
# ====================
# PUBLICACIONES — CLIENTE
# GET: sus publicaciones + solicitudes aceptadas de la más reciente
# POST: crear publicación
# ====================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def publicaciones_cliente(request):
    if request.method == 'GET':
        publicaciones = Publicacion.objects.filter(cliente=request.user).order_by('-creada_en')

        data = []
        for pub in publicaciones:
            archivo_url = request.build_absolute_uri(pub.archivo.url) if pub.archivo else None
            data.append({
                'id': pub.id,
                'titulo': pub.titulo,
                'descripcion': pub.descripcion,
                'categoria': pub.categoria,
                'provincia': pub.provincia,
                'archivo': archivo_url,
                'estado': pub.estado,
                'creada_en': pub.creada_en.strftime('%d/%m/%Y'),
            })

        # Solicitudes de TODAS las publicaciones
        solicitudes_data = []

        solicitudes = Solicitud.objects.filter(
            publicacion__in=publicaciones,
            estado='pendiente'
        ).select_related('worker', 'publicacion')

        for sol in solicitudes:
            try:
                perfil = sol.worker.perfil_worker
                foto_url = request.build_absolute_uri(perfil.foto.url) if perfil.foto else None
                precio = str(perfil.precio_hora) if perfil.precio_hora else None
                calificacion = str(perfil.calificacion)
                zona = perfil.zona
            except PerfilWorker.DoesNotExist:
                foto_url = None
                precio = None
                calificacion = '0'
                zona = ''

            # ← esto debe estar FUERA del except, al mismo nivel que el try
            solicitudes_data.append({
                'id': sol.id,
                'worker_id': sol.worker.id,
                'worker_nombre': f"{sol.worker.first_name} {sol.worker.last_name}",
                'worker_foto': foto_url,
                'worker_precio': precio,
                'worker_calificacion': calificacion,
                'worker_zona': zona,
                'mensaje': sol.mensaje,
                'precio_presupuesto': str(sol.precio_presupuesto) if sol.precio_presupuesto else None,
                'tiempo_estimado': sol.tiempo_estimado,
                'detalle': sol.detalle,
                'publicacion_id': sol.publicacion.id,
                'publicacion_titulo': sol.publicacion.titulo,
            })

        return Response({
            'publicaciones': data,
            'solicitudes_recibidas': solicitudes_data,
        })

    if request.method == 'POST':
        titulo = request.data.get('titulo', '')
        descripcion = request.data.get('descripcion', '')
        categoria = request.data.get('categoria', '')
        provincia = request.user.provincia
        archivo = request.FILES.get('archivo')

        if not titulo or not descripcion or not categoria:
            return Response({'error': 'Título, descripción y categoría son obligatorios'}, status=400)

        pub = Publicacion.objects.create(
            cliente=request.user,
            titulo=titulo,
            descripcion=descripcion,
            categoria=categoria,
            provincia=provincia,
            archivo=archivo,
        )

        return Response({
            'id': pub.id,
            'titulo': pub.titulo,
            'categoria': pub.categoria,
            'estado': pub.estado,
            'creada_en': pub.creada_en.strftime('%d/%m/%Y'),
        }, status=201)


# ====================
# PUBLICACIONES — WORKER
# GET: publicaciones filtradas por sus categorías
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def publicaciones_worker(request):
    try:
        perfil = request.user.perfil_worker
        categorias = perfil.categorias
    except PerfilWorker.DoesNotExist:
        categorias = []

    categorias_lower = [c.lower() for c in categorias]

    if categorias_lower:
        publicaciones = Publicacion.objects.filter(
            categoria__in=categorias_lower,
            estado='pendiente'
        ).order_by('-creada_en')
    else:
        publicaciones = Publicacion.objects.filter(estado='pendiente').order_by('-creada_en')

    ya_enviadas = set(
        Solicitud.objects.filter(worker=request.user).values_list('publicacion_id', flat=True)
    )

    data = []
    for pub in publicaciones:
        archivo_url = request.build_absolute_uri(pub.archivo.url) if pub.archivo else None
        cant_presupuestos = Solicitud.objects.filter(publicacion=pub).count()
        data.append({
            'id': pub.id,
            'cliente_id': pub.cliente.id,
            'titulo': pub.titulo,
            'descripcion': pub.descripcion,
            'categoria': pub.categoria,
            'provincia': pub.provincia,
            'archivo': archivo_url,
            'estado': pub.estado,
            'creada_en': pub.creada_en.strftime('%d/%m/%Y'),
            'cliente_nombre': f"{pub.cliente.first_name} {pub.cliente.last_name}",
            'ya_enviada': pub.id in ya_enviadas,
            'cant_presupuestos': cant_presupuestos,
        })

    # Trabajos aceptados (chats donde el worker participa)
    chats = Chat.objects.filter(worker=request.user).select_related('publicacion', 'client')
    trabajos_aceptados = [{
        'chat_id': chat.id,
        'titulo': chat.publicacion.titulo,
        'cliente_nombre': f"{chat.client.first_name} {chat.client.last_name}",
        'cliente_id': chat.client.id,
        'estado': chat.publicacion.estado,
    } for chat in chats]

    return Response({
        'publicaciones': data,
        'trabajos_aceptados': trabajos_aceptados,
    })


# ====================
# ENVIAR PRESUPUESTO — WORKER
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def aceptar_publicacion(request, pub_id):
    try:
        publicacion = Publicacion.objects.get(id=pub_id, estado='pendiente')
    except Publicacion.DoesNotExist:
        return Response({'error': 'Publicación no encontrada o no disponible'}, status=404)

    if Solicitud.objects.filter(publicacion=publicacion, worker=request.user).exists():
        return Response({'error': 'Ya enviaste un presupuesto para este trabajo'}, status=400)

    precio = request.data.get('precio_presupuesto')
    tiempo = request.data.get('tiempo_estimado', '')
    detalle = request.data.get('detalle', '')
    mensaje = request.data.get('mensaje', '')

    if not precio:
        return Response({'error': 'El precio es obligatorio'}, status=400)

    solicitud = Solicitud.objects.create(
        publicacion=publicacion,
        worker=request.user,
        mensaje=mensaje,
        precio_presupuesto=precio,
        tiempo_estimado=tiempo,
        detalle=detalle,
        estado='pendiente',
    )

    return Response({'mensaje': 'Presupuesto enviado al cliente', 'solicitud_id': solicitud.id}, status=201)


# ====================
# ACEPTAR PRESUPUESTO — CLIENTE
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def elegir_worker(request, solicitud_id):
    try:
        solicitud = Solicitud.objects.get(id=solicitud_id, publicacion__cliente=request.user)
    except Solicitud.DoesNotExist:
        return Response({'error': 'Solicitud no encontrada'}, status=404)

    accion = request.data.get('accion')

    if accion == 'rechazar':
        solicitud.estado = 'rechazada'
        solicitud.save()
        return Response({'mensaje': 'Solicitud rechazada'})

    if accion == 'aceptar':
        publicacion = solicitud.publicacion

        # Buscar chat existente entre el mismo worker y cliente
        chat_existente = Chat.objects.filter(
            worker=solicitud.worker,
            client=request.user
        ).first()

        if chat_existente:
            # Resetear estado de completado para el nuevo trabajo
            chat_existente.worker_completo = False
            chat_existente.client_completo = False
            chat_existente.publicacion = publicacion  # ← actualizar la publicación activa
            chat_existente.save()

            Mensaje.objects.create(
                chat=chat_existente,
                emisor=request.user,
                texto=f'Acepté tu solicitud para realizar el trabajo de "{publicacion.titulo}"',
            )
            solicitud.estado = 'aceptada'
            solicitud.save()
            publicacion.estado = 'en_proceso'
            publicacion.save()
            return Response({'chat_id': chat_existente.id})

        # Crear chat nuevo
        chat = Chat.objects.create(
            publicacion=publicacion,
            worker=solicitud.worker,
            client=request.user,
        )

        # Mensaje automático
        Mensaje.objects.create(
            chat=chat,
            emisor=request.user,
            texto=f'Acepté tu solicitud para realizar el trabajo de "{publicacion.titulo}"',
        )

        solicitud.estado = 'aceptada'
        solicitud.save()
        publicacion.estado = 'en_proceso'
        publicacion.save()

        return Response({'chat_id': chat.id}, status=201)

    return Response({'error': 'Acción inválida'}, status=400)
# ====================
# RESEÑAS
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resenas_worker(request, usuario_id):
    valoraciones = Valoracion.objects.filter(
        receptor__id=usuario_id,
        receptor__rol='worker'
    ).order_by('-creada_en')

    data = [{
        'id': v.id,
        'calificacion': round((v.atencion + v.trabajo + v.hospitalidad) / 3, 1),
        'comentario': v.comentario,
        'cliente_nombre': f"{v.emisor.first_name} {v.emisor.last_name}",
        'cliente_foto': request.build_absolute_uri(v.emisor.perfil_client.foto.url) if hasattr(v.emisor, 'perfil_client') and v.emisor.perfil_client.foto else None,
        'creada_en': v.creada_en.strftime('%d/%m/%Y'),
        'atencion': v.atencion,
        'trabajo': v.trabajo,
        'hospitalidad': v.hospitalidad,
    } for v in valoraciones]

    return Response(data)
# ====================
# PERFIL PÚBLICO DE USUARIO
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resenas_client(request, usuario_id):
    valoraciones = Valoracion.objects.filter(
        receptor__id=usuario_id,
        receptor__rol='client'
    ).order_by('-creada_en')

    data = [{
        'id': v.id,
        'calificacion': round((v.atencion + v.trabajo + v.hospitalidad) / 3, 1),
        'comentario': v.comentario,
        'worker_nombre': f"{v.emisor.first_name} {v.emisor.last_name}",
        'worker_foto': request.build_absolute_uri(v.emisor.perfil_worker.foto.url) if hasattr(v.emisor, 'perfil_worker') and v.emisor.perfil_worker.foto else None,
        'creada_en': v.creada_en.strftime('%d/%m/%Y'),
        'atencion': v.atencion,
        'trabajo': v.trabajo,
        'hospitalidad': v.hospitalidad,
    } for v in valoraciones]

    return Response(data)
@permission_classes([IsAuthenticated])
def perfil_usuario_publico(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
    except Usuario.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)

    if usuario.rol == 'worker':
        try:
            perfil = PerfilWorker.objects.get(usuario=usuario)
        except PerfilWorker.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=404)

        proyectos = [{
            'id': p.id,
            'archivo': request.build_absolute_uri(p.archivo.url),
            'descripcion': p.descripcion,
        } for p in perfil.proyectos.all()]

        resenas = perfil.resenas.order_by('-creada_en')
        resenas_data = [{
            'id': r.id,
            'calificacion': r.calificacion,
            'comentario': r.comentario,
            'cliente_nombre': f"{r.cliente.first_name} {r.cliente.last_name}",
            'cliente_foto': request.build_absolute_uri(r.cliente.perfil_client.foto.url) if hasattr(r.cliente, 'perfil_client') and r.cliente.perfil_client.foto else None,
            'creada_en': r.creada_en.strftime('%d/%m/%Y'),
        } for r in resenas]

        return Response({
            'rol': 'worker',
            'usuario_id': usuario.id,
            'nombre': usuario.first_name,
            'apellido': usuario.last_name,
            'provincia': usuario.provincia,
            'foto': request.build_absolute_uri(perfil.foto.url) if perfil.foto else None,
            'descripcion': perfil.descripcion,
            'categorias': perfil.categorias,
            'precio_hora': str(perfil.precio_hora) if perfil.precio_hora else None,
            'zona': perfil.zona,
            'radio_km': perfil.radio_km,
            'disponibilidad': perfil.disponibilidad,
            'calificacion': str(perfil.calificacion),
            'cantidad_trabajos': perfil.cantidad_trabajos,
            'verificado': perfil.verificado,
            'en_linea': perfil.en_linea,
            'proyectos': proyectos,
            'resenas': resenas_data,
        })

    else:  # client
        try:
            perfil = PerfilClient.objects.get(usuario=usuario)
        except PerfilClient.DoesNotExist:
            return Response({'error': 'Perfil no encontrado'}, status=404)

        publicaciones = usuario.publicaciones.order_by('-creada_en')[:5]
        pubs_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'categoria': p.categoria,
            'estado': p.estado,
            'creada_en': p.creada_en.strftime('%d/%m/%Y'),
        } for p in publicaciones]

        return Response({
            'rol': 'client',
            'usuario_id': usuario.id,
            'nombre': usuario.first_name,
            'apellido': usuario.last_name,
            'provincia': usuario.provincia,
            'foto': request.build_absolute_uri(perfil.foto.url) if perfil.foto else None,
            'zona': perfil.zona,
            'calificacion': str(perfil.calificacion),
            'publicaciones': pubs_data,
            'resenas': [],
        })

# ====================
# EDITAR / ELIMINAR PUBLICACIÓN
# ====================
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gestionar_publicacion(request, pub_id):
    try:
        pub = Publicacion.objects.get(id=pub_id, cliente=request.user)
    except Publicacion.DoesNotExist:
        return Response({'error': 'Publicación no encontrada'}, status=404)

    if request.method == 'PUT':
        if pub.estado in ['en_proceso', 'completada']:
            return Response({'error': 'No podés editar una publicación que ya está en proceso o completada'}, status=400)
        
        if 'titulo' in request.data:
            pub.titulo = request.data['titulo']
        if 'descripcion' in request.data:
            pub.descripcion = request.data['descripcion']
        if 'categoria' in request.data:
            pub.categoria = request.data['categoria']
        if 'archivo' in request.FILES:
            pub.archivo = request.FILES['archivo']
        pub.save()

        return Response({
            'id': pub.id,
            'titulo': pub.titulo,
            'descripcion': pub.descripcion,
            'categoria': pub.categoria,
            'estado': pub.estado,
            'creada_en': pub.creada_en.strftime('%d/%m/%Y'),
        })

    if request.method == 'DELETE':
        pub.delete()
        return Response({'mensaje': 'Publicación eliminada'})

# ====================
# COMPLETAR TRABAJO — WORKER
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def completar_trabajo_worker(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, worker=request.user)
    except Chat.DoesNotExist:
        return Response({'error': 'Chat no encontrado'}, status=404)

    if chat.worker_completo:
        return Response({'error': 'Ya marcaste este trabajo como completado'}, status=400)

    # Valoración del cliente
    atencion = request.data.get('atencion')
    trabajo = request.data.get('trabajo')
    hospitalidad = request.data.get('hospitalidad')
    comentario = request.data.get('comentario', '')

    if not atencion or not trabajo or not hospitalidad:
        return Response({'error': 'Completá todas las valoraciones'}, status=400)

    Valoracion.objects.create(
        chat=chat,
        emisor=request.user,
        receptor=chat.client,
        atencion=atencion,
        trabajo=trabajo,
        hospitalidad=hospitalidad,
        comentario=comentario,
    )

    chat.worker_completo = True
    chat.save()

    return Response({'mensaje': 'Trabajo marcado como completado. Esperando confirmación del cliente.'})


# ====================
# COMPLETAR TRABAJO — CLIENT
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def completar_trabajo_client(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, client=request.user)
    except Chat.DoesNotExist:
        return Response({'error': 'Chat no encontrado'}, status=404)

    if not chat.worker_completo:
        return Response({'error': 'El trabajador aún no marcó el trabajo como completado'}, status=400)

    if chat.client_completo:
        return Response({'error': 'Ya confirmaste la finalización'}, status=400)

    atencion = request.data.get('atencion')
    trabajo = request.data.get('trabajo')
    hospitalidad = request.data.get('hospitalidad')
    comentario = request.data.get('comentario', '')

    if not atencion or not trabajo or not hospitalidad:
        return Response({'error': 'Completá todas las valoraciones'}, status=400)

    Valoracion.objects.create(
        chat=chat,
        emisor=request.user,
        receptor=chat.worker,
        atencion=atencion,
        trabajo=trabajo,
        hospitalidad=hospitalidad,
        comentario=comentario,
    )

    chat.client_completo = True
    chat.save()

    publicacion = chat.publicacion
    publicacion.estado = 'completada'
    publicacion.save()

    # Actualizar contador y calificación del worker
    try:
        perfil_worker = chat.worker.perfil_worker
        perfil_worker.cantidad_trabajos += 1

        valoraciones_worker = Valoracion.objects.filter(receptor=chat.worker)
        if valoraciones_worker.exists():
            promedio = sum(
                (v.atencion + v.trabajo + v.hospitalidad) / 3
                for v in valoraciones_worker
            ) / valoraciones_worker.count()
            perfil_worker.calificacion = round(promedio, 2)

        perfil_worker.save()
    except PerfilWorker.DoesNotExist:
        pass

    # Actualizar calificación del cliente
    try:
        perfil_client = chat.client.perfil_client
        valoraciones_client = Valoracion.objects.filter(receptor=chat.client)
        if valoraciones_client.exists():
            promedio = sum(
                (v.atencion + v.trabajo + v.hospitalidad) / 3
                for v in valoraciones_client
            ) / valoraciones_client.count()
            perfil_client.calificacion = round(promedio, 2)
        perfil_client.save()
    except PerfilClient.DoesNotExist:
        pass

    Mensaje.objects.create(
        chat=chat,
        emisor=request.user,
        texto=f'✅ Trabajo "{publicacion.titulo}" finalizado exitosamente.',
    )

    return Response({'mensaje': 'Trabajo completado exitosamente. ¡Gracias por usar ChangaMas!'})
# ====================
# RECHAZAR FINALIZACIÓN — CLIENT
# ====================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rechazar_finalizacion(request, chat_id):
    try:
        chat = Chat.objects.get(id=chat_id, client=request.user)
    except Chat.DoesNotExist:
        return Response({'error': 'Chat no encontrado'}, status=404)

    if not chat.worker_completo:
        return Response({'error': 'El trabajador aún no marcó el trabajo como completado'}, status=400)

    justificacion = request.data.get('justificacion', '')
    if not justificacion:
        return Response({'error': 'Escribí una justificación'}, status=400)

    # Resetear estado
    chat.worker_completo = False
    chat.save()

    # Mandar mensaje automático al chat
    Mensaje.objects.create(
        chat=chat,
        emisor=request.user,
        texto=f'❌ El cliente indicó que el trabajo no está finalizado: "{justificacion}"',
    )

    return Response({'mensaje': 'Notificación enviada al trabajador'})
# ====================
# WORKERS DESTACADOS
# ====================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workers_destacados(request):
    perfiles = PerfilWorker.objects.order_by('-calificacion')[:4]
    data = [{
        'usuario_id': p.usuario.id,
        'nombre': f"{p.usuario.first_name} {p.usuario.last_name}",
        'foto': request.build_absolute_uri(p.foto.url) if p.foto else None,
        'categorias': p.categorias,
        'zona': p.zona,
        'calificacion': str(p.calificacion),
        'cantidad_trabajos': p.cantidad_trabajos,
        'precio_hora': str(p.precio_hora) if p.precio_hora else None,
    } for p in perfiles]
    return Response(data)