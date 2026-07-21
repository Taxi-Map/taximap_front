import { useTranslation } from "react-i18next";

export function ChallengesPage() {
	const { t } = useTranslation();

	const individualsItems = t("presentation.challenges.individualsItems", {
		returnObjects: true,
	}) as string[];
	const businessesItems = t("presentation.challenges.businessesItems", {
		returnObjects: true,
	}) as string[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.challenges.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container">
					<div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
						<div>
							<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
								<span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
								{t("presentation.challenges.individuals")}
							</h2>
							<ul className="space-y-4">
								{individualsItems.map((item, idx) => (
									<li key={idx} className="flex gap-3 text-gray-600">
										<span className="text-primary shrink-0 mt-1">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
								<span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
								{t("presentation.challenges.businesses")}
							</h2>
							<ul className="space-y-4">
								{businessesItems.map((item, idx) => (
									<li key={idx} className="flex gap-3 text-gray-600">
										<span className="text-primary shrink-0 mt-1">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
					<div className="mt-12 text-center max-w-2xl mx-auto">
						<p className="text-lg font-semibold text-primary">
							{t("presentation.challenges.conclusion")}
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
