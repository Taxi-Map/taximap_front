import type { ComponentType } from "react";
import { NotFound } from "../components/ui/NotFound";
import {
	AboutPage,
	ChallengesPage,
	DifferentialPage,
	BenefitsPage,
	ImpactPage,
	TargetPage,
	TeamPage,
	ContactPage,
	HistoryPage,
	NewsPage,
} from "./Institutional";
import { AppPage, HowItWorksPage, CommunityPage, FaqPage } from "./Individuals";
import { SolutionPage, FeaturesPage, PlansPage } from "./Business";
import { PartnersPage, IntegrationsPage, AdvertisingPage } from "./Partners";

export const pageRegistry: Record<string, ComponentType> = {
	about: AboutPage,
	challenges: ChallengesPage,
	differential: DifferentialPage,
	benefits: BenefitsPage,
	impact: ImpactPage,
	target: TargetPage,
	team: TeamPage,
	contact: ContactPage,
	app: AppPage,
	"how-it-works": HowItWorksPage,
	solution: SolutionPage,
	features: FeaturesPage,
	plans: PlansPage,
	partners: PartnersPage,
	"become-partner": PartnersPage,
	apis: IntegrationsPage,
	integrations: IntegrationsPage,
	community: CommunityPage,
	news: NewsPage,
	faq: FaqPage,
	history: HistoryPage,
	advertising: AdvertisingPage,
	_not_found: NotFound,
};
