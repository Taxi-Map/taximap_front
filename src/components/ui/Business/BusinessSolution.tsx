import { useTranslation } from "react-i18next";
import { Car, Building2, Smartphone, ShieldCheck, TrendingUp, Cpu } from "lucide-react";
import { Card3D } from "../Card3D";
import businessContent from "../../../content/Business.json";

interface BusinessSolutionProps {
	onOpenWaitlist?: () => void;
}

export function BusinessSolution({ onOpenWaitlist }: BusinessSolutionProps) {
	const { t } = useTranslation();

	const audTitle = t(
		businessContent.audience.titleKey,
		businessContent.audience.titleFallback
	);
	const audSubtitle = t(
		businessContent.audience.subtitleKey,
		businessContent.audience.subtitleFallback
	);

	const reasonsTitle = t(
		businessContent.reasons.titleKey,
		businessContent.reasons.titleFallback
	);
	const reasonsSubtitle = t(
		businessContent.reasons.subtitleKey,
		businessContent.reasons.subtitleFallback
	);

	const reasonIcons = [Cpu, Smartphone, ShieldCheck, TrendingUp];

	return (
		<section id="solution" className="business-section">
			<div className="container">
				{/* Section Header: Para quem é */}
				<div className="business-header">
					<h2 className="business-title">{audTitle}</h2>
					<p className="business-subtitle">{audSubtitle}</p>
				</div>

				{/* Audience Cards (Empresas de Táxi vs Clientes Corporativos) - 3D Card Layout */}
				<div className="business-grid-2" style={{ marginBottom: "var(--spacing-20)" }}>
					{/* Card 1: Empresas de Táxi & Operadores de Frota */}
					<Card3D
						title={t(
							businessContent.audience.items[0].titleKey,
							businessContent.audience.items[0].titleFallback
						)}
						description={t(
							businessContent.audience.items[0].descKey,
							businessContent.audience.items[0].descFallback
						)}
						icon={Car}
						badge={t(
							businessContent.audience.items[0].badgeKey,
							businessContent.audience.items[0].badgeFallback
						)}
						actionText="Candidatar a empresa piloto"
						onAction={onOpenWaitlist}
					/>

					{/* Card 2: Clientes Corporativos */}
					<Card3D
						title={t(
							businessContent.audience.items[1].titleKey,
							businessContent.audience.items[1].titleFallback
						)}
						description={t(
							businessContent.audience.items[1].descKey,
							businessContent.audience.items[1].descFallback
						)}
						icon={Building2}
						badge={t(
							businessContent.audience.items[1].badgeKey,
							businessContent.audience.items[1].badgeFallback
						)}
						actionText="Ajudar a moldar o produto"
						onAction={onOpenWaitlist}
					/>
				</div>

				{/* Section Header: Porque Escolher o Táxi Map */}
				<div className="business-benefits-banner" style={{ marginTop: 0, paddingTop: "var(--spacing-16)" }}>
					<div className="business-header">
						<span className="business-benefits-badge">
							Posicionamento único
						</span>
						<h3 className="business-title">{reasonsTitle}</h3>
						<p className="business-subtitle">{reasonsSubtitle}</p>
					</div>

					<div className="business-grid-2">
						{businessContent.reasons.items.map((reason, idx) => {
							const IconComponent = reasonIcons[idx] || Cpu;
							const rTitle = t(reason.titleKey, reason.titleFallback);
							const rDesc = t(reason.descKey, reason.descFallback);

							return (
								<Card3D
									key={idx}
									title={rTitle}
									description={rDesc}
									icon={IconComponent}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
