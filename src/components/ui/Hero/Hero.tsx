import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import { RouteMap } from "../RouteMap";
import { LuandaMap } from "../LuandaMap";
import heroContent from "../../../content/Hero.json";
import "./Hero.css";

interface HeroProps {
	/** Define o copy por omissão. A página Empresas fala a um público diferente. */
	audience?: "particular" | "empresa";
	onCtaClick?: () => void;
}

export function Hero({ audience = "particular", onCtaClick }: HeroProps) {
	const { t } = useTranslation();
	const [mapReady, setMapReady] = useState(false);

	const handleMapReady = useCallback(() => setMapReady(true), []);

	/*
	 * O copy do hero vive no código, de propósito.
	 *
	 * Antes vinha inteiramente do Contentful e o componente devolvia null
	 * quando o CMS não respondia — uma falha de rede deixava a homepage sem
	 * hero. Pior: a frase que distingue o Táxi Map de TVDE, que é a coisa mais
	 * importante que o site tem para dizer, podia ser alterada sem revisão e
	 * estava de facto substituída por copy de merchandising.
	 */
	const defaults = heroContent[audience];

	const eyebrow = t(defaults.eyebrow.key, defaults.eyebrow.fallback) as string;
	const title = t(defaults.title.key, defaults.title.fallback) as string;
	const description = t(
		defaults.description.key,
		defaults.description.fallback,
	) as string;
	const ctaLabel = t(defaults.cta.key, defaults.cta.fallback) as string;
	const mapCaption = t(
		heroContent.mapCaption.key,
		heroContent.mapCaption.fallback,
	) as string;

	return (
		<section className="hero-section">
			{/*
			  Duas camadas de fundo. O diagrama SVG pinta de imediato e sem rede;
			  o mapa real chega depois e substitui-o. Quem estiver em 2G ou com
			  poupança de dados fica no SVG e não descarrega o MapLibre.
			*/}
			<div className="hero-backdrop">
				<div className={`hero-backdrop-svg ${mapReady ? "is-hidden" : ""}`}>
					<RouteMap variant="light" showVehicle={!mapReady} />
				</div>
				<LuandaMap onReady={handleMapReady} />
				<div className="hero-scrim" />
			</div>

			<div className="container hero-content">
				<span className="hero-eyebrow">{eyebrow}</span>
				<h1 className="hero-title">{title}</h1>
				<p className="hero-description">{description}</p>
				<div className="hero-actions">
					{onCtaClick ? (
						<Button onClick={onCtaClick}>{ctaLabel}</Button>
					) : (
						<Button href="#app">{ctaLabel}</Button>
					)}
				</div>
			</div>

			{/* Nunca apresentar a rota como dados ao vivo. */}
			<span className="hero-map-caption">{mapCaption}</span>
		</section>
	);
}
