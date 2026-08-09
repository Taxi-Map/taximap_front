import { useTranslation } from "react-i18next";
import { Newspaper } from "lucide-react";

export function NewsPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 pt-20">
			<section id="news" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-white flex items-center justify-center">
				<div className="container px-8 max-w-5xl mx-auto">
					<div className="w-full text-center mb-16 flex flex-col items-center">
						<div className="w-14 h-14 rounded-2xl bg-[#6DB7E2]/15 text-[#6DB7E2] flex items-center justify-center mb-4">
							<Newspaper size={28} />
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							{t("nav.news", "Notícias")}
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl">
							Acompanhe as últimas novidades, atualizações e comunicados oficiais do Táxi Map.
						</p>
					</div>

					<div className="flex justify-center items-center h-64 bg-slate-50 rounded-2xl border border-slate-200">
                        <p className="text-slate-500 font-medium">Em breve, novas publicações serão adicionadas aqui.</p>
					</div>
				</div>
			</section>
		</main>
	);
}
