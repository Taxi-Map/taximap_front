import { useTranslation } from "react-i18next";

export function ImpactPage() {
	const { t } = useTranslation();

	const items = t("presentation.impact.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.impact.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container">
					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{items.map((item, idx) => (
							<div key={idx} className="relative pl-8 border-l-4 border-primary">
								<h3 className="text-lg font-bold text-gray-900 mb-2">
									{item.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
