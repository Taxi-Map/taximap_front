import { Hero } from "../Hero";
import { BusinessSolution } from "./BusinessSolution";
import { BusinessFeatures } from "./BusinessFeatures";
import { BusinessPlans } from "./BusinessPlans";
import { BusinessFaq } from "./BusinessFaq";
import "./Business.css";

interface BusinessPageProps {
	onOpenWaitlist?: () => void;
}

export function BusinessPage({ onOpenWaitlist }: BusinessPageProps) {
	return (
		<div className="business-page flex flex-col w-full">
			<Hero audience="empresa" onCtaClick={onOpenWaitlist} />
			<BusinessSolution onOpenWaitlist={onOpenWaitlist} />
			<BusinessFeatures />
			<BusinessPlans onOpenWaitlist={onOpenWaitlist} />
			<BusinessFaq />
		</div>
	);
}
