import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Compass, Home, Mail, HelpCircle } from "lucide-react";
import { PAGE_SLUGS } from "../../../pages/routeConfig";
import "./NotFound.css";

/*
 * Os destinos derivam do routeConfig, que é a fonte de verdade dos slugs.
 * Antes estavam escritos à mão como /institucional/quem-somos e
 * /particulares/aplicacao — caminhos aninhados que não existem, porque as
 * rotas do site são planas. Os quatro atalhos da página 404 levavam todos a
 * outra 404.
 */
const suggestions = [
	{ icon: Home, labelKey: "nav.about", to: `/${PAGE_SLUGS.about}` },
	{ icon: Compass, labelKey: "nav.app", to: `/${PAGE_SLUGS.app}` },
	{ icon: Mail, labelKey: "nav.contact", to: `/${PAGE_SLUGS.contact}` },
	{ icon: HelpCircle, labelKey: "nav.faq", to: `/${PAGE_SLUGS.faq}` },
];

export function NotFound() {
	const { t } = useTranslation();

	return (
		<main className="notfound">
			<div className="notfound-grid" aria-hidden="true" />

			<svg className="notfound-route" aria-hidden="true">
				<path
					d="M0,100 C200,200 300,50 500,150 S700,100 800,200"
					stroke="var(--color-primary)"
					strokeWidth="1.5"
					fill="none"
					strokeOpacity="0.12"
					strokeDasharray="8 6"
					className="animate-route-pulse"
				/>
				<circle cx="500" cy="150" r="4" fill="var(--color-primary)" className="animate-pulse-dot" />
				<circle cx="200" cy="120" r="2.5" fill="var(--color-primary)" fillOpacity="0.4" />
				<circle cx="700" cy="130" r="2.5" fill="var(--color-primary)" fillOpacity="0.4" />
			</svg>

			<div className="notfound-inner">
				<div className="notfound-marker">
					<div className="notfound-marker-ping animate-ping" aria-hidden="true" />
					<div className="notfound-marker-disc">
						<MapPin size={48} aria-hidden="true" />
					</div>
					<div className="notfound-marker-badge" aria-hidden="true">
						?
					</div>
				</div>

				<h1 className="notfound-code">404</h1>

				<p className="notfound-tagline">{t("notFound.tagline")}</p>

				<p className="notfound-description">{t("notFound.description")}</p>

				<Link to="/" className="notfound-cta">
					<Home size={16} aria-hidden="true" />
					{t("notFound.cta")}
				</Link>

				<div className="notfound-suggestions">
					<p className="notfound-suggestions-label">
						{t("notFound.suggestions", "Destinos úteis")}
					</p>
					<div className="notfound-chips">
						{suggestions.map((s) => (
							<Link key={s.to} to={s.to} className="notfound-chip">
								<s.icon size={16} aria-hidden="true" />
								{t(s.labelKey)}
							</Link>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
