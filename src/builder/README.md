# Editor visual local de Odontoma

1. Ejecuta `npm run dev`.
2. Abre `http://127.0.0.1:5173/builder.html`.
3. Usa **Editar la app** para cambiar el menú principal, el selector de tipos
   de quiz y las materias sobre réplicas de las pantallas reales. Los textos,
   descripciones, símbolos y colores se editan desde sus lápices verdes.
4. Usa **Apariencia** para probar y aplicar estilos de botones.
5. Usa **Contenido · Preguntas abiertas** para administrar la estructura
   **clase → cuestionario/apartado → preguntas**, además de respuestas modelo
   y puntos que el estudiante debe considerar. Una clase puede guardarse vacía
   y sus cuestionarios se agregan después de forma independiente.
6. Pulsa el botón de aplicar de cada sección para escribir el cambio en el
   proyecto. Los borradores se conservan localmente hasta aplicarlos o
   descartarlos.

`builder.html` solo se sirve durante desarrollo y no forma parte de la salida
de producción de Vite. Los endpoints de escritura también rechazan solicitudes
que no provengan de la propia máquina y de un origen local.
