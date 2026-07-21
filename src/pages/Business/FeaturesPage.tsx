import { useTranslation } from "react-i18next";
import { TrendingDown, Zap, Smile, CheckCircle } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const benefitIcons = [TrendingDown, Zap, Smile];

const extraFeatures = [
	{ icon: CheckCircle, label: "Relatórios automáticos" },
	{ icon: CheckCircle, label: "Gestão de motoristas" },
	{ icon: CheckCircle, label: "Histórico de viagens" },
	{ icon: CheckCircle, label: "Suporte dedicado" },
];

export function FeaturesPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const items = t("presentation.benefits.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("nav.features")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("nav.features")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-16 bg-white">
				<div className="container max-w-5xl">
					<div className="grid md:grid-cols-3 gap-6 mb-16">
						{items.map((item, idx) => {
							const Icon = benefitIcons[idx];
							return (
								<div
									key={idx}
									className={`group bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-500 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 150}ms` }}
								>
									<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
										<Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
									</div>
									<h3 style={{ fontFamily: "var(--font-family-display)" }}
										className="text-xl font-bold text-gray-900 mb-3"
									>
										{item.title}
									</h3>
									<p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
								</div>
							);
						})}
					</div>

					<div className={`max-w-2xl mx-auto transition-all duration-700 delay-300 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="relative">
							<div className="absolute inset-0 flex items-center" aria-hidden="true">
								<div className="w-full border-t border-gray-200" />
							</div>
							<div className="relative flex justify-center mb-8">
								<span className="bg-white px-5 text-xs font-semibold text-primary uppercase tracking-[0.15em]">
									E muito mais
								</span>
							</div>
						</div>
						<div className="grid sm:grid-cols-2 gap-3">
							{extraFeatures.map((f, idx) => (
								<div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-5 py-3.5 border border-gray-200 hover:border-primary/20 transition-colors duration-300">
									<span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
										<f.icon className="w-3.5 h-3.5 text-primary" />
									</span>
									<span className="text-sm font-medium text-gray-700">{f.label}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
