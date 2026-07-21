import { useTranslation } from "react-i18next";

export function AppPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.solutions.passenger.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container max-w-3xl text-center">
					<p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
						{t("presentation.solutions.passenger.subtitle")}
					</p>
					<p className="text-xl text-gray-600 leading-relaxed">
						{t("presentation.solutions.passenger.description")}
					</p>
				</div>
			</section>
		</main>
	);
}
