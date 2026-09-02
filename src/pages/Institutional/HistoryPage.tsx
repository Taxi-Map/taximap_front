import { useTranslation } from "react-i18next";
import { History } from "lucide-react";

export function HistoryPage() {
	const { t } = useTranslation();

	return (
		<main className="flex-1 min-h-0 pt-20">
			<section id="history" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-white flex items-center justify-center">
				<div className="container px-8 max-w-5xl mx-auto">
					<div className="w-full text-center mb-16 flex flex-col items-center">
						<div className="w-14 h-14 rounded-2xl bg-[#6DB7E2]/15 text-[#6DB7E2] flex items-center justify-center mb-4">
							<History size={28} />
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							{t("nav.history", "Nossa História")}
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl">
							Construído por angolanos para resolver os desafios diários da deslocação urbana na capital.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
							<span className="text-3xl font-extrabold text-[#6DB7E2]">2024</span>
							<h3 className="text-xl font-bold text-slate-900">O Início da Ideia</h3>
							<p className="text-slate-600 text-sm leading-relaxed">
								Mapeamento inicial dos nós de trânsito e principais rotas dos candongueiros em Luanda.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
							<span className="text-3xl font-extrabold text-[#6DB7E2]">2025</span>
							<h3 className="text-xl font-bold text-slate-900">Desenvolvimento Beta</h3>
							<p className="text-slate-600 text-sm leading-relaxed">
								Criada a plataforma colaborativa de alertas e acompanhamento via GPS em tempo real.
							</p>
						</div>

						<div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
							<span className="text-3xl font-extrabold text-[#6DB7E2]">2026</span>
							<h3 className="text-xl font-bold text-slate-900">Lançamento & Expansão</h3>
							<p className="text-slate-600 text-sm leading-relaxed">
								Expansão para frotas corporativas, parceiros institucionais e cobertura nacional.
							</p>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
