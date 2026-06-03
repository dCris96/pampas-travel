import "@/styles/geografia.css";

export default function Geografia() {
  return (
    <div className="contenedor">
      <div className="info-section">
        <h2 className="info-title">⛰️ Datos Geográficos y Extensión</h2>
        <div className="info-item">
          <div className="icon">🌍</div>
          <div className="info-text">
            <h3 className="info-subtitle">Extensión Territorial</h3>
            <p>438.18 km² (El segundo mas grande de la provincia)</p>
          </div>
        </div>
        <div className="info-item">
          <div className="icon">📐</div>
          <div className="info-text">
            <h3 className="info-subtitle">Altitud</h3>
            <p>La capital se sitúa a 3,190 m s.n.m.</p>
          </div>
        </div>
        <div className="info-item">
          <div className="icon">🗺️</div>
          <div className="info-text">
            <h3 className="info-subtitle">Geografía</h3>
            <p>
              Territorio accidentado que incluye valles interandinos y altas
              punas, con una diversidad de climas y ecosistemas.
            </p>
          </div>
        </div>
      </div>

      <div className="mapa">
        <img src="/mapa.png" alt="Mapa de General Pico" />
        <div className="mapa-info">
          <p>438.18 km²</p>
          <span>Extensión</span>
        </div>
      </div>
    </div>
  );
}
