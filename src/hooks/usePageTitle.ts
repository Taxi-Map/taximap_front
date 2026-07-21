import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SLUG_TO_PAGE_ID } from "../pages/routeConfig";

const PAGE_TITLE_KEY_MAP: Record<string, string> = {
	about: "nav.about",
	challenges: "nav.challenges",
	differential: "nav.differential",
	benefits: "nav.benefits",
	impact: "nav.impact",
	target: "nav.target",
	team: "nav.team",
	contact: "nav.contact",
	app: "nav.app",
	"how-it-works": "nav.howItWorks",
	solution: "nav.solution",
	features: "nav.features",
	plans: "nav.plans",
	partners: "nav.partners",
	"become-partner": "nav.becomePartner",
	apis: "nav.apis",
	integrations: "nav.integrations",
	community: "nav.community",
	news: "nav.news",
	faq: "nav.faq",
	history: "nav.history",
	advertising: "nav.advertising",
};

function kebabToTitleCase(str: string): string {
	return str
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export function usePageTitle() {
	const { t } = useTranslation();
	const { pathname } = useLocation();

	useEffect(() => {
		const segments = pathname.split("/").filter(Boolean);
		const pageSlug = segments[1];

		if (pageSlug && SLUG_TO_PAGE_ID[pageSlug]) {
			const pageId = SLUG_TO_PAGE_ID[pageSlug];
			const key = PAGE_TITLE_KEY_MAP[pageId];
			const translated = key ? t(key) : null;
			const fallback = kebabToTitleCase(pageId);
			const title = translated && translated !== key ? translated : fallback;
			document.title = `${title} | Táxi Map`;
		} else {
			document.title = "Táxi Map";
		}
	}, [pathname, t]);
}
