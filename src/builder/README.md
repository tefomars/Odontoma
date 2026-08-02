# Editor visual local de Odontoma

1. Ejecuta `npm run dev`.
2. Abre `http://127.0.0.1:5173/builder.html`.
3. Usa **Estructura** como constructor de bloques para el menú principal,
   tipos de quiz, materias y decks de Flashcards. Cada pantalla tiene un botón
   **+ Agregar**; cada bloque permite editar texto, símbolo, color, destino,
   orden y también quitarlo por completo. También se pueden arrastrar los
   bloques, duplicarlos, deshacer cambios y revisar la vista móvil.
4. Usa **Pantallas** para crear páginas completas desde una plantilla de
   página simple, menú o guía. Combina títulos, texto, botones, tarjetas y
   separadores; luego enlaza la pantalla desde cualquier menú, materia, deck o
   botón usando **¿Qué abre?**.
5. Usa **Avanzado** para navegar por la aplicación real. Cambia a **Editar
   texto** para seleccionar títulos, etiquetas o símbolos, y a **Bloques**
   para personalizar, duplicar u ocultar botones, tarjetas y secciones. Los
   elementos ocultos pueden restaurarse desde el mismo panel. Un duplicado
   conserva la acción del original; para crear una función nueva se usa el
   editor especializado correspondiente. Los cambios permanecen como borrador
   hasta pulsar **Aplicar a Odontoma**.
6. Usa **Apariencia** para probar y aplicar estilos globales de botones.
7. Usa **Contenido** para administrar la estructura
   **clase → cuestionario/apartado → preguntas**, además de respuestas modelo
   y puntos que el estudiante debe considerar. Una clase puede guardarse vacía
   y sus cuestionarios se agregan después de forma independiente.
8. Pulsa el botón de aplicar de cada sección para escribir el cambio en el
   proyecto. Los borradores se conservan localmente hasta aplicarlos o
   descartarlos. Antes de aplicar pantallas o estructura se conserva una
   versión automática para recuperación.

`builder.html` solo se sirve durante desarrollo y no forma parte de la salida
de producción de Vite. Los endpoints de escritura también rechazan solicitudes
que no provengan de la propia máquina y de un origen local.
