import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import content from "../../../content/BusinessIntelligence.json";
import "./BusinessIntelligence.css";

/**
 * Fleet Intelligence.
 *
 * A secção que separa o Táxi Map de um rastreador de GPS. As outras secções
 * dizem o que a plataforma mostra; esta diz o que a empresa passa a perceber.
 *
 * Duas decisões de estrutura, ambas ancoradas no conteúdo:
 * - As seis perguntas começam todas por um interrogativo — onde, como, quando,
 *   quais. É o próprio texto a dizer que são perguntas de quem opera, e não
 *   funcionalidades; a palavra que as abre leva o peso tipográfico.
 * - "Da localização para a informação, da informação para a decisão" é uma
 *   progressão verdadeira, e por isso é desenhada como tal.
 */
export function BusinessIntelligence() {
	const { t } = useTranslation();

	return (
		<section id="intelligence" className="business-section fleet-int">
			<div className="container">
				<div className="business-header fleet-int-header">
					<span className="business-benefits-badge">
						{t(content.badgeKey, content.badgeFallback)}
					</span>
					<h2 className="business-title fleet-int-title">
						{t(content.titleKey, content.titleFallback)}
					</h2>
					<p className="business-subtitle fleet-int-lede">
						{t(content.ledeKey, content.ledeFallback)}
					</p>
				</div>

				<p className="fleet-int-intro">
					{t(content.introKey, content.introFallback)}
				</p>

				<ul className="fleet-int-list">
					{content.items.map((item) => (
						<li key={item.key} className="fleet-int-item">
							<span className="fleet-int-lead">{item.lead}</span>
							<span className="fleet-int-rest">
								{t(item.key, item.fallback)}
							</span>
						</li>
					))}
				</ul>

				{/* O resultado: de onde os dados partem e onde chegam. */}
				<div className="fleet-int-result">
					<span className="data-label fleet-int-result-label">
						{t(content.resultLabelKey, content.resultLabelFallback)}
					</span>
					<ol className="fleet-int-progression">
						{content.progression.map((step, idx) => (
							<li key={step.key} className="fleet-int-step">
								<span className="fleet-int-step-text">
									{t(step.key, step.fallback)}
								</span>
								{idx < content.progression.length - 1 && (
									<ArrowRight
										className="fleet-int-arrow"
										size={20}
										aria-hidden="true"
									/>
								)}
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
