// app/page.js — VERSIÓN ACTUALIZADA CON SUPABASE
// ─────────────────────────────────────────────────────
// Ahora los lugares destacados vienen de Supabase
// ─────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CardLugar from "@/components/CardLugar";
import "@/styles/home.css";

const IconLogin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10,17 15,12 10,7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// Estadísticas estáticas (en Fase 8 las hacemos dinámicas con COUNT)
// 🔧 PERSONALIZABLE
const STATS = [
  { value: "4500", label: "Habitantes", color: "blue" },
  { value: "320 km²", label: "Extensión", color: "yellow" },
  { value: "12", label: "Festividades/año", color: "cyan" },
  { value: "8", label: "Sitios turísticos", color: "red" },
];

export default function HomePage() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [textoExpandido, setTextoExpandido] = useState(false);

  useEffect(() => {
    async function cargarDestacados() {
      try {
        const { data, error } = await supabase
          .from("lugares")
          .select("*")
          .eq("activo", true)
          .eq("destacado", true)
          .limit(3)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setDestacados(data || []);
      } catch (err) {
        console.error("Error cargando destacados:", err);
        // Opcional: muestra un mensaje amigable al usuario
      } finally {
        setLoading(false);
      }
    }
    cargarDestacados();
  }, []);

  // Detectar móvil por ancho de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determinar cuántos mostrar según dispositivo
  const displayedDestacados = isMobile ? destacados.slice(0, 1) : destacados;

  // Texto completo de la historia (puedes extraerlo a una constante)
  const historiaCompleta = (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et
        turpis in erat facilisis tristique quis id tortor. In pellentesque
        imperdiet tempor. Duis a tortor tristique, laoreet ex a, placerat purus.
        Aliquam erat volutpat. Ut luctus lacus pharetra ex eleifend, vitae
        egestas mauris sodales. Curabitur metus ipsum, convallis sed sapien nec,
        malesuada ultricies orci. Etiam quis sem tincidunt, feugiat lacus vitae,
        porttitor dolor. Mauris malesuada sapien id imperdiet ullamcorper. Sed
        facilisis consectetur purus et ultrices. Suspendisse consequat rutrum
        ligula sit amet feugiat.
      </p>
      <p>
        Suspendisse feugiat congue pretium. Aliquam tincidunt mauris neque, sed
        rutrum odio molestie at. Mauris porta, lorem venenatis dictum tincidunt,
        dui quam interdum sem, non cursus elit velit ut sapien. Quisque feugiat
        ex at urna convallis mattis. Suspendisse eget vulputate nisi. Etiam sem
        leo, ornare a maximus in, fermentum vel nibh. In eu interdum odio, ac
        aliquet justo. Aenean sapien ex, luctus eget elit eu, efficitur rhoncus
        ante.
      </p>
      <p>
        Sed convallis facilisis nisl, non sodales mi sollicitudin at. Duis
        tempus dignissim ultricies. Cras eget sodales leo. Donec vel arcu sem.
        Maecenas enim mi, feugiat vel commodo in, fermentum a nunc. Nulla quis
        urna ipsum. Proin at orci dapibus, sodales risus sed, dictum erat. In
        placerat ut ante at congue. Nunc quis pretium lorem. Aenean aliquam sit
        amet velit non sodales. Etiam a nunc tristique magna venenatis aliquam.
        Fusce sollicitudin cursus nisi vitae finibus. Donec in enim non libero
        tincidunt semper eu sit amet ipsum.
      </p>
      <p>
        Morbi feugiat est dui, eget aliquet est laoreet eu. Sed dapibus tortor
        ornare, luctus odio id, sagittis turpis. Ut nibh diam, convallis a
        ultricies vel, venenatis et augue. Vestibulum nec scelerisque nunc. Cras
        sit amet ullamcorper tortor. Proin non commodo libero. Donec finibus
        enim enim, quis dictum arcu vehicula in. Etiam sodales tortor ac euismod
        laoreet. Fusce nec nisi porta, euismod massa sed, tincidunt justo.
        Curabitur feugiat rutrum nisl eget faucibus. Phasellus est turpis,
        dignissim non bibendum ut, congue tincidunt nisl. Sed sit amet gravida
        libero. Donec in augue eros. Nunc semper cursus magna quis tempor.
        Aenean lacinia molestie ligula, ut auctor tellus egestas ac.
      </p>
      <p>
        Vestibulum eleifend semper lorem, et sagittis est porta quis. Orci
        varius natoque penatibus et magnis dis parturient montes, nascetur
        ridiculus mus. Proin sit amet nibh ligula. Curabitur egestas porttitor
        auctor. In semper, sem tempus gravida imperdiet, erat magna pulvinar
        dui, a consequat elit diam ut est. Quisque nec lacinia est. Mauris
        tristique aliquam ante, finibus gravida sapien porttitor et.
      </p>
    </>
  );

  // Resumen: primeros 280 caracteres (sin etiquetas HTML)
  const textoPlano =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et turpis in erat facilisis tristique quis id tortor. In pellentesque imperdiet tempor. Duis a tortor tristique, laoreet ex a, placerat purus. Aliquam erat volutpat. Ut luctus lacus pharetra ex eleifend, vitae egestas mauris sodales. Curabitur metus ipsum, convallis sed sapien nec, malesuada ultricies orci. Etiam quis sem tincidunt, feugiat lacus vitae, porttitor dolor. Mauris malesuada sapien id imperdiet ullamcorper. Sed facilisis consectetur purus et ultrices. Suspendisse consequat rutrum ligula sit amet feugiat.";
  const resumen =
    textoPlano.slice(0, 280) + (textoPlano.length > 280 ? "..." : "");

  return (
    <div>
      {/* ── HERO ── */}
      {/* 🔧 PERSONALIZABLE: Cambia la imagen por tu distrito */}
      <section className="hero">
        <img
          src="https://res.cloudinary.com/dbal2qcrz/image/upload/v1775683497/_DSC0670_nczgke.jpg"
          alt="Valle de los Vientos"
          className="hero-image"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Valle de los Vientos</h1>
          <p className="hero-description">
            Un distrito envuelto en montañas, brumas y tradiciones milenarias.
            Sus tierras fértiles, sus fiestas vibrantes y la calidez de su gente
            lo convierten en un destino que no olvidas.
          </p>
        </div>
      </section>

      {/* ── ESTADÍSTICAS ── */}
      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className={`stat-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* INFORMACION DE PORQUE LOGUEARCE */}
      <section className="section">
        <div className="Main_login">
          <p>
            Comparte tu experiencia en nuestro distrito con toda la comunidad.
            Si deseas publicar tu negocio, producto o servicio, inicia sesión y
            cuéntanos lo que quieras mostrar al mundo.
          </p>
          <Link href="/login" className="btn-login">
            <IconLogin />
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* ── SITIOS DESTACADOS ── */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Sitios Turísticos</h2>
          <Link href="/lugares" className="section-link">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="cards-grid">
            {/* En móvil mostramos 1 skeleton, en escritorio 3 */}
            {Array.from({ length: isMobile ? 1 : 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 280,
                  borderRadius: 12,
                  background:
                    "linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                  border: "1px solid #1f1f1f",
                }}
              />
            ))}
          </div>
        ) : displayedDestacados.length > 0 ? (
          <div className="cards-grid">
            {displayedDestacados.map((lugar) => (
              <CardLugar key={lugar.id} lugar={lugar} variante="normal" />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay sitios destacados todavía.</p>
          </div>
        )}
      </section>

      {/* SECCION DE HISTORIA Y CULTURA (PUEDES PERSONALIZAR EL TEXTO) */}
      <section className="section">
        <div className="section_hitoria">
          <h1 className="title-main">Pampas travel</h1>
          {isMobile ? (
            // Vista móvil con "Leer más/Leer menos"
            <>
              {!textoExpandido ? (
                <>
                  <p>{resumen}</p>
                  <button
                    className="btn-leer-mas"
                    onClick={() => setTextoExpandido(true)}
                  >
                    Leer más
                  </button>
                </>
              ) : (
                <>
                  {historiaCompleta}
                  <button
                    className="btn-leer-menos"
                    onClick={() => setTextoExpandido(false)}
                  >
                    Leer menos
                  </button>
                </>
              )}
            </>
          ) : (
            // Escritorio: mostrar todo el texto sin botones
            historiaCompleta
          )}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Próximamente...</h2>
        <p>
          ¡Estamos preparando más contenido para ti! Estadísticas dinámicas,
          eventos en vivo y mucho más.
        </p>
      </section>
    </div>
  );
}
