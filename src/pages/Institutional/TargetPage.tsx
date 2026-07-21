import { useTranslation } from "react-i18next";
import { Building2, Landmark, Briefcase } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const targetConfig = [
	{ color: "from-primary to-primary-dark", icon: Building2, label: "Operadores" },
	{ color: "from-primary-dark to-primary", icon: Landmark, label: "Entidades" },
	{ color: "from-primary-light to-primary", icon: Briefcase, label: "Corporativo" },
];

export function TargetPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const items = t("presentation.target.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="max-w-2xl">
						<span className="inline-block text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-5">
							{t("presentation.target.title")}
						</span>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
						>
							{t("presentation.target.title")}
						</h1>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-5xl">
					<div className="grid md:grid-cols-3 gap-6">
						{items.map((item, idx) => {
							const { color, icon: Icon, label } = targetConfig[idx];
							const delay = idx * 150;
							return (
								<div
									key={idx}
									className={`group relative bg-white rounded-2xl border border-gray-200 hover:border-primary/20 transition-all duration-500 overflow-hidden ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${delay}ms` }}
								>
									<div className={`h-2 bg-gradient-to-r ${color}`} />
									<div className="p-8">
										<div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
											<Icon className="w-7 h-7 text-white" />
										</div>
										<span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
											{label}
										</span>
										<h3 style={{ fontFamily: "var(--font-family-display)" }}
											className="text-xl font-bold text-gray-900 mb-3"
										>
											{item.title}
										</h3>
										<p className="text-gray-600 leading-relaxed text-sm">
											{item.description}
										</p>
									</div>
									<div className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.03]"
										style={{
											backgroundImage: "radial-gradient(circle at 100% 100%, var(--color-primary) 2px, transparent 2px)",
											backgroundSize: "10px 10px",
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
}
