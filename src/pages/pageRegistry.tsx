import type { ComponentType } from "react";
import { ComingSoon } from "../components/ui/ComingSoon";
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
} from "./Institutional";
import { AppPage, HowItWorksPage } from "./Individuals";
import { SolutionPage, FeaturesPage, PlansPage } from "./Business";
import { PartnersPage, IntegrationsPage } from "./Partners";

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
	community: ComingSoon,
	news: ComingSoon,
	faq: ComingSoon,
	history: ComingSoon,
	advertising: ComingSoon,
	_not_found: NotFound,
};
