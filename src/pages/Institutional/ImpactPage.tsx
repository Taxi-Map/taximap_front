import { useTranslation } from "react-i18next";
import { RefreshCw, Navigation, Rocket } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const impactIcons = [RefreshCw, Navigation, Rocket];

export function ImpactPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	// Uma chave em falta faz o i18next devolver a própria chave (string). A guarda
	// abaixo degrada a secção para vazia em vez de rebentar o .map() e a página.
	const rawItems = t("presentation.impact.items", { returnObjects: true });
	const items = Array.isArray(rawItems)
		? (rawItems as { title: string; description: string }[])
		: [];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.impact.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.impact.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-3xl">
					<div className="relative">
						<div className="absolute left-[23px] md:left-[31px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-transparent" />
						<div className="space-y-16 md:space-y-20">
							{items.map((item, idx) => {
								const Icon = impactIcons[idx];
								const isLast = idx === items.length - 1;
								return (
									<div
										key={idx}
										className={`relative flex gap-6 md:gap-10 group transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
										style={{ animationDelay: `${idx * 200}ms` }}
									>
										<div className="flex flex-col items-center shrink-0">
											<div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 z-10 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300">
												<Icon className="w-6 h-6 md:w-8 h-8 text-white" />
											</div>
											{!isLast && (
												<div className="w-0.5 flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-2" />
											)}
										</div>
										<div className="pt-2 md:pt-4 pb-2">
											<span className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-3">
												<span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
												Impacto 0{idx + 1}
											</span>
											<h3 style={{ fontFamily: "var(--font-family-display)" }}
												className="text-xl md:text-2xl font-bold text-gray-900 mb-3"
											>
												{item.title}
											</h3>
											<p className="text-gray-600 leading-relaxed max-w-lg">
												{item.description}
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
