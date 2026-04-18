// lib/imageUtils.js
// ─────────────────────────────────────────────────────
// UTILIDADES DE IMAGEN
//
// ¿Por qué convertir a WebP?
//   JPG 500KB → WebP 150KB (70% menos peso)
//   PNG 1MB   → WebP 200KB (80% menos peso)
//   Misma calidad visual, carga más rápido
//   Compatible con todos los navegadores modernos
//
// Proceso completo:
//   1. Recibe un File (del input o drag&drop)
//   2. Lee la imagen con FileReader
//   3. La dibuja en un Canvas
//   4. Canvas.toBlob() convierte a WebP
//   5. Devuelve un Blob listo para subir a Storage
// ─────────────────────────────────────────────────────

// ── CONSTANTES ──
// 🔧 PERSONALIZABLE: Ajusta según tus necesidades
const WEBP_CALIDAD = 0.82; // 0.0 - 1.0 (0.82 = buen balance calidad/peso)
const MAX_ANCHO = 1280; // px — ancho máximo de la imagen final
const MAX_ALTO = 1280; // px — alto máximo
const MAX_BYTES_INPUT = 10 * 1024 * 1024; // 10MB — límite de archivo de entrada
const MIN_BYTES_INPUT = 1024; // 1KB — mínimo para evitar archivos vacíos

// Tipos de imagen que acepta el sistema
export const TIPOS_IMAGEN_ACEPTADOS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic", // Fotos de iPhone
  "image/heif",
];

// ─────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL: convertirAWebP
// ─────────────────────────────────────────────────────
/**
 * Toma un File de imagen y lo convierte a WebP optimizado
 *
 * @param {File}   archivo      - El archivo de imagen original
 * @param {Object} opciones     - Configuración opcional
 * @param {number} opciones.calidad  - Calidad WebP (0.0 a 1.0)
 * @param {number} opciones.maxAncho - Ancho máximo en píxeles
 * @param {number} opciones.maxAlto  - Alto máximo en píxeles
 * @param {Function} opciones.onProgreso - Callback de progreso (0-100)
 *
 * @returns {Promise<{blob: Blob, preview: string, infoOriginal: Object, infoFinal: Object}>}
 */
export async function convertirAWebP(archivo, opciones = {}) {
  const {
    calidad = WEBP_CALIDAD,
    maxAncho = MAX_ANCHO,
    maxAlto = MAX_ALTO,
    onProgreso = () => {},
  } = opciones;

  // ── VALIDACIONES ──
  if (!archivo) {
    throw new Error("No se proporcionó ningún archivo.");
  }

  if (
    !TIPOS_IMAGEN_ACEPTADOS.includes(archivo.type) &&
    !archivo.type.startsWith("image/")
  ) {
    throw new Error(
      `Tipo de archivo no soportado: ${archivo.type}. ` +
        `Usa JPG, PNG, WebP o HEIC.`,
    );
  }

  if (archivo.size > MAX_BYTES_INPUT) {
    const mb = (archivo.size / 1024 / 1024).toFixed(1);
    throw new Error(
      `El archivo es demasiado grande: ${mb}MB. ` +
        `El máximo permitido es ${MAX_BYTES_INPUT / 1024 / 1024}MB.`,
    );
  }

  if (archivo.size < MIN_BYTES_INPUT) {
    throw new Error("El archivo está vacío o es demasiado pequeño.");
  }

  const infoOriginal = {
    nombre: archivo.name,
    tipo: archivo.type,
    tamaño: archivo.size,
    tamañoMB: (archivo.size / 1024 / 1024).toFixed(2),
  };

  onProgreso(10); // Iniciando lectura

  // ── PASO 1: Cargar la imagen en un elemento <img> ──
  const imagenOriginal = await cargarImagen(archivo);
  onProgreso(30); // Imagen cargada

  // ── PASO 2: Calcular dimensiones respetando aspect ratio ──
  const { ancho, alto } = calcularDimensiones(
    imagenOriginal.naturalWidth,
    imagenOriginal.naturalHeight,
    maxAncho,
    maxAlto,
  );

  onProgreso(50); // Calculando dimensiones

  // ── PASO 3: Dibujar en Canvas ──
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;

  const ctx = canvas.getContext("2d");

  // Fondo blanco para imágenes PNG con transparencia
  // (WebP soporta transparencia, pero por si acaso)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);

  // Dibujar la imagen redimensionada
  ctx.drawImage(imagenOriginal, 0, 0, ancho, alto);

  onProgreso(70); // Canvas dibujado

  // ── PASO 4: Convertir Canvas a Blob WebP ──
  const blob = await canvasABlob(canvas, "image/webp", calidad);

  onProgreso(90); // WebP generado

  // ── PASO 5: Crear URL de preview ──
  const preview = URL.createObjectURL(blob);

  onProgreso(100); // Completado

  const infoFinal = {
    tipo: "image/webp",
    tamaño: blob.size,
    tamañoMB: (blob.size / 1024 / 1024).toFixed(2),
    ancho,
    alto,
    reduccion: Math.round((1 - blob.size / archivo.size) * 100), // % de reducción
  };

  // Limpiar la URL del objeto imagen original
  URL.revokeObjectURL(imagenOriginal.src);

  return {
    blob, // Blob WebP listo para subir a Supabase
    preview, // URL local para mostrar preview (llama URL.revokeObjectURL cuando ya no la necesites)
    infoOriginal,
    infoFinal,
  };
}

// ─────────────────────────────────────────────────────
// FUNCIÓN: subirImagenWebP
// Convierte Y sube a Supabase Storage en un solo paso
// ─────────────────────────────────────────────────────
/**
 * @param {File}     archivo     - Archivo original del input
 * @param {Object}   supabase    - Cliente de Supabase
 * @param {string}   bucket      - Nombre del bucket ('experiencias', 'negocios', etc.)
 * @param {string}   userId      - ID del usuario (para organizar carpetas)
 * @param {Function} onProgreso  - Callback de progreso (0-100)
 *
 * @returns {Promise<string>} URL pública de la imagen en Storage
 */
export async function subirImagenWebP(
  archivo,
  supabase,
  bucket,
  userId,
  onProgreso = () => {},
) {
  // Paso 1-4: Convertir a WebP (progreso 0-60)
  const { blob, infoFinal } = await convertirAWebP(archivo, {
    onProgreso: (p) => onProgreso(Math.round(p * 0.6)), // Escala 0-60
  });

  onProgreso(60);

  // Paso 5: Generar nombre único
  // Formato: {userId}/{timestamp}.webp
  const timestamp = Date.now();
  const nombreArchivo = `${userId}/${timestamp}.webp`;

  onProgreso(70);

  // Paso 6: Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(nombreArchivo, blob, {
      contentType: "image/webp",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Error al subir la imagen: ${error.message}`);
  }

  onProgreso(90);

  // Paso 7: Obtener URL pública
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(nombreArchivo);

  onProgreso(100);

  return urlData.publicUrl;
}

// ─────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────

/**
 * Carga un File en un elemento HTMLImageElement
 */
function cargarImagen(archivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "No se pudo cargar la imagen. ¿Es un archivo de imagen válido?",
        ),
      );
    };

    img.src = url;
  });
}

/**
 * Calcula las dimensiones finales respetando el aspect ratio
 * y sin superar los límites máximos
 */
function calcularDimensiones(anchoOriginal, altoOriginal, maxAncho, maxAlto) {
  let ancho = anchoOriginal;
  let alto = altoOriginal;

  // Si ya cabe, no redimensionar
  if (ancho <= maxAncho && alto <= maxAlto) {
    return { ancho, alto };
  }

  // Calcular ratio de escala para que quepa en el máximo
  const ratioAncho = maxAncho / ancho;
  const ratioAlto = maxAlto / alto;
  const ratio = Math.min(ratioAncho, ratioAlto);

  return {
    ancho: Math.round(ancho * ratio),
    alto: Math.round(alto * ratio),
  };
}

/**
 * Convierte un Canvas a Blob de forma asíncrona
 */
function canvasABlob(canvas, tipo, calidad) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else
          reject(
            new Error(
              "Error al generar el archivo WebP. Tu navegador podría no soportarlo.",
            ),
          );
      },
      tipo,
      calidad,
    );
  });
}

// ─────────────────────────────────────────────────────
// HELPER: Validar archivo antes de convertir
// Para mostrar errores tempranos en el formulario
// ─────────────────────────────────────────────────────
/**
 * @returns {string|null} Mensaje de error, o null si es válido
 */
export function validarArchivo(archivo) {
  if (!archivo) return "No se seleccionó ningún archivo.";

  if (
    !TIPOS_IMAGEN_ACEPTADOS.includes(archivo.type) &&
    !archivo.type.startsWith("image/")
  ) {
    return `Tipo no permitido: ${archivo.type}. Usa JPG, PNG o WebP.`;
  }

  if (archivo.size > MAX_BYTES_INPUT) {
    return `El archivo es muy grande (${(archivo.size / 1024 / 1024).toFixed(1)}MB). Máximo: 10MB.`;
  }

  if (archivo.size < MIN_BYTES_INPUT) {
    return "El archivo está vacío.";
  }

  return null; // válido
}

// ─────────────────────────────────────────────────────
// HELPER: Formatear tamaño de archivo
// ─────────────────────────────────────────────────────
export function formatearTamaño(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
