import "@/styles/demografia.css"

export default function Demografia(){
	return (
		<div className="demografia-container">
			<h4 className="titulo">🕵️‍♂️ Demografía Actualizada</h4>
			<div className="info-container">
				<div className="info-card">
					<div className="info-icon">😎</div>
					<div className="info-text-demo">
						<h5>Censo 2017 (INEI)</h5>
						<p>3,980</p>
						<span>Habitantes</span>
					</div>
				</div>
				<div className="info-card">
					<div className="info-icon">😎</div>
					<div className="info-text-demo">
						<h5>Proyección 2026 (INEI)</h5>
						<p>2,950</p>
						<span>Habitantes</span>
					</div>
				</div>
				<div className="info-card">
					<div className="info-icon">😎</div>
					<div className="info-text-demo">
						<h5>Densidad</h5>
						<p>6.73 hab/km²</p>
						<span>aprox.</span>
					</div>
				</div>
			</div>
		</div>
	)
}