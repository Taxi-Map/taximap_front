import { useTranslation } from "react-i18next";
import { Building2, Cog, Shield, Code2, Monitor, ArrowUpRight, BrainCircuit } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const pillarIcons = [Code2, Monitor, ArrowUpRight, BrainCircuit];

export function SolutionPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const pillars = t("presentation.differential.pillars", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
							<Building2 className="w-6 h-6 text-primary" />
						</div>
						<div>
							<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] block mb-2">
								{t("presentation.solutions.business.title")}
							</span>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
							>
								{t("presentation.solutions.business.title")}
							</h1>
							<p className="text-lg text-gray-600 mt-4 max-w-xl">
								{t("presentation.solutions.business.subtitle")}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="pb-16 bg-white">
				<div className="container max-w-4xl">
					<div className="grid md:grid-cols-2 gap-6">
						<div className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500">
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
								<Cog className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
							</div>
							<h3 style={{ fontFamily: "var(--font-family-display)" }} className="text-xl font-bold text-gray-900 mb-3">
								Gestão de Frota
							</h3>
							<p className="text-gray-600 leading-relaxed text-sm">
								{t("presentation.solutions.business.description")}
							</p>
						</div>
						<div className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500">
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
								<Shield className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
							</div>
							<h3 style={{ fontFamily: "var(--font-family-display)" }} className="text-xl font-bold text-gray-900 mb-3">
								Monitorização
							</h3>
							<p className="text-gray-600 leading-relaxed text-sm">
								Acompanhe a operação em tempo real com relatórios e indicadores de desempenho.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-4xl">
					<div className={`text-center mb-12 transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">
							{t("presentation.differential.pillarsLabel")}
						</span>
					</div>
					<div className="grid sm:grid-cols-2 gap-5">
						{pillars.map((pillar, idx) => {
							const Icon = pillarIcons[idx];
							return (
								<div
									key={idx}
									className={`group bg-white rounded-2xl p-7 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 120}ms` }}
								>
									<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
										<Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
									</div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">{pillar.title}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">{pillar.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
}
