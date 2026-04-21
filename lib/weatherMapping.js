// lib/weatherMapping.js

/**
 * Mapea el código WMO (o código extendido) a la ruta del icono personalizado.
 * Los archivos deben estar en /public/icons/weather/ con el nombre "<codigo>.svg"
 * @param {number} code - Código meteorológico
 * @returns {string} Ruta del icono
 */
export function getWeatherIconPath(code) {
  // Mapa de códigos a nombres de archivo (sin extensión)
  const iconMap = {
    // Despejado / Soleado
    0: "0",

    // Mayormente soleado
    1: "1",

    // Parcialmente soleado
    2: "2",

    // Mayormente nublado
    3: "3",

    // Nublado
    4: "4",

    // Cubierto
    5: "5",

    // Cubierto con nubes bajas
    6: "6",

    // Niebla
    45: "45",

    // Lluvia ligera
    51: "51",

    // Lluvia
    61: "61",

    // Posible lluvia
    62: "62",

    // Ducha de lluvia
    80: "80",

    // Tormenta
    95: "95",

    // Tormentas locales
    96: "96",

    // Nieve ligera
    71: "71",

    // Nieve
    73: "73",

    // Posible nieve
    74: "74",

    // Ducha de nieve
    85: "85",

    // Lluvia y nieve
    86: "86",

    // Posible lluvia y nieve
    87: "87",

    // Lluvia y nieve parcial
    88: "88",

    // Lluvia helada
    66: "66",

    // Posible lluvia helada
    67: "67",

    // Granizo
    77: "77",

    // NOTA: Las variantes nocturnas se han omitido según tu petición.
  };

  // Si el código no está mapeado, usamos el icono por defecto
  const fileName = iconMap[code] || "default";
  return `/icons/weather/${fileName}.svg`;
}

/**
 * Devuelve una descripción en español para el código meteorológico.
 * @param {number} code - Código meteorológico
 * @returns {string} Descripción legible
 */
export function getWeatherDescription(code) {
  const descriptions = {
    0: "Despejado",
    1: "Mayormente soleado",
    2: "Parcialmente soleado",
    3: "Mayormente nublado",
    4: "Nublado",
    5: "Cubierto",
    6: "Cubierto con nubes bajas",
    45: "Niebla",
    51: "Lluvia ligera",
    61: "Lluvia",
    62: "Posible lluvia",
    80: "Chubascos",
    95: "Tormenta",
    96: "Tormentas locales",
    71: "Nieve ligera",
    73: "Nieve",
    74: "Posible nieve",
    85: "Chubasco de nieve",
    86: "Lluvia y nieve",
    87: "Posible lluvia y nieve",
    88: "Lluvia y nieve parcial",
    66: "Lluvia helada",
    67: "Posible lluvia helada",
    77: "Granizo",
  };

  return descriptions[code] || "Condición desconocida";
}
