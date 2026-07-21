import { useTranslation } from "react-i18next";

export function BenefitsPage() {
	const { t } = useTranslation();

	const items = t("presentation.benefits.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.benefits.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container">
					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{items.map((item, idx) => (
							<div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
								<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-primary font-bold text-lg">{idx + 1}</span>
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
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
