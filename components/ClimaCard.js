// components/ClimaCard.jsx
import Image from "next/image";
import {
  getWeatherIconPath,
  getWeatherDescription,
} from "@/lib/weatherMapping";
import "@/styles/clima.css";

export default function ClimaCard({ clima }) {
  if (!clima || clima.error) return null;

  // Función para filtrar días futuros (incluyendo weathercode)
  function obtenerDiasFuturos(pronostico, cantidad = 4) {
    if (!pronostico || !pronostico.time) return [];

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diasFuturos = pronostico.time.reduce((acc, fechaStr, index) => {
      const fecha = new Date(fechaStr);
      fecha.setHours(0, 0, 0, 0);

      if (fecha > hoy) {
        acc.push({
          fecha: fechaStr,
          max: pronostico.temperature_2m_max[index],
          min: pronostico.temperature_2m_min[index],
          precipitacion: pronostico.precipitation_sum[index],
          weathercode: pronostico.weathercode[index], // 👈 Código para el día
        });
      }
      return acc;
    }, []);

    return diasFuturos.slice(0, cantidad);
  }

  const diasFuturos = obtenerDiasFuturos(clima.pronostico, 4);

  return (
    <div className="clima-card">
      <h2>🌤️ Clima en {clima.nombreLugar}</h2>

      {/* Clima Actual */}
      <div className="clima-actual">
        <Image
          src={getWeatherIconPath(clima.actual.weathercode)}
          alt={getWeatherDescription(clima.actual.weathercode)}
          width={64}
          height={64}
          priority
        />
        <div>
          <p className="temperatura-actual">{clima.actual.temperature}°C</p>
          <p className="viento">💨 Viento: {clima.actual.windspeed} km/h</p>
          <p className="descripcion">
            {getWeatherDescription(clima.actual.weathercode)}
          </p>
        </div>
      </div>

      {/* Pronóstico próximos días */}
      <h3>Próximos días</h3>
      <div className="pronostico-grid">
        {diasFuturos.map((dia) => (
          <div key={dia.fecha} className="dia-pronostico">
            <strong>
              {new Date(dia.fecha).toLocaleDateString("es-PE", {
                weekday: "short",
                day: "numeric",
              })}
            </strong>

            <Image
              src={getWeatherIconPath(dia.weathercode)}
              alt={getWeatherDescription(dia.weathercode)}
              width={40}
              height={40}
            />

            <div className="temps">
              <span className="max">{dia.max}°</span>
              <span className="min">{dia.min}°</span>
            </div>

            <p className="precipitacion">💧 {dia.precipitacion} mm</p>
          </div>
        ))}
      </div>
    </div>
  );
}
