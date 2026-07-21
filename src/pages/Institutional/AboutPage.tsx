import { useTranslation } from "react-i18next";

export function AboutPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-24">
				<div className="container text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
						{t("presentation.cover.title")}
					</h1>
					<p className="text-2xl font-semibold mb-8 text-white/90">
						{t("presentation.cover.subtitle")}
					</p>
					<div className="flex flex-col md:flex-row justify-center gap-6 text-sm text-white/80">
						<span>{t("presentation.cover.website")}</span>
						<span>{t("presentation.cover.email")}</span>
						<span>{t("presentation.cover.phone")}</span>
					</div>
				</div>
			</section>

			<section className="py-16 bg-white">
				<div className="container max-w-3xl">
					<h2 className="text-3xl font-bold mb-6">
						{t("presentation.about.title")}
					</h2>
					<p className="text-lg text-gray-600 mb-8 leading-relaxed">
						{t("presentation.about.description")}
					</p>
					<div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
						<h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
							{t("presentation.about.missionLabel")}
						</h3>
						<p className="text-xl font-semibold text-gray-900 leading-relaxed">
							{t("presentation.about.mission")}
						</p>
					</div>
					<p className="text-base text-gray-500 mt-8 italic">
						{t("presentation.about.footer")}
					</p>
				</div>
			</section>

			<section className="py-16 bg-gray-50">
				<div className="container max-w-3xl text-center">
					<h2 className="text-3xl font-bold mb-6">
						{t("presentation.vision.title")}
					</h2>
					<p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
						{t("presentation.vision.description")}
					</p>
				</div>
			</section>
		</main>
	);
}
