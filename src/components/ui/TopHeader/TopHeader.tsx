import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./TopHeader.css";
import topHeaderContent from "../../../content/TopHeader.json";
import languagesConfig from "../../../content/languages.json";

interface TopHeaderProps {
	activeTab: number;
	setActiveTab: (idx: number) => void;
}

export function TopHeader({ activeTab, setActiveTab }: TopHeaderProps) {
	const { t, i18n } = useTranslation();
	const [isLangOpen, setIsLangOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		setIsLangOpen(false);
	};

	// Handle click outside to close
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsLangOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const languages = languagesConfig;
	const leftLinks = topHeaderContent.leftLinks;
	const rightLinks = topHeaderContent.rightLinks;

	const currentLang =
		languages.find((l) => l.code === i18n.language) || languages[0];

	return (
		<div className="top-header bg-primary relative z-50 hidden md:block">
			<div className="container flex justify-between items-center top-header-inner">
				<div className="flex top-links">
					{leftLinks.map((link, idx) => (
						<button
							key={idx}
							onClick={() => setActiveTab(idx)}
							className={activeTab === idx ? "active" : ""}
						>
							{t(link.labelKey, link.fallback)}
						</button>
					))}
				</div>
				<div className="flex items-center gap-6 top-links-right">
					{rightLinks.map((link, idx) => (
						<a key={idx} href={link.url}>
							{t(link.labelKey, link.fallback)}
						</a>
					))}
					<span className="separator">|</span>

					{/* Language Selector Dropdown */}
					<div
						className="relative h-full flex items-center"
						ref={dropdownRef}
					>
						<button
							onClick={() => setIsLangOpen(!isLangOpen)}
							className="font-bold hover:text-white transition-colors cursor-pointer flex items-center gap-1 h-full"
							aria-haspopup="true"
							aria-expanded={isLangOpen}
						>
							{currentLang.code.toUpperCase()}
							<svg
								className={`w-4 h-4 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>

						{isLangOpen && (
							<div className="absolute left-0 top-full mt-0 min-w-20 bg-white shadow-md border border-gray-100 animate-in fade-in">
								<div className="py-2">
									{languages.map((lang) => (
										<button
											key={lang.code}
											onClick={() =>
												changeLanguage(lang.code)
											}
											className={`w-full text-left px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors
                        ${i18n.language === lang.code ? "text-black font-bold" : "text-gray-800"}`}
										>
											{lang.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
