import { useTranslation } from "react-i18next";

export function HowItWorksPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("nav.howItWorks")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container max-w-3xl">
					<p className="text-lg text-gray-600 leading-relaxed mb-8">
						{t("presentation.solutions.passenger.description")}
					</p>
					<div className="grid gap-6">
						<div className="flex gap-4 items-start bg-gray-50 rounded-xl p-6 border border-gray-200">
							<span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm">1</span>
							<div>
								<h3 className="font-semibold text-gray-900 mb-1">
									{t("presentation.challenges.individualsItems", { returnObjects: true })?.[0] ?? "Encontrar rota"}
								</h3>
								<p className="text-sm text-gray-600">Identifique a rota correta para chegar ao seu destino.</p>
							</div>
						</div>
						<div className="flex gap-4 items-start bg-gray-50 rounded-xl p-6 border border-gray-200">
							<span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm">2</span>
							<div>
								<h3 className="font-semibold text-gray-900 mb-1">Informação clara</h3>
								<p className="text-sm text-gray-600">Obtenha informação sobre percursos e pontos de embarque.</p>
							</div>
						</div>
						<div className="flex gap-4 items-start bg-gray-50 rounded-xl p-6 border border-gray-200">
							<span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0 text-sm">3</span>
							<div>
								<h3 className="font-semibold text-gray-900 mb-1">Navegação simples</h3>
								<p className="text-sm text-gray-600">Saiba quais táxis passam por determinado local com confiança.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
