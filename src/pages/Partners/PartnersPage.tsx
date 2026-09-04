import { useTranslation } from "react-i18next";
import { Handshake, Building2, Landmark, ArrowRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const partnerIcons = [Handshake, Building2, Landmark];
const partnerColors = [
	"from-primary to-primary-dark",
	"from-primary-dark to-primary",
	"from-primary-light to-primary",
];

export function PartnersPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	// Uma chave em falta faz o i18next devolver a própria chave (string). A guarda
	// abaixo degrada a secção para vazia em vez de rebentar o .map() e a página.
	const rawItems = t("presentation.partnerships.items", { returnObjects: true });
	const items = Array.isArray(rawItems)
		? (rawItems as { title: string; description: string }[])
		: [];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
							<Handshake className="w-6 h-6 text-primary" />
						</div>
						<div>
							<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] block mb-2">
								{t("presentation.partnerships.title")}
							</span>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
							>
								{t("presentation.partnerships.title")}
							</h1>
						</div>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-5xl">
					<div className="grid md:grid-cols-3 gap-6">
						{items.map((item, idx) => {
							const Icon = partnerIcons[idx];
							return (
								<div
									key={idx}
									className={`group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 150}ms` }}
								>
									<div className={`h-2 bg-gradient-to-r ${partnerColors[idx]}`} />
									<div className="p-8 relative">
										<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors duration-500" />
										<div className="relative">
											<div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-dark group-hover:scale-110 transition-all duration-300">
												<Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
											</div>
											<h3 style={{ fontFamily: "var(--font-family-display)" }}
												className="text-xl font-bold text-gray-900 mb-3"
											>
												{item.title}
											</h3>
											<p className="text-gray-600 text-sm leading-relaxed mb-6">
												{item.description}
											</p>
											<span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all duration-300 cursor-default">
												Saber mais <ArrowRight className="w-4 h-4" />
											</span>
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
