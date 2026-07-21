import { useParams } from "react-router-dom";
import { TopHeader } from "./components/ui/TopHeader";
import { Header } from "./components/ui/Header";
import { Hero } from "./components/ui/Hero";
import { pageRegistry } from "./pages/pageRegistry";
import { TAB_SLUG_TO_INDEX, SLUG_TO_PAGE_ID } from "./pages/routeConfig";
import { usePageTitle, useScrollToTop } from "./hooks";
import "./App.css";

function App() {
	const { tabSlug, pageSlug } = useParams();

	usePageTitle();
	useScrollToTop();

	const activeTab = tabSlug !== undefined ? (TAB_SLUG_TO_INDEX[tabSlug] ?? 0) : 0;
	const activePage = pageSlug !== undefined ? (SLUG_TO_PAGE_ID[pageSlug] ?? null) : null;

	const PageComponent = activePage ? pageRegistry[activePage] : null;

	return (
		<div className="app-container flex flex-col min-h-dvh w-full">
			<TopHeader activeTab={activeTab} />
			<Header
				activeTab={activeTab}
				activePage={activePage}
			/>

			{PageComponent ? <PageComponent /> : <Hero />}
		</div>
	);
}

export default App;
