from django.db import models
from django.contrib.auth.models import AbstractUser

# ====================
# USUARIO BASE
# ====================
class Usuario(AbstractUser):
    ROLES = [
        ('worker', 'Trabajador'),
        ('client', 'Cliente'),
    ]
    GENEROS = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    PROVINCIAS = [
        ('Buenos Aires', 'Buenos Aires'),
        ('CABA', 'CABA'),
        ('Córdoba', 'Córdoba'),
        ('Santa Fe', 'Santa Fe'),
        ('Mendoza', 'Mendoza'),
        ('Tucumán', 'Tucumán'),
        ('Salta', 'Salta'),
        ('Chaco', 'Chaco'),
        ('Misiones', 'Misiones'),
        ('Corrientes', 'Corrientes'),
        ('Entre Ríos', 'Entre Ríos'),
        ('Santiago del Estero', 'Santiago del Estero'),
        ('San Juan', 'San Juan'),
        ('Jujuy', 'Jujuy'),
        ('Río Negro', 'Río Negro'),
        ('Neuquén', 'Neuquén'),
        ('Formosa', 'Formosa'),
        ('Chubut', 'Chubut'),
        ('San Luis', 'San Luis'),
        ('Catamarca', 'Catamarca'),
        ('La Rioja', 'La Rioja'),
        ('La Pampa', 'La Pampa'),
        ('Santa Cruz', 'Santa Cruz'),
        ('Tierra del Fuego', 'Tierra del Fuego'),
    ]

    rol       = models.CharField(max_length=10, choices=ROLES, blank=True, default='')
    genero    = models.CharField(max_length=1, choices=GENEROS, blank=True, default='')
    fecha_nac = models.DateField(null=True, blank=True)
    dni       = models.CharField(max_length=8, unique=True, null=True, blank=True)
    provincia = models.CharField(max_length=50, choices=PROVINCIAS, blank=True, default='')
    calle     = models.CharField(max_length=100, blank=True, default='')
    numero    = models.CharField(max_length=10, blank=True, default='')
    email     = models.EmailField(unique=True)

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['username', 'dni']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.rol})"


# ====================
# PERFIL WORKER
# ====================
class PerfilWorker(models.Model):
    usuario           = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_worker')
    foto              = models.ImageField(upload_to='fotos_worker/', blank=True, null=True)
    descripcion       = models.TextField(blank=True)
    categorias        = models.JSONField(default=list, blank=True)
    precio_hora       = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    zona              = models.CharField(max_length=100, blank=True)
    radio_km          = models.IntegerField(null=True, blank=True)
    disponibilidad    = models.JSONField(default=dict, blank=True)
    calificacion      = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    cantidad_trabajos = models.IntegerField(default=0)
    verificado        = models.BooleanField(default=False)
    en_linea          = models.BooleanField(default=False)
    ultima_vez        = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Worker: {self.usuario.first_name}"


# ====================
# PROYECTO WORKER
# ====================
class ProyectoWorker(models.Model):
    worker      = models.ForeignKey(PerfilWorker, on_delete=models.CASCADE, related_name='proyectos')
    archivo     = models.FileField(upload_to='proyectos_worker/')
    descripcion = models.CharField(max_length=200, blank=True)
    subido_en   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Proyecto de {self.worker.usuario.first_name}"


# ====================
# PERFIL CLIENT
# ====================
class PerfilClient(models.Model):
    usuario      = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name='perfil_client')
    foto         = models.ImageField(upload_to='fotos_client/', blank=True, null=True)
    zona         = models.CharField(max_length=100, blank=True)
    calificacion = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return f"Client: {self.usuario.first_name}"


# ====================
# RESEÑA
# ====================
class Resena(models.Model):
    worker      = models.ForeignKey(PerfilWorker, on_delete=models.CASCADE, related_name='resenas')
    cliente     = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='resenas_dadas')
    calificacion = models.IntegerField()
    comentario  = models.TextField(blank=True)
    creada_en   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reseña de {self.cliente.first_name} para {self.worker.usuario.first_name}"


# ====================
# PUBLICACION
# ====================
class Publicacion(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('en_proceso', 'En proceso'),
        ('completada', 'Completada'),
        ('cancelada', 'Cancelada'),
    ]
    CATEGORIAS = [
        ('plomero', 'Plomero'),
        ('electricista', 'Electricista'),
        ('pintor', 'Pintor'),
        ('carpintero', 'Carpintero'),
        ('albanil', 'Albañil'),
        ('gasista', 'Gasista'),
        ('cerrajero', 'Cerrajero'),
        ('jardinero', 'Jardinero'),
        ('techista', 'Techista'),
        ('otros', 'Otros'),
    ]

    cliente     = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='publicaciones')
    titulo      = models.CharField(max_length=200)
    descripcion = models.TextField()
    categoria   = models.CharField(max_length=100, choices=CATEGORIAS)
    provincia   = models.CharField(max_length=50)
    archivo     = models.FileField(upload_to='publicaciones/', blank=True, null=True)
    estado      = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    creada_en   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo


# ====================
# SOLICITUD
# ====================
class Solicitud(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aceptada', 'Aceptada'),
        ('rechazada', 'Rechazada'),
    ]

    publicacion      = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='solicitudes')
    worker           = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='solicitudes_enviadas')
    mensaje          = models.TextField(blank=True)
    precio_presupuesto = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tiempo_estimado  = models.CharField(max_length=100, blank=True)
    detalle          = models.TextField(blank=True)
    estado           = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    creada_en        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Solicitud de {self.worker.first_name} para {self.publicacion.titulo}"

# ====================
# CHAT
# ====================
class Chat(models.Model):
    publicacion         = models.ForeignKey(Publicacion, on_delete=models.CASCADE, related_name='chats')
    worker              = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='chats_worker')
    client              = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='chats_client')
    creado_en           = models.DateTimeField(auto_now_add=True)
    worker_completo     = models.BooleanField(default=False)
    client_completo     = models.BooleanField(default=False)

    def __str__(self):
        return f"Chat {self.id} - {self.publicacion.titulo}"


# ====================
# MENSAJE
# ====================
class Mensaje(models.Model):
    chat       = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='mensajes')
    emisor     = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    texto      = models.TextField()
    enviado_en = models.DateTimeField(auto_now_add=True)
    leido      = models.BooleanField(default=False)

    def __str__(self):
        return f"Mensaje de {self.emisor.first_name} en chat {self.chat.id}"
    
# ====================
# VALORACION
# ====================
class Valoracion(models.Model):
    chat        = models.ForeignKey('Chat', on_delete=models.CASCADE, related_name='valoraciones')
    emisor      = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='valoraciones_dadas')
    receptor    = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='valoraciones_recibidas')
    atencion    = models.IntegerField()  # 1-5
    trabajo     = models.IntegerField()  # 1-5
    hospitalidad = models.IntegerField() # 1-5
    comentario  = models.TextField(blank=True)
    creada_en   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Valoración de {self.emisor.first_name} a {self.receptor.first_name}"