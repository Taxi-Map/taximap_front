import { useSyncExternalStore } from "react";
import "./RouteMap.css";

/**
 * Diagrama estilizado de uma rota de candongueiro sobre Luanda.
 *
 * O ativo mais difícil de copiar do Táxi Map não é o mapa — é o conhecimento
 * das rotas informais. Por isso o que se desenha aqui é uma rota com o nome das
 * paragens a aparecer, não um mapa genérico com pontos a mexer: um mapa diz
 * "sabemos desenhar mapas", uma rota com nomes de bairros diz "conhecemos estas
 * ruas".
 *
 * É ilustração, não dados ao vivo. Quem usa este componente tem de rotular isso
 * de forma visível — ver a prop `caption` de quem o consome.
 */

interface RouteMapProps {
	variant?: "light" | "night";
	/** Mostrar os nomes das paragens. Desligado na faixa escura, onde competiria com o texto do CTA. */
	showLabels?: boolean;
	/** Mostrar o veículo a percorrer a rota. */
	showVehicle?: boolean;
	className?: string;
}

/** Traçado principal, em coordenadas do viewBox 0 0 800 460. */
const MAIN_ROUTE =
	"M 62 372 C 150 358 196 322 250 300 C 314 274 352 246 404 236 C 470 223 512 196 556 160 C 596 128 656 112 736 104";

const SECONDARY_ROUTE =
	"M 96 132 C 178 150 232 186 296 208 C 372 234 428 268 486 300 C 546 333 622 350 726 356";

/** Malha de ruas de fundo — abstrata, só para dar textura urbana. */
const STREETS = [
	"M 0 196 L 800 152",
	"M 0 268 L 800 232",
	"M 0 120 L 800 300",
	"M 168 0 L 224 460",
	"M 356 0 L 396 460",
	"M 548 0 L 578 460",
	"M 690 0 L 706 460",
	"M 0 344 L 800 320",
];

/** Paragens ao longo do traçado principal. Bairros reais de Luanda. */
const STOPS = [
	{ x: 62, y: 372, name: "Zango", anchor: "start" as const },
	{ x: 250, y: 300, name: "Viana", anchor: "middle" as const },
	{ x: 404, y: 236, name: "Cazenga", anchor: "middle" as const },
	{ x: 556, y: 160, name: "Rangel", anchor: "middle" as const },
	{ x: 736, y: 104, name: "Maianga", anchor: "end" as const },
];

/** Pontos de GPS a pulsar, só na variante noturna. */
const PULSES = [
	{ x: 196, y: 322 },
	{ x: 352, y: 258 },
	{ x: 512, y: 186 },
	{ x: 486, y: 300 },
	{ x: 296, y: 208 },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
	const mq = window.matchMedia(REDUCED_MOTION_QUERY);
	mq.addEventListener("change", onChange);
	return () => mq.removeEventListener("change", onChange);
}

/**
 * Lê a preferência de movimento reduzido. Usa `useSyncExternalStore` porque a
 * media query é uma fonte externa: subscrever com `useEffect` + `setState`
 * causaria uma renderização em cascata e um primeiro frame com o valor errado.
 */
function usePrefersReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribeToReducedMotion,
		() => window.matchMedia(REDUCED_MOTION_QUERY).matches,
		() => false, // no servidor assume-se movimento permitido
	);
}

export function RouteMap({
	variant = "light",
	showLabels = true,
	showVehicle = true,
	className = "",
}: RouteMapProps) {
	const reducedMotion = usePrefersReducedMotion();
	const isNight = variant === "night";

	return (
		<svg
			className={`routemap routemap--${variant} ${className}`}
			viewBox="0 0 800 460"
			preserveAspectRatio="xMidYMid slice"
			role="presentation"
			aria-hidden="true"
			focusable="false"
		>
			{/* Malha urbana de fundo */}
			<g>
				{STREETS.map((d, i) => (
					<path key={i} className="routemap-street" d={d} />
				))}
			</g>

			{/* Pulsos de GPS — só à noite, onde leem como sinal e não como ruído */}
			{isNight && (
				<g>
					{PULSES.map((p, i) => (
						<circle
							key={i}
							className="routemap-pulse"
							cx={p.x}
							cy={p.y}
							r={3.5}
							style={{ animationDelay: `${i * 0.45}s` }}
						/>
					))}
				</g>
			)}

			{/* Rota secundária, para a malha não parecer uma linha só */}
			<path
				className="routemap-route routemap-route--secondary"
				d={SECONDARY_ROUTE}
				style={{ "--route-len": 1200 } as React.CSSProperties}
			/>

			{/* A rota principal, que se desenha */}
			<path
				className="routemap-route"
				d={MAIN_ROUTE}
				style={{ "--route-len": 1100 } as React.CSSProperties}
			/>

			{/* Paragens, a aparecer à medida que a linha passa por elas */}
			<g>
				{STOPS.map((stop, i) => {
					const delay = 0.4 + i * 0.62;
					return (
						<g key={stop.name}>
							<g
								className="routemap-stop"
								style={{
									animationDelay: `${delay}s`,
									transformOrigin: `${stop.x}px ${stop.y}px`,
								}}
							>
								<circle
									className="routemap-stop-core"
									cx={stop.x}
									cy={stop.y}
									r={6.5}
								/>
								<circle
									className="routemap-stop-ring"
									cx={stop.x}
									cy={stop.y}
									r={6.5}
								/>
							</g>
							{showLabels && (
								<text
									className="routemap-label"
									x={stop.x}
									y={stop.y - 16}
									textAnchor={stop.anchor}
									style={{ animationDelay: `${delay + 0.15}s` }}
								>
									{stop.name}
								</text>
							)}
						</g>
					);
				})}
			</g>

			{/* Carrinha a percorrer o traçado */}
			{showVehicle && !reducedMotion && (
				<g>
					<circle className="routemap-vehicle-body" r={7} cx={0} cy={0}>
						<animateMotion
							dur="7s"
							repeatCount="indefinite"
							begin="2.6s"
							path={MAIN_ROUTE}
							rotate="auto"
						/>
					</circle>
				</g>
			)}
		</svg>
	);
}
