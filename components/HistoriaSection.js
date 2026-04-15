"use client";

import { useState, useEffect } from "react";

const historiaCompleta = (
  <>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et turpis
      in erat facilisis tristique quis id tortor. In pellentesque imperdiet
      tempor. Duis a tortor tristique, laoreet ex a, placerat purus. Aliquam
      erat volutpat. Ut luctus lacus pharetra ex eleifend, vitae egestas mauris
      sodales. Curabitur metus ipsum, convallis sed sapien nec, malesuada
      ultricies orci. Etiam quis sem tincidunt, feugiat lacus vitae, porttitor
      dolor. Mauris malesuada sapien id imperdiet ullamcorper. Sed facilisis
      consectetur purus et ultrices. Suspendisse consequat rutrum ligula sit
      amet feugiat.
    </p>
    <p>
      Suspendisse feugiat congue pretium. Aliquam tincidunt mauris neque, sed
      rutrum odio molestie at. Mauris porta, lorem venenatis dictum tincidunt,
      dui quam interdum sem, non cursus elit velit ut sapien. Quisque feugiat ex
      at urna convallis mattis. Suspendisse eget vulputate nisi. Etiam sem leo,
      ornare a maximus in, fermentum vel nibh. In eu interdum odio, ac aliquet
      justo. Aenean sapien ex, luctus eget elit eu, efficitur rhoncus ante.
    </p>
    <p>
      Sed convallis facilisis nisl, non sodales mi sollicitudin at. Duis tempus
      dignissim ultricies. Cras eget sodales leo. Donec vel arcu sem. Maecenas
      enim mi, feugiat vel commodo in, fermentum a nunc. Nulla quis urna ipsum.
      Proin at orci dapibus, sodales risus sed, dictum erat. In placerat ut ante
      at congue. Nunc quis pretium lorem. Aenean aliquam sit amet velit non
      sodales. Etiam a nunc tristique magna venenatis aliquam. Fusce
      sollicitudin cursus nisi vitae finibus. Donec in enim non libero tincidunt
      semper eu sit amet ipsum.
    </p>
    <p>
      Morbi feugiat est dui, eget aliquet est laoreet eu. Sed dapibus tortor
      ornare, luctus odio id, sagittis turpis. Ut nibh diam, convallis a
      ultricies vel, venenatis et augue. Vestibulum nec scelerisque nunc. Cras
      sit amet ullamcorper tortor. Proin non commodo libero. Donec finibus enim
      enim, quis dictum arcu vehicula in. Etiam sodales tortor ac euismod
      laoreet. Fusce nec nisi porta, euismod massa sed, tincidunt justo.
      Curabitur feugiat rutrum nisl eget faucibus. Phasellus est turpis,
      dignissim non bibendum ut, congue tincidunt nisl. Sed sit amet gravida
      libero. Donec in augue eros. Nunc semper cursus magna quis tempor. Aenean
      lacinia molestie ligula, ut auctor tellus egestas ac.
    </p>
    <p>
      Vestibulum eleifend semper lorem, et sagittis est porta quis. Orci varius
      natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
      Proin sit amet nibh ligula. Curabitur egestas porttitor auctor. In semper,
      sem tempus gravida imperdiet, erat magna pulvinar dui, a consequat elit
      diam ut est. Quisque nec lacinia est. Mauris tristique aliquam ante,
      finibus gravida sapien porttitor et.
    </p>
  </>
);

const textoPlano =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris et turpis in erat facilisis tristique quis id tortor. In pellentesque imperdiet tempor. Duis a tortor tristique, laoreet ex a, placerat purus. Aliquam erat volutpat. Ut luctus lacus pharetra ex eleifend, vitae egestas mauris sodales. Curabitur metus ipsum, convallis sed sapien nec, malesuada ultricies orci. Etiam quis sem tincidunt, feugiat lacus vitae, porttitor dolor. Mauris malesuada sapien id imperdiet ullamcorper. Sed facilisis consectetur purus et ultrices. Suspendisse consequat rutrum ligula sit amet feugiat"; // copia el texto plano
const resumen =
  textoPlano.slice(0, 280) + (textoPlano.length > 280 ? "..." : "");

export default function HistoriaSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [textoExpandido, setTextoExpandido] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="section">
      <div className="section_hitoria">
        <h1 className="title-main">Pampas travel</h1>
        {isMobile ? (
          !textoExpandido ? (
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
          )
        ) : (
          historiaCompleta
        )}
      </div>
    </section>
  );
}
