import { useTranslation } from "react-i18next";
import { Building, History, Heart, ArrowRight } from "lucide-react";
import { Faq } from "../Faq";

interface InstitutionalPageProps {
	onOpenWaitlist?: () => void;
}

export function InstitutionalPage({ onOpenWaitlist }: InstitutionalPageProps) {
	const { t } = useTranslation();

	return (
		<div className="institutional-page flex flex-col w-full">
			{/* Hero / About */}
			<section id="about" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-slate-900 text-white flex items-center justify-center">
				<div className="container px-8 text-center max-w-4xl mx-auto flex flex-col items-center gap-8">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6DB7E2]/15 text-[#6DB7E2] text-sm font-bold border border-[#6DB7E2]/30">
						<Building size={18} />
						<span>{t("nav.about", "Quem Somos")}</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-bold leading-tight">
						Reinventar a Mobilidade Urbana em Angola
					</h1>

					<p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
						O Táxi Map nasceu com a missão de digitalizar, organizar e tornar mais previsível o transporte rodoviário em Luanda e em todo o país, aproximando passageiros, motoristas e instituições.
					</p>

					<button
						type="button"
						onClick={onOpenWaitlist}
						className="px-8 py-4 rounded-xl bg-[#6DB7E2] hover:bg-[#5aa6d1] text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-[#6DB7E2]/30 transition-all cursor-pointer mt-4"
					>
						<span>{t("nav.contact", "Entrar em Contacto")}</span>
						<ArrowRight size={18} />
					</button>
				</div>
			</section>

			{/* History Section */}
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

			{/* Impact Section */}
			<section id="impact" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-slate-50 flex items-center justify-center">
				<div className="container px-8 text-center max-w-5xl mx-auto flex flex-col items-center">
					<div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center mb-4">
						<Heart size={28} />
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
						{t("nav.impact", "O Nosso Impacto")}
					</h2>
					<p className="text-lg text-slate-600 max-w-2xl mb-12">
						Reduzir o tempo de espera nas paragens e impulsionar a eficiência do transporte público em Angola.
					</p>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
						<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center gap-2">
							<span className="text-4xl font-extrabold text-slate-900">-30%</span>
							<span className="text-slate-600 text-sm font-medium">Tempo Médio de Espera</span>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center gap-2">
							<span className="text-4xl font-extrabold text-[#6DB7E2]">+10k</span>
							<span className="text-slate-600 text-sm font-medium">Alertas Validados / Mês</span>
						</div>

						<div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center gap-2">
							<span className="text-4xl font-extrabold text-slate-900">100%</span>
							<span className="text-slate-600 text-sm font-medium">Foco no Cidadão Angolano</span>
						</div>
					</div>
				</div>
			</section>

			<Faq />
		</div>
	);
}
