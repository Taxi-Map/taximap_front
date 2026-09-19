import { lazy } from "react";
import type { ComponentType } from "react";
import { NotFound } from "../components/ui/NotFound";

/**
 * Registo das páginas, carregadas a pedido.
 *
 * Antes as 22 páginas eram importadas estaticamente aqui, o que punha todas
 * no mesmo chunk: quem abria a homepage descarregava também a página de
 * contactos, a de parceiros e a de publicidade. Agora cada uma chega quando
 * a sua rota é visitada.
 *
 * O `NotFound` fica estático de propósito: é o ecrã de recurso quando a rota
 * não existe, e ir buscar um chunk nesse momento é a pior altura possível.
 *
 * As páginas exportam nomes, não `default`, por isso cada import é mapeado
 * para a forma que o `lazy` espera.
 */
function page(
	loader: () => Promise<Record<string, unknown>>,
	name: string,
): ComponentType {
	return lazy(async () => ({
		default: (await loader())[name] as ComponentType,
	}));
}

// --- Institucional ---
const AboutPage = page(() => import("./Institutional/AboutPage"), "AboutPage");
const ChallengesPage = page(() => import("./Institutional/ChallengesPage"), "ChallengesPage");
const DifferentialPage = page(() => import("./Institutional/DifferentialPage"), "DifferentialPage");
const BenefitsPage = page(() => import("./Institutional/BenefitsPage"), "BenefitsPage");
const ImpactPage = page(() => import("./Institutional/ImpactPage"), "ImpactPage");
const TargetPage = page(() => import("./Institutional/TargetPage"), "TargetPage");
const TeamPage = page(() => import("./Institutional/TeamPage"), "TeamPage");
const ContactPage = page(() => import("./Institutional/ContactPage"), "ContactPage");
const HistoryPage = page(() => import("./Institutional/HistoryPage"), "HistoryPage");
const NewsPage = page(() => import("./Institutional/NewsPage"), "NewsPage");

// --- Particulares ---
const AppPage = page(() => import("./Individuals/AppPage"), "AppPage");
const HowItWorksPage = page(() => import("./Individuals/HowItWorksPage"), "HowItWorksPage");
const CommunityPage = page(() => import("./Individuals/CommunityPage"), "CommunityPage");
const FaqPage = page(() => import("./Individuals/FaqPage"), "FaqPage");

// --- Empresas ---
const SolutionPage = page(() => import("./Business/SolutionPage"), "SolutionPage");
const FeaturesPage = page(() => import("./Business/FeaturesPage"), "FeaturesPage");
const PlansPage = page(() => import("./Business/PlansPage"), "PlansPage");

// --- Parceiros ---
const PartnersPage = page(() => import("./Partners/PartnersPage"), "PartnersPage");
const IntegrationsPage = page(() => import("./Partners/IntegrationsPage"), "IntegrationsPage");
const AdvertisingPage = page(() => import("./Partners/AdvertisingPage"), "AdvertisingPage");

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
	// Os dois pares abaixo partilham a mesma instância, logo partilham o chunk.
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
