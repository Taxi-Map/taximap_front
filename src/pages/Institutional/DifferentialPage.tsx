import { useTranslation } from "react-i18next";
import { Code2, Monitor, ArrowUpRight, BrainCircuit } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const pillarIcons = [Code2, Monitor, ArrowUpRight, BrainCircuit];

const pillarGradients = [
	"from-primary/20 to-primary/5",
	"from-primary-light/20 to-primary/5",
	"from-primary/20 to-primary-dark/10",
	"from-primary-light/15 to-primary-dark/5",
];

export function DifferentialPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const pillars = t("presentation.differential.pillars", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.differential.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.differential.title")}
						</h1>
						<p className="text-lg text-gray-600 leading-relaxed mt-6 max-w-xl">
							{t("presentation.differential.description")}
						</p>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-4xl">
					<div className="grid sm:grid-cols-2 gap-5 relative">
						<svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
							<path d="M50%,0 L50%,100%" stroke="var(--color-primary)" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="6 4" />
						</svg>
						{pillars.map((pillar, idx) => {
							const Icon = pillarIcons[idx];
							return (
								<div
									key={idx}
									className={`group relative overflow-hidden bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 120}ms` }}
								>
									<div className={`absolute inset-0 bg-gradient-to-br ${pillarGradients[idx]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
									<div className="relative">
										<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
											<Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
										</div>
										<span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-400 text-xs font-bold mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
											{idx + 1}
										</span>
										<h3 style={{ fontFamily: "var(--font-family-display)" }}
											className="text-xl font-bold text-gray-900 mb-2"
										>
											{pillar.title}
										</h3>
										<p className="text-gray-600 leading-relaxed text-sm">
											{pillar.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
}
