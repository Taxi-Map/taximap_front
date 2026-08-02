import { useTranslation } from "react-i18next";
import { MapPin, Users, Wrench, BarChart3, AlertCircle, FileSpreadsheet } from "lucide-react";
import { Card3D } from "../Card3D";
import businessContent from "../../../content/Business.json";

export function BusinessFeatures() {
	const { t } = useTranslation();

	const title = t(
		businessContent.features.titleKey,
		businessContent.features.titleFallback
	);
	const subtitle = t(
		businessContent.features.subtitleKey,
		businessContent.features.subtitleFallback
	);

	const icons = [MapPin, Users, Wrench, BarChart3, AlertCircle, FileSpreadsheet];

	return (
		<section id="features" className="business-section bg-alt">
			<div className="container">
				{/* Section Header */}
				<div className="business-header">
					<h2 className="business-title">{title}</h2>
					<p className="business-subtitle">{subtitle}</p>
				</div>

				{/* 6 Feature Cards with 3D Parallax Effect */}
				<div className="business-grid-3">
					{businessContent.features.cards.map((card, idx) => {
						const IconComponent = icons[idx] || MapPin;
						const cardTitle = t(card.titleKey, card.titleFallback);
						const cardDesc = t(card.descKey, card.descFallback);

						return (
							<Card3D
								key={idx}
								title={cardTitle}
								description={cardDesc}
								icon={IconComponent}
							/>
						);
					})}
				</div>
			</div>
		</section>
	);
}
