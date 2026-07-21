import { useState } from "react";
import { TopHeader } from "./components/ui/TopHeader";
import { Header } from "./components/ui/Header";
import { Hero } from "./components/ui/Hero";
import { pageRegistry } from "./pages/pageRegistry";
import "./App.css";

function App() {
	const [activeTab, setActiveTab] = useState(0);
	const [activePage, setActivePage] = useState<string | null>(null);

	const handleSetActiveTab = (idx: number) => {
		setActiveTab(idx);
		setActivePage(null);
	};

	const PageComponent = activePage ? pageRegistry[activePage] : null;

	return (
		<div className="app-container flex flex-col min-h-dvh w-full">
			<TopHeader activeTab={activeTab} setActiveTab={handleSetActiveTab} />
			<Header
				activeTab={activeTab}
				setActiveTab={handleSetActiveTab}
				activePage={activePage}
				setActivePage={setActivePage}
			/>

			{PageComponent ? <PageComponent /> : <Hero />}
		</div>
	);
}

export default App;
