// components/MapaInteractivo.js
// ─────────────────────────────────────────────────────
// COMPONENTE: Mapa Leaflet con OpenStreetMap
//
// Este componente SOLO se carga en el cliente (no SSR)
// porque Leaflet necesita acceso al objeto window
//
// Funcionalidades:
//   ✓ Tiles de OpenStreetMap (gratis, sin API key)
//   ✓ Marcadores custom con emoji por tipo
//   ✓ Popups con imagen, nombre y link al detalle
//   ✓ Capas separadas por tipo (lugares, hoteles, etc.)
//   ✓ Filtros de visibilidad por capa
//   ✓ Centro y zoom configurable
//   ✓ Vuelo animado al seleccionar un punto
//
// Props:
//   puntos         → array de { id, nombre, lat, lng, tipo, ...}
//   capasVisibles  → objeto { lugares: true, hotel: false, ... }
//   puntoActivo    → id del punto seleccionado
//   onPuntoClick   → callback(punto) al clickear un marcador
//   centro         → [lat, lng] centro inicial del mapa
//   zoom           → nivel de zoom inicial
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useRef } from "react";

// ── CONFIGURACIÓN DE TIPOS ──
// 🔧 PERSONALIZABLE: Emoji y color de cada tipo de punto
const TIPO_CONFIG = {
  // Lugares turísticos
  naturaleza: { emoji: "🌿", color: "#1a3a26", textColor: "#6bffab" },
  patrimonio: { emoji: "🏛️", color: "#3a2a1a", textColor: "#ffb86b" },
  mirador: { emoji: "🔭", color: "#1a2a5c", textColor: "#6babff" },
  aventura: { emoji: "🧗", color: "#3a1a1a", textColor: "#ff8a6b" },
  cultura: { emoji: "🎭", color: "#2a1a3a", textColor: "#c46bff" },
  gastronomia: { emoji: "🍲", color: "#3a2a10", textColor: "#ffd46b" },
  // Negocios
  hotel: { emoji: "🏨", color: "#1a2240", textColor: "#6babff" },
  restaurante: { emoji: "🍽️", color: "#2a1a10", textColor: "#ffb86b" },
  cafe: { emoji: "☕", color: "#1a1510", textColor: "#ffd46b" },
  tienda: { emoji: "🛍️", color: "#1a2a1a", textColor: "#6bffab" },
  servicio: { emoji: "⚙️", color: "#1f1f1f", textColor: "#aaaaaa" },
  transporte: { emoji: "🚐", color: "#1a1a2a", textColor: "#c46bff" },
};

const DEFAULT_CONFIG = { emoji: "📍", color: "#1f1f1f", textColor: "#aaaaaa" };

export default function MapaInteractivo({
  puntos = [],
  capasVisibles = {},
  puntoActivo = null,
  onPuntoClick = () => {},
  // 🔧 PERSONALIZABLE: Cambia estas coordenadas al centro de TU distrito
  centro = [-8.187377, -77.845393],
  zoom = 13,
}) {
  // Ref al div donde se monta el mapa
  const mapaRef = useRef(null);
  // Ref a la instancia de Leaflet para no recrearla
  const leafletRef = useRef(null);
  // Ref al mapa de marcadores { id: marker }
  const marcadoresRef = useRef({});
  // Ref a las capas de grupos { tipo: layerGroup }
  const capasRef = useRef({});

  // ── INICIALIZAR LEAFLET ──
  // Solo se ejecuta una vez al montar el componente
  useEffect(() => {
    // Importación dinámica de Leaflet (evita error de SSR)
    import("leaflet").then((L) => {
      // Si ya hay un mapa, no lo recreamos
      if (leafletRef.current) return;

      // Corregir bug de íconos de Leaflet con webpack/next
      // (los paths de íconos se rompen en bundlers)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // ── CREAR EL MAPA ──
      const mapa = L.map(mapaRef.current, {
        center: centro,
        zoom: zoom,
        zoomControl: false, // Desactivamos el control por defecto
        attributionControl: true,
      });

      // ── TILES DE OPENSTREETMAP ──
      // Carto Dark Matter: tiles oscuros que combinan con nuestro diseño
      // 🔧 ALTERNATIVAS (cambia la URL):
      //   OSM estándar: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
      //   Carto Light:  https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">Carto</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(mapa);

      // ── CONTROL DE ZOOM PERSONALIZADO ──
      // Lo agregamos en posición topright
      L.control.zoom({ position: "topright" }).addTo(mapa);

      // ── CONTROL PERSONALIZADO: botón para volver al centro ──
      const ControlCentro = L.Control.extend({
        options: { position: "topright" },
        onAdd: function () {
          const btn = L.DomUtil.create("button", "leaflet-control-reset");
          btn.innerHTML = "⌖";
          btn.title = "Volver al centro";
          btn.onclick = () => {
            mapa.flyTo(centro, zoom, { animate: true, duration: 1 });
          };
          // Evitar que el click propague al mapa
          L.DomEvent.disableClickPropagation(btn);
          return btn;
        },
      });
      new ControlCentro().addTo(mapa);

      leafletRef.current = mapa;

      // Cleanup: destruir el mapa al desmontar el componente
      return () => {
        if (leafletRef.current) {
          leafletRef.current.remove();
          leafletRef.current = null;
        }
      };
    });
  }, []); // Solo al montar — [] vacío

  // ── ACTUALIZAR MARCADORES cuando cambian los puntos ──
  useEffect(() => {
    if (!leafletRef.current || puntos.length === 0) return;

    import("leaflet").then((L) => {
      const mapa = leafletRef.current;

      // Limpiar marcadores anteriores
      Object.values(marcadoresRef.current).forEach((m) => m.remove());
      marcadoresRef.current = {};

      // Limpiar capas anteriores
      Object.values(capasRef.current).forEach((capa) => {
        capa.remove();
      });
      capasRef.current = {};

      // Agrupar puntos por tipo para capas separadas
      const puntosValidos = puntos.filter((p) => p.latitud && p.longitud);

      puntosValidos.forEach((punto) => {
        const tipo = punto.tipo || punto.categoria || "default";
        const config = TIPO_CONFIG[tipo] || DEFAULT_CONFIG;

        // Crear grupo de capa si no existe
        if (!capasRef.current[tipo]) {
          capasRef.current[tipo] = L.layerGroup().addTo(mapa);
        }

        // ── ÍCONO CUSTOM con DivIcon ──
        // Usamos HTML puro para el marcador — así controlamos el estilo
        const icono = L.divIcon({
          className: "", // Vacío para no añadir estilos por defecto
          html: `
            <div class="marcador-custom marcador-${tipo}"
              style="background-color: ${config.color}; border-color: rgba(255,255,255,0.15);">
              ${config.emoji}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16], // Centro del ícono
          popupAnchor: [0, -18], // Posición del popup sobre el ícono
        });

        // ── CONTENIDO HTML DEL POPUP ──
        // 🔧 PERSONALIZABLE: Cambia el contenido del popup
        const rutaDetalle = punto.tipo
          ? `/negocios/${punto.id}`
          : `/lugares/${punto.id}`;

        const popupHtml = `
          <div class="popup-card">
            ${
              punto.imagen_url
                ? `<img src="${punto.imagen_url}" alt="${punto.nombre || punto.titulo}" class="popup-img" />`
                : ""
            }
            <div class="popup-body">
              <span class="popup-badge" style="background-color: ${config.color}; color: ${config.textColor};">
                ${tipo}
              </span>
              <div class="popup-titulo">${punto.nombre || punto.titulo}</div>
              ${
                punto.descripcion
                  ? `<div class="popup-desc">${punto.descripcion}</div>`
                  : ""
              }
              <a href="${rutaDetalle}" class="popup-link">Ver detalle →</a>
            </div>
          </div>
        `;

        // ── CREAR MARCADOR ──
        const marcador = L.marker([punto.latitud, punto.longitud], {
          icon: icono,
        });

        // Popup con el contenido custom
        marcador.bindPopup(popupHtml, {
          maxWidth: 240,
          minWidth: 240,
          closeButton: true,
        });

        // Al hacer click en el marcador → notificar al padre
        marcador.on("click", () => {
          onPuntoClick(punto);
        });

        // Agregar a la capa correspondiente
        marcador.addTo(capasRef.current[tipo]);
        marcadoresRef.current[punto.id] = marcador;
      });
    });
  }, [puntos]); // Se re-ejecuta cuando cambia la lista de puntos

  // ── APLICAR FILTROS DE VISIBILIDAD ──
  // Muestra u oculta capas según capasVisibles
  useEffect(() => {
    if (!leafletRef.current) return;

    Object.entries(capasRef.current).forEach(([tipo, capa]) => {
      const mapa = leafletRef.current;
      const visible = capasVisibles[tipo] !== false; // Default: visible

      if (visible && !mapa.hasLayer(capa)) {
        mapa.addLayer(capa);
      } else if (!visible && mapa.hasLayer(capa)) {
        mapa.removeLayer(capa);
      }
    });
  }, [capasVisibles]);

  // ── VOLAR AL PUNTO ACTIVO ──
  // Cuando se selecciona un punto en el sidebar, el mapa hace zoom
  useEffect(() => {
    if (!leafletRef.current || !puntoActivo) return;

    const marcador = marcadoresRef.current[puntoActivo];
    if (!marcador) return;

    // Animación de vuelo al marcador
    leafletRef.current.flyTo(
      marcador.getLatLng(),
      15, // Zoom al hacer click en un punto
      { animate: true, duration: 0.8 },
    );

    // Abrir el popup del marcador
    setTimeout(() => {
      marcador.openPopup();
    }, 850); // Esperar a que termine la animación

    // Actualizar clase visual del marcador activo
    Object.entries(marcadoresRef.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      const div = el.querySelector(".marcador-custom");
      if (!div) return;
      if (id === puntoActivo) {
        div.classList.add("marcador-activo");
      } else {
        div.classList.remove("marcador-activo");
      }
    });
  }, [puntoActivo]);

  // ── RENDER ──
  // Solo el div contenedor — Leaflet maneja todo el resto
  return (
    <div
      ref={mapaRef}
      className="mapa-leaflet"
      /* Accesibilidad */
      role="application"
      aria-label="Mapa interactivo del Valle de los Vientos"
    />
  );
}
