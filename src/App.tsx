import { useParams, useLocation } from "react-router-dom";
import { TopHeader } from "./components/ui/TopHeader";
import { Header } from "./components/ui/Header";
import { Hero } from "./components/ui/Hero";
import { NotFound } from "./components/ui/NotFound";
import { pageRegistry } from "./pages/pageRegistry";
import { TAB_SLUG_TO_INDEX, SLUG_TO_PAGE_ID } from "./pages/routeConfig";
import { usePageTitle, useScrollToTop } from "./hooks";
import "./App.css";

function App() {
	const { tabSlug, pageSlug } = useParams();
	const location = useLocation();

	usePageTitle();
	useScrollToTop();

	const isTabGiven = tabSlug !== undefined;
	const isPageGiven = pageSlug !== undefined;

	const isCatchAll = tabSlug === undefined && pageSlug === undefined && location.pathname !== "/";

	const activeTab = isTabGiven ? (TAB_SLUG_TO_INDEX[tabSlug] ?? -1) : 0;
	const activePageId = isPageGiven ? (SLUG_TO_PAGE_ID[pageSlug] ?? null) : null;

	const isInvalidTab = isTabGiven && activeTab === -1;
	const isInvalidPage = isPageGiven && activePageId === null;
	const isNotFound = isInvalidTab || isInvalidPage || isCatchAll;

	const resolvedTab = isInvalidTab ? 0 : activeTab;

	const PageComponent =
		!isNotFound && activePageId !== null
			? (pageRegistry[activePageId] ?? null)
			: null;

	return (
		<div className="app-container flex flex-col min-h-dvh w-full">
			<TopHeader activeTab={resolvedTab} />
			<Header
				activeTab={resolvedTab}
				activePage={activePageId}
			/>

			{isNotFound ? (
				<div className="flex-1 flex flex-col pt-6 md:pt-8">
					<NotFound />
				</div>
			) : PageComponent ? (
				<div className="flex-1 flex flex-col pt-6 md:pt-8">
					<PageComponent />
				</div>
			) : (
				<Hero />
			)}
		</div>
	);
}

export default App;
