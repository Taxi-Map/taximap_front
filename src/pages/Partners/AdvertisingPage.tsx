import { useTranslation } from "react-i18next";
import { Megaphone, ArrowRight } from "lucide-react";

export function AdvertisingPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 pt-20">
			<section id="advertising" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-slate-50 flex items-center justify-center">
				<div className="container px-8 text-center max-w-4xl mx-auto flex flex-col items-center">
					<div className="w-14 h-14 rounded-2xl bg-[#6DB7E2]/15 text-[#6DB7E2] flex items-center justify-center mb-4">
						<Megaphone size={28} />
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
						{t("nav.advertising", "Publicidade & Parcerias de Marca")}
					</h2>
					<p className="text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
						Chegue aos consumidores no momento exato em que estão a planear a sua rota diária. Formatos de anúncios geolocalizados nas paragens e rotas estratégicas.
					</p>

					<button
						type="button"
						className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base flex items-center gap-2 cursor-pointer shadow-lg"
					>
						<span>Solicitar Media Kit</span>
						<ArrowRight size={18} />
					</button>
				</div>
			</section>
		</main>
	);
}
