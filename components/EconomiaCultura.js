import "@/styles/economiaCultura.css"

export default function EconomiaCultura(){
    return (
        <div className="economia-container">
            <div className="economia-card">
                <h5 className="economia-titulo">🌿 Economía y Tradiciones</h5>
                <h6 className="economia-subtitulo">Actividades Productivas</h6>
                <p>La economía del distrito se sustenta en tre ejes principales</p>
                <ul>
                    <li><span className="negrita">Agricultura:</span> Cultivos de altura como papa, trigo, cebada y maiz.</li>
                    <li><span className="negrita">Ganadería:</span> Crianza de ganado vacuno y ovino.</li>
                    <li><span className="negrita">Minería:</span> Actividad extractiva polimetálica en las zonas altes del distrito.</li>
                </ul>
            </div>
            <div className="cultura-card">
                <div>
                    <h5 className="economia-titulo">🧡 Cultura y Fe</h5>
                    <p>La festividad más importante es la celebración en honor a <span className="negrita">San Agustín</span> y <span className="negrita">Santa Rosa</span>, la cual se lleva a cabo a finales del mes de Agosto.</p>
                    <br/>
                    <p>Es el evento cultural mas relevante, donde se manifiesta el sincretismo religioso y el retorno de la diáspora pampasina.</p>
                </div>
                <div className="cultura-img">
                    <img src="./reemplazar.jpg" alt="Imagen de fiesta de Pampas"/>
                </div>
            </div>
        </div>
    )
}