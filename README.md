# ChangaMas - Django + React + PostgreSQL

Proyecto full stack con:
- Backend: Django (API REST)
- Frontend: React + Vite
- Base de datos: PostgreSQL

---

## Requisitos previos
- Python 3.10+
- Node.js 18+
- PostgreSQL instalado y corriendo

---

## 1. Clonar el proyecto
git clone https://github.com/TU_USUARIO/changamas.git
cd changamas/django_changamas

---

## 2. Base de datos (PostgreSQL)
1. Abrí pgAdmin o DBeaver
2. Creá una base de datos llamada `bd_changamas`
3. Abrí `django_changamas/settings.py` y configurá:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bd_changamas',
        'USER': 'postgres',
        'PASSWORD': 'TU_PASSWORD',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

instalar postgresql, con ello va a instalarse pgadmin 4 con el cual visualizar la base de datos (no es necesario para crearlo, si seguis el tutorial de abajo. Pero si si queres ver todo lo que tiene la base de datos). Cuando conectas el servidor tenes que poner la informacion especificada anteriormente y una vez conectada, correr las migraciones. Despues correr django y el react y deberia funcionar todo. 
Video de ayuda para instalar postgresql y cnfigurarlo. 

Como instalar POSTGRESQL: https://youtu.be/w9ax9-s2jbE?si=2EdxNAS7iLGfVfoH
Como vincular POSTGRESQL Y DJANGO (con CMD): https://youtu.be/RNFrlYO4_6g?si=bI6QbAO5aUGiiqB1
---

## 3. Backend (Django)

### Crear y activar entorno virtual
python -m venv venv-changamas
venv-changamas\Scripts\activate   ← Windows
source venv-changamas/bin/activate ← Mac/Linux

### Instalar dependencias
pip install -r requirements.txt

### Migrar base de datos
python manage.py migrate

### Crear superusuario (para el admin)
python manage.py createsuperuser

### Iniciar servidor
python manage.py runserver

Backend corre en: http://127.0.0.1:8000
Admin en: http://127.0.0.1:8000/admin

---

## 4. Frontend (React)

cd react-changamas
npm install
npm run dev

Frontend corre en: http://localhost:5173

---

## 5. Info de la App.

La aplicacion no esta terminada y le falta mucho por delante para desarrollar, sobretodo interfaces graficas. Para crear un usuario debera completar la informacion solicitada, incluyendo la seccion de "trabajador o cliente" (no hace falta info especifica, no hay verificacion de texto todavia), luego iniciar sesion y dependiendo de que el usuario sea cliente o trabajador va a mostrar las pestañas de manera diferente.

Cabe aclarar: 
Funcionan: home, publicaciones, chat y perfil. Sin embargo, algunos solo funcionan si te dirigis a esa pestaña estando en el home (error de linkeo). 


---

## Archivos que NO se suben a GitHub
- venv-changamas/
- node_modules/
- db.sqlite3
- __pycache__/

Asegurate de tener un `.gitignore` con esos archivos.

---

## Tecnologías
- Django 5+
- Django REST Framework
- Simple JWT
- React 19 + Vite
- PostgreSQL
- Framer Motion
- Lucide React
