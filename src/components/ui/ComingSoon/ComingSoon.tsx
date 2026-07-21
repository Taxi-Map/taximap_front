import { useTranslation } from "react-i18next";

export function ComingSoon() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 flex items-center justify-center bg-gray-50">
			<div className="text-center px-6 py-24">
				<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h1 style={{ fontFamily: "var(--font-family-display)" }}
					className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
				>
					{t("comingSoon.title")}
				</h1>
				<p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
					{t("comingSoon.description")}
				</p>
			</div>
		</main>
	);
}
