/**
 * GymLog — Bitácora de Entrenamiento Físico
 * Lógica principal: DOM, eventos, validación y persistencia (LocalStorage)
 */

// =====================================================
// CONSTANTES Y REFERENCIAS AL DOM
// =====================================================

const STORAGE_KEY = 'gymlog_registros';

const form         = document.getElementById('formEntrenamiento');
const btnSubmit    = document.getElementById('btnSubmit');
const registroList = document.getElementById('registroList');
const emptyState   = document.getElementById('emptyState');
const filtroSelect = document.getElementById('filtroCategoria');
const btnLimpiar   = document.getElementById('btnLimpiarTodo');
const toast        = document.getElementById('toast');
const progressBar  = document.getElementById('formProgressBar');

// Campos del formulario
const campoEjercicio    = document.getElementById('ejercicio');
const campoCategoria    = document.getElementById('categoria');
const campoSeries       = document.getElementById('series');
const campoRepeticiones = document.getElementById('repeticiones');
const campoPeso         = document.getElementById('peso');
const campoFecha        = document.getElementById('fecha');
const campoNotas        = document.getElementById('notas');
const charNotas         = document.getElementById('char-notas');

// Campos que participan en la barra de progreso
const camposRequeridos = [campoEjercicio, campoCategoria, campoSeries, campoRepeticiones, campoPeso, campoFecha];

// =====================================================
// UTILIDADES
// =====================================================

/** Genera un ID único basado en timestamp */
function generarId() {
  return `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Muestra un mensaje toast temporal */
function mostrarToast(mensaje, esError = false) {
  toast.textContent = mensaje;
  toast.classList.toggle('toast-error', esError);
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2800);
}

/** Formatea fecha ISO a legible en español */
function formatearFecha(isoStr) {
  const [y, m, d] = isoStr.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

// =====================================================
// PERSISTENCIA — LocalStorage
// =====================================================

/** Obtiene todos los registros guardados. Retorna [] si vacío o corrupto */
function obtenerRegistros() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    // Caso borde: JSON corrupto → no genera excepción en consola
    return [];
  }
}

/** Guarda el array completo de registros */
function guardarRegistros(registros) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

/** Agrega un nuevo registro y persiste */
function agregarRegistro(registro) {
  const registros = obtenerRegistros();
  registros.unshift(registro); // más reciente primero
  guardarRegistros(registros);
}

/** Elimina un registro por su id y persiste */
function eliminarRegistroPorId(id) {
  const registros = obtenerRegistros().filter(r => r.id !== id);
  guardarRegistros(registros);
}

/** Elimina todos los registros */
function eliminarTodos() {
  localStorage.removeItem(STORAGE_KEY);
}

// =====================================================
// VALIDACIÓN DEL FORMULARIO
// =====================================================

const REGEX_SOLO_LETRAS_ESPACIOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-]+$/;

/**
 * Muestra u oculta el error de un campo y aplica clase CSS
 * @param {HTMLElement} campo
 * @param {string} mensaje - vacío = válido
 */
function setError(campo, mensaje) {
  const errEl = document.getElementById(`err-${campo.id}`);
  if (mensaje) {
    if (errEl) errEl.textContent = mensaje;
    campo.classList.add('campo-invalido');
    campo.classList.remove('campo-valido');
  } else {
    if (errEl) errEl.textContent = '';
    campo.classList.remove('campo-invalido');
    campo.classList.add('campo-valido');
  }
}

/** Limpia el estado visual de todos los campos */
function limpiarEstadoCampos() {
  [campoEjercicio, campoCategoria, campoSeries, campoRepeticiones, campoPeso, campoFecha, campoNotas].forEach(c => {
    c.classList.remove('campo-valido', 'campo-invalido');
    const err = document.getElementById(`err-${c.id}`);
    if (err) err.textContent = '';
  });
}

/**
 * Valida todos los campos y retorna true si el formulario es válido.
 * REGLAS implementadas:
 *  1. Campo requerido (no vacío)
 *  2. Formato con regex (nombre del ejercicio: letras/números/espacios/guiones)
 *  3. Longitud mínima y máxima (nombre: 3–50 chars)
 *  4. Validación cruzada (series * reps ≤ 500 — límite fisiológico razonable)
 *  5. Regla de negocio propia (fecha no puede ser futura)
 */
function validarFormulario() {
  let esValido = true;

  // --- REGLA 1: Requerido — Ejercicio ---
  const nombreVal = campoEjercicio.value.trim();
  if (!nombreVal) {
    setError(campoEjercicio, 'El nombre del ejercicio es obligatorio.');
    esValido = false;
  } else if (!REGEX_SOLO_LETRAS_ESPACIOS.test(nombreVal)) {
    // --- REGLA 2: Formato con regex ---
    setError(campoEjercicio, 'Solo se permiten letras, números, espacios y guiones.');
    esValido = false;
  } else if (nombreVal.length < 3 || nombreVal.length > 50) {
    // --- REGLA 3: Longitud ---
    setError(campoEjercicio, 'El nombre debe tener entre 3 y 50 caracteres.');
    esValido = false;
  } else {
    setError(campoEjercicio, '');
  }

  // --- REGLA 1: Requerido — Categoría ---
  if (!campoCategoria.value) {
    setError(campoCategoria, 'Selecciona una categoría muscular.');
    esValido = false;
  } else {
    setError(campoCategoria, '');
  }

  // --- REGLA 1: Requerido — Series ---
  const seriesVal = parseInt(campoSeries.value, 10);
  if (!campoSeries.value || isNaN(seriesVal)) {
    setError(campoSeries, 'Ingresa el número de series.');
    esValido = false;
  } else if (seriesVal < 1 || seriesVal > 20) {
    setError(campoSeries, 'Las series deben estar entre 1 y 20.');
    esValido = false;
  } else {
    setError(campoSeries, '');
  }

  // --- REGLA 1: Requerido — Repeticiones ---
  const repsVal = parseInt(campoRepeticiones.value, 10);
  if (!campoRepeticiones.value || isNaN(repsVal)) {
    setError(campoRepeticiones, 'Ingresa las repeticiones por serie.');
    esValido = false;
  } else if (repsVal < 1 || repsVal > 100) {
    setError(campoRepeticiones, 'Las repeticiones deben estar entre 1 y 100.');
    esValido = false;
  } else {
    setError(campoRepeticiones, '');
  }

  // --- REGLA 4: Validación cruzada — volumen total (series × reps) ---
  if (!isNaN(seriesVal) && !isNaN(repsVal) && seriesVal >= 1 && repsVal >= 1) {
    const volumenTotal = seriesVal * repsVal;
    if (volumenTotal > 500) {
      setError(campoSeries, `Volumen total (${volumenTotal} reps) supera el límite de 500. Revisa series y repeticiones.`);
      setError(campoRepeticiones, ' ');
      esValido = false;
    }
  }

  // --- REGLA 1: Requerido — Peso ---
  const pesoVal = parseFloat(campoPeso.value);
  if (campoPeso.value === '' || isNaN(pesoVal)) {
    setError(campoPeso, 'Ingresa el peso (usa 0 para ejercicios de peso corporal).');
    esValido = false;
  } else if (pesoVal < 0) {
    setError(campoPeso, 'El peso no puede ser negativo.');
    esValido = false;
  } else if (pesoVal > 1000) {
    setError(campoPeso, 'El peso ingresado no es realista (máx. 1000 kg).');
    esValido = false;
  } else {
    setError(campoPeso, '');
  }

  // --- REGLA 1 + 5: Requerido + Fecha no futura ---
  const fechaVal = campoFecha.value;
  if (!fechaVal) {
    setError(campoFecha, 'La fecha de entrenamiento es obligatoria.');
    esValido = false;
  } else {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999); // fin del día actual
    const fechaIngresada = new Date(fechaVal + 'T00:00:00');
    if (fechaIngresada > hoy) {
      // Regla de negocio: no puedes registrar un entrenamiento futuro
      setError(campoFecha, 'No puedes registrar un entrenamiento en el futuro.');
      esValido = false;
    } else {
      setError(campoFecha, '');
    }
  }

  // Notas (opcional pero limitado a 120 chars — ya controlado con maxlength; validamos igual)
  if (campoNotas.value.length > 120) {
    setError(campoNotas, 'Las notas no pueden superar los 120 caracteres.');
    esValido = false;
  } else {
    setError(campoNotas, '');
  }

  return esValido;
}

// =====================================================
// RENDERIZADO DE REGISTROS
// =====================================================

/**
 * Construye y retorna un elemento <li> para un registro dado
 * @param {Object} registro
 */
function crearElementoRegistro(registro) {
  const li = document.createElement('li');
  li.classList.add('registro-item');
  li.dataset.id = registro.id;
  li.dataset.categoria = registro.categoria;

  const pesoStr = registro.peso > 0 ? `${registro.peso} kg` : 'Peso corporal';

  li.innerHTML = `
    <div class="registro-main">
      <span class="registro-nombre">${registro.ejercicio}</span>
      <div class="registro-meta">
        <span class="badge">${registro.categoria}</span>
        <span class="badge badge-date">${formatearFecha(registro.fecha)}</span>
      </div>
      <p class="registro-detalle">
        <strong>${registro.series}</strong> series ×
        <strong>${registro.repeticiones}</strong> reps —
        <strong>${pesoStr}</strong>
      </p>
      ${registro.notas ? `<p class="registro-notas">💬 ${registro.notas}</p>` : ''}
    </div>
    <button class="btn-delete" data-id="${registro.id}" title="Eliminar registro" aria-label="Eliminar registro de ${registro.ejercicio}">✕</button>
  `;

  // Evento: eliminar este ítem individualmente
  li.querySelector('.btn-delete').addEventListener('click', () => {
    manejarEliminarRegistro(registro.id, li);
  });

  return li;
}

/**
 * Renderiza todos los registros filtrados por categoría
 * @param {string} filtro - '' para mostrar todos
 */
function renderizarRegistros(filtro = '') {
  const registros = obtenerRegistros();

  const filtrados = filtro
    ? registros.filter(r => r.categoria === filtro)
    : registros;

  // Limpiar lista actual
  registroList.innerHTML = '';

  if (filtrados.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
    filtrados.forEach(r => {
      const el = crearElementoRegistro(r);
      registroList.appendChild(el);
    });
  }

  actualizarEstadisticas(registros);
  btnLimpiar.disabled = registros.length === 0;
}

/** Actualiza los contadores del header */
function actualizarEstadisticas(registros) {
  // Total de ejercicios registrados
  const totalEjEl = document.querySelector('#totalEjercicios .stat-num');
  totalEjEl.textContent = registros.length;

  // Sesiones únicas (por fecha)
  const fechasUnicas = new Set(registros.map(r => r.fecha));
  const totalSesEl = document.querySelector('#totalSesiones .stat-num');
  totalSesEl.textContent = fechasUnicas.size;
}

// =====================================================
// BARRA DE PROGRESO DEL FORMULARIO
// =====================================================

/** Actualiza la barra de progreso según los campos completados */
function actualizarProgreso() {
  const completados = camposRequeridos.filter(c => c.value.trim() !== '').length;
  const porcentaje = Math.round((completados / camposRequeridos.length) * 100);
  progressBar.style.width = `${porcentaje}%`;
}

// =====================================================
// MANEJADORES DE EVENTOS
// =====================================================

/** Maneja el envío del formulario */
function manejarSubmit(e) {
  e.preventDefault(); // REGLA: evitar recarga/envío real

  const esValido = validarFormulario();

  if (!esValido) {
    mostrarToast('⚠️ Corrige los errores antes de continuar.', true);
    // Scroll al primer error
    const primerError = form.querySelector('.campo-invalido');
    if (primerError) primerError.focus();
    return;
  }

  // Construir objeto de registro
  const nuevoRegistro = {
    id:           generarId(),
    ejercicio:    campoEjercicio.value.trim(),
    categoria:    campoCategoria.value,
    series:       parseInt(campoSeries.value, 10),
    repeticiones: parseInt(campoRepeticiones.value, 10),
    peso:         parseFloat(campoPeso.value),
    fecha:        campoFecha.value,
    notas:        campoNotas.value.trim(),
  };

  agregarRegistro(nuevoRegistro);
  renderizarRegistros(filtroSelect.value);

  // Animación de "rep completada" en la barra de progreso
  progressBar.style.width = '100%';
  progressBar.style.boxShadow = '0 0 20px #39FF14';
  setTimeout(() => {
    progressBar.style.boxShadow = '0 0 8px #39FF14';
    progressBar.style.width = '0%';
  }, 500);

  mostrarToast(`✅ ${nuevoRegistro.ejercicio} registrado correctamente.`);
  form.reset();
  limpiarEstadoCampos();
  charNotas.textContent = '0 / 120';
  actualizarProgreso();
}

/** Maneja la eliminación individual de un registro */
function manejarEliminarRegistro(id, elemento) {
  elemento.style.opacity = '0';
  elemento.style.transform = 'translateX(20px)';
  elemento.style.transition = 'opacity 0.2s, transform 0.2s';

  setTimeout(() => {
    eliminarRegistroPorId(id);
    renderizarRegistros(filtroSelect.value);
    mostrarToast('🗑 Registro eliminado.');
  }, 200);
}

// =====================================================
// REGISTRO DE EVENTOS (mínimo 3 tipos distintos)
// =====================================================

// EVENTO 1: submit — procesa el formulario con validación
form.addEventListener('submit', manejarSubmit);

// EVENTO 2: input — actualiza la barra de progreso y el contador de caracteres
form.addEventListener('input', () => {
  actualizarProgreso();
});

// EVENTO 3: change — filtra los registros al cambiar la categoría
filtroSelect.addEventListener('change', () => {
  renderizarRegistros(filtroSelect.value);
});

// EVENTO 4: keyup en el campo notas — actualiza contador de caracteres en tiempo real
campoNotas.addEventListener('keyup', () => {
  const len = campoNotas.value.length;
  charNotas.textContent = `${len} / 120`;
  if (len > 100) {
    charNotas.style.color = len > 115 ? 'var(--danger)' : '#f0a500';
  } else {
    charNotas.style.color = 'var(--muted)';
  }
});

// EVENTO 5: blur en campos clave — validación en tiempo real al salir del campo
[campoEjercicio, campoSeries, campoRepeticiones, campoPeso, campoFecha].forEach(campo => {
  campo.addEventListener('blur', () => {
    validarCampoIndividual(campo);
  });
});

/** Valida solo el campo que perdió foco, sin marcar el resto */
function validarCampoIndividual(campo) {
  const val = campo.value.trim();
  switch (campo.id) {
    case 'ejercicio':
      if (!val) setError(campo, 'El nombre del ejercicio es obligatorio.');
      else if (!REGEX_SOLO_LETRAS_ESPACIOS.test(val)) setError(campo, 'Solo letras, números, espacios y guiones.');
      else if (val.length < 3 || val.length > 50) setError(campo, 'Entre 3 y 50 caracteres.');
      else setError(campo, '');
      break;
    case 'series': {
      const n = parseInt(campo.value, 10);
      if (!campo.value || isNaN(n)) setError(campo, 'Ingresa el número de series.');
      else if (n < 1 || n > 20) setError(campo, 'Entre 1 y 20 series.');
      else setError(campo, '');
      break;
    }
    case 'repeticiones': {
      const n = parseInt(campo.value, 10);
      if (!campo.value || isNaN(n)) setError(campo, 'Ingresa las repeticiones.');
      else if (n < 1 || n > 100) setError(campo, 'Entre 1 y 100 repeticiones.');
      else setError(campo, '');
      break;
    }
    case 'peso': {
      const n = parseFloat(campo.value);
      if (campo.value === '' || isNaN(n)) setError(campo, 'Ingresa el peso (0 = peso corporal).');
      else if (n < 0) setError(campo, 'El peso no puede ser negativo.');
      else setError(campo, '');
      break;
    }
    case 'fecha': {
      if (!campo.value) { setError(campo, 'La fecha es obligatoria.'); break; }
      const hoy = new Date(); hoy.setHours(23,59,59,999);
      if (new Date(campo.value + 'T00:00:00') > hoy) setError(campo, 'La fecha no puede ser futura.');
      else setError(campo, '');
      break;
    }
  }
}

// Botón limpiar todo
btnLimpiar.addEventListener('click', () => {
  if (!confirm('¿Seguro que deseas eliminar TODOS los registros? Esta acción no se puede deshacer.')) return;
  eliminarTodos();
  renderizarRegistros();
  mostrarToast('🗑 Todos los registros eliminados.');
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

/** Inicializa la app al cargar la página */
function inicializar() {
  // Establece la fecha de hoy como valor por defecto
  const hoy = new Date().toISOString().split('T')[0];
  campoFecha.value = hoy;
  campoFecha.max = hoy; // impide seleccionar fecha futura desde el datepicker

  // Carga y renderiza los registros existentes desde LocalStorage
  renderizarRegistros();

  // Inicializa la barra de progreso
  actualizarProgreso();
}

inicializar();
