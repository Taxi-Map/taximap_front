import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SLUG_TO_PAGE_ID } from "../pages/routeConfig";

export function usePageTitle() {
	const { t } = useTranslation();
	const { pathname } = useLocation();

	useEffect(() => {
		const segments = pathname.split("/").filter(Boolean);
		const pageSlug = segments[1];

		if (pageSlug && SLUG_TO_PAGE_ID[pageSlug]) {
			const pageId = SLUG_TO_PAGE_ID[pageSlug];
			const title = t(`presentation.${pageId}.title`, pageId);
			document.title = `${title} | Táxi Map`;
		} else {
			document.title = "Táxi Map";
		}
	}, [pathname, t]);
}
