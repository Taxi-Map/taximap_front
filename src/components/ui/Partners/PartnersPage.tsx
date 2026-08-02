import { useTranslation } from "react-i18next";
import { Handshake, Code2, Layers, Megaphone, ArrowRight } from "lucide-react";
import { Faq } from "../Faq";

interface PartnersPageProps {
	onOpenWaitlist?: () => void;
}

export function PartnersPage({ onOpenWaitlist }: PartnersPageProps) {
	const { t } = useTranslation();

	return (
		<div className="partners-page flex flex-col w-full">
			{/* Hero Partners */}
			<section id="partners" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-slate-950 text-white flex items-center justify-center">
				<div className="container px-8 text-center max-w-4xl mx-auto flex flex-col items-center gap-8">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6DB7E2]/15 text-[#6DB7E2] text-sm font-bold border border-[#6DB7E2]/30">
						<Handshake size={18} />
						<span>{t("nav.partners", "Rede de Parceiros")}</span>
					</div>

					<h1 className="text-4xl md:text-6xl font-bold leading-tight">
						Cresça Connosco no Ecossistema de Transportes
					</h1>

					<p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">
						Conecte os seus veículos, integre a sua solução de pagamentos ou anuncie a sua marca diretamente a milhares de passageiros que se deslocam diariamente em Angola.
					</p>

					<button
						type="button"
						onClick={onOpenWaitlist}
						className="px-8 py-4 rounded-xl bg-[#6DB7E2] hover:bg-[#5aa6d1] text-white font-bold text-base flex items-center gap-2 shadow-lg shadow-[#6DB7E2]/30 transition-all cursor-pointer mt-4"
					>
						<span>{t("nav.becomePartner", "Tornar-se Parceiro")}</span>
						<ArrowRight size={18} />
					</button>
				</div>
			</section>

			{/* APIs & Integrations */}
			<section id="apis" className="w-full min-h-[calc(100dvh-120px)] py-20 md:py-24 bg-white flex items-center justify-center">
				<div className="container px-8 max-w-5xl mx-auto">
					<div className="w-full text-center mb-16 flex flex-col items-center">
						<h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
							{t("nav.apis", "APIs & Integrações")}
						</h2>
						<p className="text-lg text-slate-600 max-w-2xl">
							Conecte os dados de geolocalização e rotas do Táxi Map aos seus sistemas empresariais.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
							<div className="w-12 h-12 rounded-xl bg-slate-900 text-[#6DB7E2] flex items-center justify-center">
								<Code2 size={24} />
							</div>
							<h3 className="text-2xl font-bold text-slate-900">API de Geolocalização</h3>
							<p className="text-slate-600 text-base leading-relaxed">
								Acesso a streams de dados de posição em tempo real e cálculo de tempos de viagem para plataformas externas.
							</p>
						</div>

						<div id="integrations" className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
							<div className="w-12 h-12 rounded-xl bg-slate-900 text-[#6DB7E2] flex items-center justify-center">
								<Layers size={24} />
							</div>
							<h3 className="text-2xl font-bold text-slate-900">Integração de Pagamentos</h3>
							<p className="text-slate-600 text-base leading-relaxed">
								Integração com carteiras digitais angolanas e sistemas bancários para pagamentos de viagens e subsídios.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Advertising Section */}
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
						onClick={onOpenWaitlist}
						className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base flex items-center gap-2 cursor-pointer shadow-lg"
					>
						<span>Solicitar Media Kit</span>
						<ArrowRight size={18} />
					</button>
				</div>
			</section>

			<Faq />
		</div>
	);
}
