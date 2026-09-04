import { useTranslation } from "react-i18next";
import { TrendingDown, Zap, Smile } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const benefitIcons = [TrendingDown, Zap, Smile];

const benefitColors = [
	"from-primary to-primary-dark",
	"from-primary-light to-primary",
	"from-primary to-primary-light",
];

export function BenefitsPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	// Uma chave em falta faz o i18next devolver a própria chave (string). A guarda
	// abaixo degrada a secção para vazia em vez de rebentar o .map() e a página.
	const rawItems = t("presentation.benefits.items", { returnObjects: true });
	const items = Array.isArray(rawItems)
		? (rawItems as { title: string; description: string }[])
		: [];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.benefits.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.benefits.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-5xl">
					<div className="grid md:grid-cols-3 gap-6">
						{items.map((item, idx) => {
							const Icon = benefitIcons[idx];
							const isFirst = idx === 0;
							return (
								<div
									key={idx}
									className={`group relative transition-all duration-700 ${
										isFirst ? "md:col-span-2 md:row-span-1" : ""
									} ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 150}ms` }}
								>
									<div className={`relative h-full bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 ${isFirst ? "" : ""}`}>
										{isFirst && (
											<div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
										)}
										<div className="relative">
											<div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefitColors[idx]} flex items-center justify-center mb-6 shadow-lg shadow-primary/15 group-hover:scale-110 transition-transform duration-300`}>
												<Icon className="w-7 h-7 text-white" />
											</div>
											<h3 style={{ fontFamily: "var(--font-family-display)" }}
												className={`font-bold text-gray-900 mb-3 ${isFirst ? "text-2xl" : "text-xl"}`}
											>
												{item.title}
											</h3>
											<p className="text-gray-600 leading-relaxed">
												{item.description}
											</p>
										</div>
										<div className="absolute bottom-4 right-4 text-7xl font-bold text-gray-100 select-none leading-none">
											0{idx + 1}
										</div>
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
