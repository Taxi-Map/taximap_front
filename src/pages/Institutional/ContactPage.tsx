import { useTranslation } from "react-i18next";

export function ContactPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0">
			<section className="bg-primary text-white py-24">
				<div className="container text-center">
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
						{t("presentation.closing.title")}
					</h1>
					<div className="flex flex-col items-center gap-4 text-white/90">
						<a href="https://taximap.ao" className="text-lg hover:text-white transition-colors">
							{t("presentation.closing.website")}
						</a>
						<a href="mailto:geral.taximap@gmail.com" className="text-lg hover:text-white transition-colors">
							{t("presentation.closing.email")}
						</a>
					</div>
				</div>
			</section>
		</main>
	);
}
