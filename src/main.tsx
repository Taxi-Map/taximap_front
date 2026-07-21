import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./i18n";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="/:tabSlug" element={<App />} />
				<Route path="/:tabSlug/:pageSlug" element={<App />} />
				<Route path="*" element={<App />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
