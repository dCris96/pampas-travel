"use server";

export async function obtenerClima(lat, lon, nombreLugar = "") {
  if (!lat || !lon) {
    throw new Error("Latitud y longitud son requeridas");
  }

  try {
    // Añadimos weathercode a daily y aumentamos forecast_days a 6
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=6`;

    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo obtener el clima`);
    }

    const data = await res.json();

    return {
      nombreLugar,
      actual: data.current_weather,
      pronostico: data.daily,
    };
  } catch (error) {
    console.error("Error en obtenerClima:", error);
    return {
      error: error.message,
      nombreLugar,
    };
  }
}
