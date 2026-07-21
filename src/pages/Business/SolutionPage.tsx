import { useTranslation } from "react-i18next";

export function SolutionPage() {
	const { t } = useTranslation();

	const pillars = t("presentation.differential.pillars", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.solutions.business.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container max-w-3xl">
					<p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 text-center">
						{t("presentation.solutions.business.subtitle")}
					</p>
					<p className="text-lg text-gray-600 leading-relaxed text-center mb-12">
						{t("presentation.solutions.business.description")}
					</p>
					<div className="grid sm:grid-cols-2 gap-6">
						{pillars.map((pillar, idx) => (
							<div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
								<h3 className="text-lg font-bold text-gray-900 mb-2">
									{pillar.title}
								</h3>
								<p className="text-gray-600 leading-relaxed text-sm">
									{pillar.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
