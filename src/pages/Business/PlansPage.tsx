import { useTranslation } from "react-i18next";
import { Package, Award, HeartHandshake, Check, ArrowRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const planIcons = [Package, Award, HeartHandshake];

export function PlansPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const items = t("presentation.businessModel.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.businessModel.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.businessModel.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-5xl">
					<div className="grid md:grid-cols-3 gap-6">
						{items.map((item, idx) => {
							const Icon = planIcons[idx];
							const isHighlighted = idx === 0;
							return (
								<div
									key={idx}
									className={`group relative rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-1 ${
										isHighlighted
											? "bg-white border-primary/30 shadow-lg shadow-primary/10"
											: "bg-white border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/20"
									} ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 150}ms` }}
								>
									{isHighlighted && (
										<div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
											<span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-primary/20">
												Recomendado
											</span>
										</div>
									)}
									<div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
										isHighlighted ? "bg-primary shadow-md shadow-primary/20" : "bg-primary/10"
									}`}>
										<Icon className={`w-7 h-7 ${isHighlighted ? "text-white" : "text-primary transition-colors group-hover:text-white group-hover:bg-primary"}`} />
									</div>
									<h3 style={{ fontFamily: "var(--font-family-display)" }}
										className="text-xl font-bold text-gray-900 mb-3"
									>
										{item.title}
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed mb-8">
										{item.description}
									</p>
									<div className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300 cursor-default">
										<Check className="w-4 h-4" />
										<span>Saiba mais</span>
										<ArrowRight className="w-3.5 h-3.5" />
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
