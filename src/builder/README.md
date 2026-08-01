# Editor visual local de Odontoma

1. Ejecuta `npm run dev`.
2. Abre `http://127.0.0.1:5173/builder.html`.
3. Los controles modifican únicamente la vista previa.
4. **Aplicar al proyecto** escribe el tema en `applied-theme.css`.
5. **Restaurar original** desactiva todos los overrides del editor.

`builder.html` se sirve únicamente durante desarrollo y no forma parte de la
salida de producción de Vite. El servidor también rechaza solicitudes que no
provengan de la propia máquina y de un origen local.
