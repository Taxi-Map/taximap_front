import { useTranslation } from "react-i18next";
import { Search, Route, Car } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const steps = [
	{
		icon: Search,
		title: "Pesquise o destino",
		desc: "Indique para onde quer ir e encontre as melhores rotas disponíveis com informações claras sobre percursos e pontos de embarque.",
	},
	{
		icon: Route,
		title: "Escolha a rota",
		desc: "Selecione o percurso ideal com base nas opções apresentadas. Saiba quais táxis passam pelo seu local com total confiança.",
	},
	{
		icon: Car,
		title: "Viaje com confiança",
		desc: "Acompanhe a viagem em tempo real com navegação integrada. Chegue ao seu destino sem depender de terceiros.",
	},
];

export function HowItWorksPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("nav.howItWorks")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("nav.howItWorks")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-3xl">
					<div className={`text-center mb-16 transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
							{t("presentation.solutions.passenger.description")}
						</p>
					</div>
					<div className="relative">
						<div className="absolute left-[27px] md:left-[35px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
						<div className="space-y-0">
							{steps.map((step, idx) => {
								const Icon = step.icon;
								const isLast = idx === steps.length - 1;
								return (
									<div
										key={idx}
										className={`relative flex gap-6 md:gap-10 pb-14 md:pb-16 group transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
										style={{ animationDelay: `${idx * 200}ms` }}
									>
										<div className="flex flex-col items-center shrink-0">
											<div className="w-14 h-14 md:w-[70px] md:h-[70px] bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 z-10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
												<Icon className="w-7 h-7 md:w-8 h-8 text-white" />
											</div>
											{!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-2" />}
										</div>
										<div className="pt-3 md:pt-4">
											<div className="flex items-center gap-3 mb-3">
												<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold group-hover:bg-primary group-hover:text-white transition-all duration-300">
													{idx + 1}
												</span>
												<span className="text-xs font-bold text-primary uppercase tracking-wider">
													Passo 0{idx + 1}
												</span>
											</div>
											<h3 style={{ fontFamily: "var(--font-family-display)" }}
												className="text-xl md:text-2xl font-bold text-gray-900 mb-3"
											>
												{step.title}
											</h3>
											<p className="text-gray-600 leading-relaxed max-w-md">
												{step.desc}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
