import { Hero } from "../Hero";
import { BusinessSolution } from "./BusinessSolution";
import { BusinessFeatures } from "./BusinessFeatures";
import { BusinessPlans } from "./BusinessPlans";
import { Faq } from "../Faq";
import "./Business.css";

interface BusinessPageProps {
	onOpenWaitlist?: () => void;
}

export function BusinessPage({ onOpenWaitlist }: BusinessPageProps) {
	return (
		<div className="business-page flex flex-col w-full">
			<Hero />
			<BusinessSolution />
			<BusinessFeatures />
			<BusinessPlans onOpenWaitlist={onOpenWaitlist} />
			<Faq />
		</div>
	);
}
