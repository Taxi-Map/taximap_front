import { Hero } from "../Hero";
import { BusinessSolution } from "./BusinessSolution";
import { BusinessFeatures } from "./BusinessFeatures";
import { BusinessIntelligence } from "./BusinessIntelligence";
import { BusinessPlans } from "./BusinessPlans";
import { BusinessFaq } from "./BusinessFaq";
import { APP_EMPRESAS_URL } from "../../../lib/appLinks";
import "./Business.css";

interface BusinessPageProps {
	onOpenWaitlist?: () => void;
}

export function BusinessPage({ onOpenWaitlist }: BusinessPageProps) {
	return (
		<div className="business-page flex flex-col w-full">
			<Hero audience="empresa" ctaHref={APP_EMPRESAS_URL} />
			<BusinessSolution onOpenWaitlist={onOpenWaitlist} />
			<BusinessFeatures />
			<BusinessIntelligence />
			<BusinessPlans onOpenWaitlist={onOpenWaitlist} />
			<BusinessFaq />
		</div>
	);
}
