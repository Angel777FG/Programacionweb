# ⚡ GymLog — Bitácora de Entrenamiento Físico

Mini-aplicación web interactiva para registrar sesiones de entrenamiento. Permite agregar ejercicios con categoría muscular, series, repeticiones, peso y fecha, persistiendo todos los datos en el navegador sin servidor.

---

## 🎯 Objetivo del proyecto

Proveer una bitácora digital personal donde el usuario pueda:
- Registrar ejercicios de cada sesión de entrenamiento con datos completos.
- Filtrar los registros por grupo muscular.
- Eliminar entradas individuales o limpiar toda la bitácora.
- Ver estadísticas rápidas (sesiones únicas y total de ejercicios registrados).

---

## ✅ Checklist de requerimientos técnicos

### Bloque 1 — Estructura y maqueta
- [x] Proyecto creado desde cero (sin reutilizar archivos previos)
- [x] Página principal `index.html` con maqueta propia
- [x] Separación estricta: `index.html` / `css/styles.css` / `js/script.js`
- [x] Sin CSS inline ni atributos `onclick="..."` en el HTML
- [x] Estructura de carpetas ordenada (`css/`, `js/`, `data/`)
- [x] Diseño profesional: jerarquía visual, botones con `:hover`/`:disabled`, tipografía legible, espaciado consistente

### Bloque 2 — DOM y eventos
- [x] Selección de elementos con `querySelector()` e `getElementById()`
- [x] Modificación dinámica de texto, atributos y clases CSS
- [x] **5 eventos distintos** con `addEventListener()`: `submit`, `input`, `change`, `keyup`, `blur`
- [x] Generación dinámica con `document.createElement()` + `appendChild()` + `remove()` (tarjetas de ejercicio)
- [x] Eliminación individual de registros

### Bloque 3 — Formulario y validaciones
- [x] **7 campos independientes**: ejercicio (text), categoría (select), series (number), repeticiones (number), peso (number), fecha (date), notas (text)
- [x] **Regla 1 — Campo requerido**: ejercicio, categoría, series, repeticiones, peso, fecha
- [x] **Regla 2 — Regex de formato**: ejercicio solo acepta letras, números, espacios y guiones (`/^[a-zA-Záéíóú...]+$/`)
- [x] **Regla 3 — Longitud**: ejercicio entre 3 y 50 caracteres; notas máx. 120 caracteres
- [x] **Regla 4 — Validación cruzada**: `series × repeticiones ≤ 500` (volumen total fisiológicamente razonable)
- [x] **Regla 5 — Negocio propio**: fecha de entrenamiento no puede ser futura
- [x] Mensajes de error por campo, bajo cada input (sin `alert()`)
- [x] Retroalimentación visual con clases CSS `.campo-valido` / `.campo-invalido`
- [x] `event.preventDefault()` en el evento `submit`

### Bloque 4 — Datos y persistencia
- [x] **Opción elegida: LocalStorage**
- [x] `localStorage.setItem()` para guardar registros como JSON
- [x] `localStorage.getItem()` + `JSON.parse()` para recuperar al recargar
- [x] Eliminación individual y eliminación total (CRUD básico)
- [x] Manejo del caso de LocalStorage vacío (primera carga sin excepciones)

### Bloque 5 — Usabilidad, compatibilidad y depuración
- [x] Compatible en Chrome, Edge y Firefox
- [x] Diseño responsive (escritorio y móvil via DevTools)
- [x] Cero errores críticos en consola (carga y uso)
- [x] Código limpio: nombres descriptivos, funciones pequeñas, comentarios técnicos

### Bloque 6 — Versionamiento y entrega
- [x] Repositorio GitHub creado desde cero
- [x] Mínimo 4 commits con mensajes descriptivos
- [x] README con objetivo, checklist, instrucciones y capturas

---

## 🚀 Instrucciones para desplegar y correr la app

**Requisito previo:** Navegador moderno (Chrome, Edge o Firefox). No se necesita servidor ni Node.js.

### Opción A — Apertura directa (más simple)
```bash
# Clona el repositorio
git clone https://github.com/TU_USUARIO/gym-log.git
cd gym-log

# Abre el archivo principal en tu navegador
# Windows:
start index.html
# macOS:
open index.html
# Linux:
xdg-open index.html
```

### Opción B — Live Server (recomendado para desarrollo)
1. Instala la extensión **Live Server** en VS Code.
2. Abre la carpeta del proyecto en VS Code.
3. Click derecho en `index.html` → **"Open with Live Server"**.

---

## 📸 Capturas de pantalla

> Agrega aquí las capturas una vez ejecutes el proyecto:

| Pantalla | Descripción |
|----------|-------------|
| `screenshots/01_inicio_vacio.png` | Estado vacío al cargar por primera vez |
| `screenshots/02_formulario_validaciones.png` | Errores de validación visibles |
| `screenshots/03_registro_guardado.png` | Tarjeta de ejercicio renderizada |
| `screenshots/04_filtro_categoria.png` | Filtro por grupo muscular activo |
| `screenshots/05_mobile.png` | Vista responsive en móvil |

---

## 💬 Preguntas de cierre

**1. ¿Por qué elegiste esta temática?**
El entrenamiento físico requiere naturalmente un formulario con múltiples campos heterogéneos (texto, número, selección, fecha), lo que permite implementar todas las reglas de validación de forma orgánica sin forzar el diseño.

**2. ¿Qué validación fue más compleja?**
La validación cruzada de volumen total (`series × repeticiones ≤ 500`), porque requiere leer dos campos simultáneamente, computar un resultado derivado y asignar el error a ambos campos de manera coordinada.

**3. ¿Qué parte del DOM mejoró más la UX?**
La generación dinámica de tarjetas con `createElement()` y la animación de entrada (`slideIn`), que dan al usuario retroalimentación inmediata de que su registro fue procesado correctamente.

**4. ¿Por qué LocalStorage y qué limitación tiene?**
LocalStorage es suficiente para una app personal sin backend. Su limitación intrínseca es que los datos quedan atados al dispositivo/navegador — si el usuario limpia el caché o usa otro navegador, pierde la bitácora. No hay sincronización en la nube.

**5. ¿Qué mejora implementarías con 2 horas más?**
Exportación de la bitácora a CSV/PDF y un gráfico de progreso por ejercicio (evolución del peso levantado en el tiempo), usando la API Canvas o una librería ligera como Chart.js via CDN.

---

## 🗂 Estructura de carpetas

```
gym-log/
├── index.html          # Estructura HTML principal
├── css/
│   └── styles.css      # Estilos (tema oscuro atlético)
├── js/
│   └── script.js       # Lógica JS: DOM, eventos, validación, localStorage
├── data/
│   └── datos.json      # (Reservado para opción Fetch — no usado en esta entrega)
└── README.md           # Este documento
```

---

## 📝 Commits sugeridos

```
feat: estructura base HTML y CSS (tema oscuro / Bebas Neue)
feat: logica de formulario y 5 reglas de validacion
feat: persistencia con LocalStorage y CRUD de registros
docs: README con checklist y capturas de pantalla
```
