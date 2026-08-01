# Editor visual local de Odontoma

1. Ejecuta `npm run dev`.
2. Abre `http://127.0.0.1:5173/builder.html`.
3. Usa **Editar la app** para agregar, editar, ordenar o quitar tarjetas de
   materias sobre una réplica de la pantalla real.
4. Usa **Apariencia** para probar y aplicar estilos de botones.
5. Usa **Contenido · Preguntas abiertas** para crear decks con pregunta,
   respuesta modelo y puntos que el estudiante debe considerar.
6. Pulsa el botón de aplicar de cada sección para escribir el cambio en el
   proyecto. Los borradores se conservan localmente hasta aplicarlos o
   descartarlos.

`builder.html` solo se sirve durante desarrollo y no forma parte de la salida
de producción de Vite. Los endpoints de escritura también rechazan solicitudes
que no provengan de la propia máquina y de un origen local.
