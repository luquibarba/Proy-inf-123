# TODO

## Objetivo
Ajustar estilo para que en **Publicaciones y Perfil** el fondo sea **blanco/crema**, que **header + navbar** usen un color acorde con la UI (crema con **acento morado**). Además, unificar la **animación del chat** con la de otros apartados.

## Plan de implementación
1. Cambiar tema en `ClientPublicaciones.css`:
   - `.cp-page` a crema (`#f7f1e7`).
   - `.cp-header` y `.bottom-navbar` a diseño crema + acento morado.
   - Ajustar colores de cards/inputs si quedaron oscuros para legibilidad.
2. Cambiar tema en `WorkerPublicaciones.css`:
   - `.wp-pub-page`, `.wp-pub-header`, `.bottom-navbar` a crema + acento morado.
   - Ajustar cards/inputs básicos si quedaron oscuros.
3. Animación de chat:
   - Actualizar `ChatRoom.jsx` para usar `motion.div` con entrada similar a `ChatList.jsx`.
4. Ajustar “parte de arriba” del chat (si aplica):
   - `ChatRoom.css` header para que concuerde con crema + acento morado.
5. Revisar perfil:
   - Confirmar si `UserProfile.css` / `ClientProfile.css` ya usan crema y corregir solo si hay secciones con fondo oscuro.
6. Test visual:
   - Revisar rutas: `/client/publicaciones`, `/worker/publicaciones`, `/client/perfil`, `/worker/perfil`, `/chat/:id`.

