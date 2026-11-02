# Editor visual local de Odontoma

## Espacio de trabajo unificado

El árbol de la izquierda es la navegación principal. Tiene los menús de la app,
materias, capítulos, repasos agrupados por clase, escritas y menús personalizados.
Buscá por nombre o desplegá una clase. Elegí Quiz, Flashcards o Escritas sin salir
del espacio de trabajo. Los editores quedan montados: cambiar de sección no
descarta su borrador ni su historial de Deshacer/Rehacer.

Las tarjetas de una materia nueva se registran una sola vez al guardar el banco.
Quitar una tarjeta de Materias de quizzes o de flashcards no elimina su banco y
no debe hacerla reaparecer al recargar. Las tarjetas quitadas desde el editor
pueden recuperarse en **Tarjetas quitadas de esta pantalla**.

Las vistas Computadora, Tablet y Teléfono del editor usan un iframe con viewport
real de 1280, 768 o 390 px; la escala visual solo sirve para que quepa en el área
de trabajo. Así las reglas responsive son las de la app, no las del monitor del editor.

En **Repaso pre-parcial → nombre de clase → ✎ Editar clase** se edita su nombre
visible, descripción, símbolo y color. No se cambia la clave que agrupa sus bancos,
ni los IDs de las preguntas/tarjetas, ni el progreso; tampoco se renombra la materia
de los quizzes y flashcards normales.

- **＋ en Materias / Repaso pre-parcial:** elegí nombre y clase; después agregá
  capítulos y contenido. Un banco de repaso representa un parcial y no comparte
  preguntas ni progreso con los quizzes normales.
- **Menús personalizados → ＋:** creá una pantalla y editá sus bloques, imágenes,
  columnas, ancho y destinos. Un menú nuevo ya aparece en «¿Qué abre?» antes de
  guardar. Enlazalo desde un botón para hacerlo accesible al estudiante.
- **Subdivisiones y organización:** agregá, renombrá o reordená los grupos de
  materias, independientemente para quizzes y flashcards. En la tarjeta de cada
  materia elegí la subdivisión y subí una portada. Si quitás un grupo, sus tarjetas
  pasan al primero; no se elimina contenido.
- **Navegar y editar la app:** probá la app real guardada, con tamaño de teléfono,
  tablet o computadora. Navegar permite recorrerla; Editar texto y Bloques
  permiten seleccionar elementos. Cuando el bloque tiene un editor estructural,
  «Editar contenido y navegación originales» te lleva directamente a él. Para
  cambios de contenido y nuevas pantallas, guardá antes de probarlos aquí.
- **Guardar en Odontoma (⌘/Ctrl+S):** aplica todos los borradores juntos, crea
  una copia anterior y recarga los editores conservando la sección seleccionada.
  No equivale a publicar. Usá tu comando habitual de terminal para Git y Vercel.
- **Historial y backups:** lista de más reciente a más antigua con fecha/hora
  de Guatemala, cantidades y diferencias contra el proyecto actual. Creá puntos
  con nombre antes de experimentar. Podés marcar un punto como referencia de
  una publicación hecha por vos: no es confirmación automática de Vercel.
- **Volver a una publicación:** recuperá el punto editable elegido, confirmá la
  restauración local y publicá nuevamente por terminal. Esto restaura contenido,
  menús y apariencia; NO hace checkout de código ni rollback remoto en Vercel.
  Para recuperar también código, utilizá la copia completa .tar.gz en otra carpeta.

Las copias automáticas guardan el estado anterior al cambio. Los puntos manuales
guardan el estado aplicado en ese momento, sin borradores pendientes. Antes de
restaurar se conserva el proyecto guardado actual y se avisa que los borradores
serán descartados. No se borran las estadísticas de los estudiantes.

## Flujo de trabajo

El builder es privado, funciona en tu computadora y no se incluye en Vercel.
Abrilo con `npm run dev` y entrá a `/builder.html`. **Aplicar todos los borradores
al proyecto** guarda los cambios de las secciones del builder. Después probá la
app y ejecutá tu comando habitual de Git y Vercel para publicar.

## Biblioteca oficial

En **Quizzes y flashcards oficiales** podés editar los bancos actuales y crear
materias o repasos pre-parcial. Elegí la materia, el capítulo y el tipo de
contenido. Cada pregunta y tarjeta conserva un identificador estable para el
progreso; cambiar el texto no crea una pregunta nueva.

- Creá capítulos, modificá sus títulos, subtítulos e imágenes, y cambiá el orden.
- Agregá, duplicá, mové o quitá preguntas y tarjetas. Usá arrastrar o las flechas.
- Las preguntas permiten una o varias respuestas correctas. Los archivos JSON
  también admiten preguntas con dos opciones, como Verdadero/Falso.
- Las tarjetas permiten imagen en frente y respuesta. Las preguntas escritas y
  de opción múltiple admiten imagen en el enunciado. Se aceptan archivos JPG,
  PNG, WebP y GIF; se convierten a imágenes estáticas WebP de hasta 1600 px.
- Las imágenes importadas por archivo se guardan con el contenido, no quedan
  enlazadas a tu carpeta Downloads. Una URL externa seguirá dependiendo de ese sitio.
- Mostrá u ocultá materias con la casilla de visibilidad. Las nuevas materias
  aparecen en los selectores de la app; podés enlazar sus bancos desde Pantallas.
- Para quitar una materia completa: seleccionála, abrí **Editar materia y
  capítulos → Quitar materia de la biblioteca**, confirmá y aplicá. Se archiva:
  desaparece de la lista activa y los menús sin borrar preguntas ni progreso.
  **Materias quitadas → Recuperar** la devuelve como borrador; aplicá para guardar.
  También podés usar Deshacer antes de aplicar. Esto no borra botones de menús
  personalizados: si creaste uno que la abría, quitalo desde Pantallas/Estructura.
- Deshacer/Rehacer recupera las operaciones globalmente en orden, aunque cambies de editor. Los borradores de la
  biblioteca se guardan en IndexedDB. **Recargar versión del proyecto** descarta
  el borrador y vuelve a lo aplicado.

El guardado usa cambios por elemento en `src/content/studio/data.json`: no copia
todo el banco original cuando editás una pregunta. Los bancos originales sirven
como base y los cambios se incorporan tanto a la app como al builder.

## Importar y exportar

La importación se prepara como vista previa y se confirma antes de agregarse al
borrador. El importador detecta posibles duplicados dentro del destino seleccionado y permite decidir si omitirlos.

- Opción múltiple TSV/CSV: Pregunta, A, B, C, D, Correcta, Explicación.
  Correcta acepta A–D o 1–4; para varias respuestas usá `1,3`.
- Flashcards TSV/CSV: Frente, Respuesta, Subtema (opcional).
- Escritas, en **Contenido**: Pregunta, Respuesta modelo, Puntos aceptados
  separados por `|`, Explicación.
- Sin encabezados. En CSV, entrecomillá campos que contengan comas o saltos de línea.
- JSON de un banco, biblioteca completa o archivos `.odontoma-quiz` compatibles.
- Exportá una biblioteca completa con imágenes o el banco/capítulo seleccionado.

## Menús y tamaños

**Pantallas** permite crear menús enlazados, textos y tarjetas. El ancho máximo,
columnas y separación se editan desde el inspector de la pantalla. En móvil las
columnas pasan a una sola y el ancho se limita al espacio disponible. **Avanzado
→ Bloques** permite limitar el ancho y cambiar el espacio interno de bloques
existentes. Evitá usar este inspector para cambiar el significado de una acción;
para enlazar bancos o pantallas, usá sus selectores de destino.

Los menús personalizados mantienen un historial de páginas. Volver y el swipe
de regreso utilizan el mismo manejador, también cuando un menú abre un banco.

## Backups y recuperación

**Backup, restauración y ayuda** ofrece dos formatos:

- `.tar.gz`: copia de código, contenido, imágenes y builder; excluye
  `node_modules`, `dist`, `.vercel`, archivos `.env` y el historial local de snapshots.
- `odontoma-proyecto-editable.json`: contenido, menús y apariencia. Se restaura
  directamente desde el builder con validación previa y copia de recuperación.

Las versiones anteriores quedan en `.odontoma-history/`, que no se sube a Git.
Antes de aplicar se guarda la versión anterior. Restaurar un proyecto elimina
los borradores del builder para evitar que oculten el contenido restaurado.
El progreso de los estudiantes se respalda por separado desde **Backup** en la app.

Para recuperar una copia completa `.tar.gz`, extraela en una carpeta distinta,
instalá dependencias con `npm install` y abrila con `npm run dev`.

## Controles que ya existían

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
# Guardado seguro y revisión de accesos

El indicador superior compara cada uno de los ocho editores con el proyecto guardado. Podés pulsarlo para ver las **secciones** pendientes (no la cantidad de teclas o ediciones), ir a su editor y revisar enlaces. Al deshacer hasta el estado guardado, esa sección deja de figurar como pendiente. Guardar espera a que carguen todos los editores y aplica todo localmente; Git y Vercel siguen publicándose desde la terminal.

- **Tarjeta de acceso:** es el botón de una pantalla. Quitarla conserva el banco, las preguntas y el progreso; se recupera desde «Tarjetas quitadas».
- **Banco:** contiene capítulos, preguntas y flashcards. Cambiar «Nombre del banco» no renombra sus accesos automáticamente. El botón «Actualizar también títulos de tarjetas de acceso» lo hace solo si lo confirmás; Deshacer global revierte esta sincronización como una sola operación.
- **Clase de repaso:** su nombre visible se cambia con el lápiz de la clase en el árbol. Es independiente de los bancos y del progreso.

Los enlaces a menús o bancos inexistentes impiden guardar y ofrecen «Ir a este botón». Los accesos a bancos ocultos/archivados y los botones que apuntan al mismo menú muestran avisos, no bloqueos. Un menú nuevo sin accesos es válido. El servidor vuelve a revisar los enlaces al guardar, incluso desde los editores individuales. Si algo falla, aparece «No se guardó»; los borradores no se descartan.

## Agregar contenido sin código y pedirlo a cualquier AI

1. Pulsá **＋ Agregar contenido** en el árbol.
2. Elegí opción múltiple, V/F, escritas o flashcards; para las dos primeras y flashcards, elegí materia normal o repaso pre-parcial (bancos independientes).
3. Elegí un banco y capítulo existentes o creá nuevos. En escritos elegís clase, cuestionario y, al crear uno, parcial opcional.
4. Importá JSON/CSV/TSV, pegá filas de Excel o elegí crear vacío para editar a mano. Revisá columnas, errores por fila, opciones correctas y posibles duplicados. El importador no reemplaza preguntas existentes ni sus IDs. Las omisiones de errores requieren marcarlo explícitamente.
5. Confirmá el destino, portada opcional y accesos de la materia nueva. La creación con sus tarjetas se deshace como una sola operación global.
6. Revisá el borrador antes de guardar; publicá por terminal cuando estés satisfecho.

**▧ Formatos y prompts para AI** abre las cuatro estructuras. Podés copiar el prompt o JSON y descargar ejemplos/CSV. Funciona con cualquier AI; no conecta cuentas ni consume una API. Pegá el material después del prompt. Que el JSON sea válido no garantiza exactitud académica.

**Navegar y editar la app → Probar borrador sin guardar** toma una instantánea de los ocho editores y carga la app real con esos datos dentro de un iframe. Incluye bancos, menús, organización, escritos, imágenes y apariencia. La sesión usa almacenamiento en memoria vacío: no lee ni modifica progreso real, no guarda archivos ni publica. **Actualizar borrador** toma otra instantánea después de editar. **Ver proyecto guardado** usa los datos y almacenamiento normales de la app.

### Deshacer y recuperación

Los botones superiores operan sobre las últimas 80 acciones globales. La escritura continua en el mismo campo se agrupa. Fuera de campos de texto podés usar ⌘/Ctrl+Z y ⌘/Ctrl+Shift+Z; dentro de un campo se conserva la edición nativa del navegador. Tras guardar o recargar empieza otro historial de acciones; para versiones ya aplicadas usá **Historial y backups**, no Deshacer.

### Recorrido para probar con calma

- Creá una materia de prueba con un capítulo; importá una pregunta, una flashcard y un escrito usando los ejemplos.
- Revisá un error intencional y un duplicado; confirmá que nada se agrega hasta aceptarlo.
- Probá el borrador en computadora, tablet y teléfono; respondé, volvé al menú anterior y, en un dispositivo táctil real, probá swipe.
- Deshacé y rehacé entre editores. Guardá localmente, recargá y verificá que continúe el contenido.
- Para probar restauración, creá primero un punto con nombre del proyecto guardado. Restaurar conserva otra copia anterior, descarta borradores y no afecta progreso estudiantil. No publiques contenido de prueba por accidente.

Los errores estructurales se validan al guardar. Gestos físicos de Safari/iPad y todos los contenidos académicos requieren su propia revisión; una prueba automática no sustituye esa comprobación.

### Flashcards: FSRS y Sin espera

Todos los bancos, incluidos los importados y los de repaso pre-parcial, admiten ambos modos sin agregar campos al contenido. En **Sin espera**, «La recuerdo» guarda la tarjeta como completada en este dispositivo; al volver no se repite. «Otra vez» queda pendiente y vuelve en la ronda. Nuevas e Incorrectas consultan esta memoria independiente, no el historial de FSRS. Deshacer también revierte ese resultado guardado.

**Reiniciar este bloque** pide confirmación y borra únicamente esta memoria para las tarjetas del mazo, capítulo o grupo de subtemas abierto, sin cambiar FSRS ni suspensiones. El reinicio general de un parcial también incluye esta memoria de sus flashcards. La memoria se incluye automáticamente en el backup de estudiante de la app, no en los archivos de contenido compartidos; cada estudiante empieza con su propio avance. Cambiar títulos o texto manteniendo los IDs conserva el avance; tarjetas con IDs nuevos se consideran nuevas.
