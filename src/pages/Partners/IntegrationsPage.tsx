import { useTranslation } from "react-i18next";

export function IntegrationsPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-16">
				<div className="container text-center">
					<h1 className="text-3xl md:text-4xl font-bold text-white">
						{t("nav.apis")}
					</h1>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container max-w-3xl">
					<p className="text-lg text-gray-600 leading-relaxed text-center mb-12">
						{t("presentation.businessModel.items", { returnObjects: true })?.[2] 
							? (t("presentation.businessModel.items", { returnObjects: true }) as { title: string; description: string }[])[2].description 
							: "Disponibilização de interfaces para que parceiros integrem os serviços do Táxi Map."}
					</p>
					<div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
						<div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
							<h3 className="font-bold text-gray-900 mb-2">
								{t("nav.apis")}
							</h3>
							<p className="text-sm text-gray-600">APIs RESTful para integração dos serviços do Táxi Map.</p>
						</div>
						<div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
							<h3 className="font-bold text-gray-900 mb-2">
								{t("nav.integrations")}
							</h3>
							<p className="text-sm text-gray-600">Integração completa com sistemas de terceiros.</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
