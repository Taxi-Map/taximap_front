import { useTranslation } from "react-i18next";

export function PartnersPage() {
	const { t } = useTranslation();

	const items = t("presentation.partnerships.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("presentation.partnerships.title")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container">
					<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
						{items.map((item, idx) => (
							<div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-200">
								<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-4">
									<span className="text-white font-bold">{idx + 1}</span>
								</div>
								<h3 className="text-lg font-bold text-gray-900 mb-3">
									{item.title}
								</h3>
								<p className="text-gray-600 leading-relaxed text-sm">
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
