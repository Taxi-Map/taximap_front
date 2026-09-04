import { useEffect, useRef, useState } from "react";
import "./LuandaMap.css";

/**
 * Mapa real de Luanda para fundo do hero, com uma rota de demonstração.
 *
 * Carrega em diferido, de propósito. O MapLibre ronda os 200 kB comprimidos e
 * o site promete funcionar com ligação fraca em Luanda — se entrasse no bundle
 * principal, a promessa partia-se no primeiro ecrã. Aqui o texto e o CTA
 * pintam primeiro, o mapa chega depois, e quem estiver em 2G ou com poupança
 * de dados nunca o descarrega: fica com o diagrama SVG, que diz o mesmo.
 */

interface LuandaMapProps {
	/** Chamado quando o mapa está pronto, para o fallback poder desaparecer. */
	onReady?: () => void;
	className?: string;
}

/** Bairros reais de Luanda, na ordem em que a rota os liga. [lng, lat] */
const ROUTE_COORDS: [number, number][] = [
	[13.4180, -8.9560], // Zango
	[13.3730, -8.9040], // Viana
	[13.3180, -8.8690], // Estrada de Catete
	[13.2870, -8.8380], // Cazenga
	[13.2540, -8.8290], // Rangel
	[13.2286, -8.8221], // Maianga
];

const STOPS: { name: string; coord: [number, number] }[] = [
	{ name: "Zango", coord: ROUTE_COORDS[0] },
	{ name: "Viana", coord: ROUTE_COORDS[1] },
	{ name: "Cazenga", coord: ROUTE_COORDS[3] },
	{ name: "Rangel", coord: ROUTE_COORDS[4] },
	{ name: "Maianga", coord: ROUTE_COORDS[5] },
];

/**
 * Um mapa de 200 kB não se impõe a quem paga dados a peso de ouro nem a quem
 * pediu para poupar. Nesses casos o hero fica-se pelo diagrama SVG.
 */
function shouldSkipMap(): boolean {
	if (typeof navigator === "undefined") return true;
	const conn = (
		navigator as Navigator & {
			connection?: { saveData?: boolean; effectiveType?: string };
		}
	).connection;
	if (!conn) return false;
	if (conn.saveData) return true;
	return conn.effectiveType === "slow-2g" || conn.effectiveType === "2g";
}

export function LuandaMap({ onReady, className = "" }: LuandaMapProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (shouldSkipMap() || !containerRef.current) return;

		let cancelled = false;
		let map: { remove: () => void } | null = null;

		async function boot() {
			const { Map, Marker } = await import("maplibre-gl");
			if (cancelled || !containerRef.current) return;

			const reduceMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;

			const instance = new Map({
				container: containerRef.current,
				style: "https://tiles.openfreemap.org/styles/positron",
				center: [13.3120, -8.8720],
				zoom: 10.4,
				pitch: reduceMotion ? 0 : 42,
				bearing: reduceMotion ? 0 : -18,
				attributionControl: { compact: true },
				// É um fundo, não um mapa para explorar: não pode roubar o scroll.
				interactive: false,
			});
			map = instance;

			/*
			 * Nunca esconder o fallback sem o mapa estar mesmo pronto. Se o
			 * estilo não completar — sprites em falta, rede a meio gás, WebGL
			 * limitado — o utilizador fica com o diagrama SVG em vez de um
			 * retângulo vazio.
			 */
			instance.on("error", (event: { error?: { message?: string } }) => {
				console.error("[LuandaMap]", event?.error?.message ?? event);
			});

			const setup = () => {
				if (cancelled) return;

				instance.addSource("rota", {
					type: "geojson",
					data: {
						type: "Feature",
						properties: {},
						geometry: { type: "LineString", coordinates: ROUTE_COORDS },
					},
				});

				instance.addLayer({
					id: "rota-halo",
					type: "line",
					source: "rota",
					layout: { "line-cap": "round", "line-join": "round" },
					paint: {
						"line-color": "#6DB7E2",
						"line-width": 14,
						"line-opacity": 0.25,
						"line-blur": 6,
					},
				});

				instance.addLayer({
					id: "rota-linha",
					type: "line",
					source: "rota",
					layout: { "line-cap": "round", "line-join": "round" },
					paint: { "line-color": "#4F9DC9", "line-width": 4 },
				});

				for (const stop of STOPS) {
					const el = document.createElement("div");
					el.className = "luandamap-stop";
					el.innerHTML = `<span class="luandamap-stop-dot"></span><span class="luandamap-stop-name">${stop.name}</span>`;
					new Marker({ element: el, anchor: "left" })
						.setLngLat(stop.coord)
						.addTo(instance);
				}

				setVisible(true);
				onReady?.();
			};

			// O mapa pode já estar pronto quando chegamos aqui.
			if (instance.isStyleLoaded()) {
				setup();
			} else {
				instance.once("load", setup);
			}
		}

		// Só depois do conteúdo principal estar pintado.
		const idle = window.requestIdleCallback
			? window.requestIdleCallback(() => void boot(), { timeout: 2000 })
			: window.setTimeout(() => void boot(), 600);

		return () => {
			cancelled = true;
			if (window.cancelIdleCallback && typeof idle === "number") {
				window.cancelIdleCallback(idle);
			} else {
				clearTimeout(idle as number);
			}
			map?.remove();
		};
	}, [onReady]);

	return (
		<div
			ref={containerRef}
			className={`luandamap ${visible ? "is-visible" : ""} ${className}`}
			aria-hidden="true"
		/>
	);
}
