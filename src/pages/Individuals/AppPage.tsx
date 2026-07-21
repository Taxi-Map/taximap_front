import { useTranslation } from "react-i18next";
import { Smartphone, Navigation, Search, MapPin, Route, Shield } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const features = [
	{ icon: Search, key: "feature1", title: "Busca rápida", desc: "Encontre rotas e táxis em segundos com busca inteligente." },
	{ icon: Route, key: "feature2", title: "Rotas optimizadas", desc: "Visualize o percurso ideal com informações de trânsito em tempo real." },
	{ icon: MapPin, key: "feature3", title: "Pontos de embarque", desc: "Saiba exactamente onde o táxi vai passar e onde embarcar." },
	{ icon: Navigation, key: "feature4", title: "Navegação", desc: "Siga o percurso com navegação integrada sem sair do app." },
	{ icon: Shield, key: "feature5", title: "Segurança", desc: "Viagens monitorizadas com partilha de rota em tempo real." },
	{ icon: Smartphone, key: "feature6", title: "Multi-plataforma", desc: "Disponível em dispositivos móveis e web." },
];

const featureGradients = [
	"from-primary/20 to-primary/5",
	"from-primary-light/20 to-primary/5",
	"from-primary/20 to-primary-dark/10",
	"from-primary-light/15 to-primary-dark/5",
	"from-primary/15 to-primary-light/5",
	"from-primary-dark/15 to-primary/5",
];

export function AppPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
							<Smartphone className="w-6 h-6 text-primary" />
						</div>
						<div>
							<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] block mb-2">
								{t("presentation.solutions.passenger.title")}
							</span>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
							>
								{t("presentation.solutions.passenger.title")}
							</h1>
							<p className="text-lg text-gray-600 mt-4 max-w-xl">
								{t("presentation.solutions.passenger.subtitle")}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-gray-50">
				<div className="container max-w-5xl">
					<div className={`text-center mb-14 transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
							{t("presentation.solutions.passenger.description")}
						</p>
					</div>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
						{features.map((f, idx) => {
							const Icon = f.icon;
							return (
								<div
									key={idx}
									className={`group relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-500 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
									style={{ animationDelay: `${idx * 100}ms` }}
								>
									<div className={`absolute inset-0 bg-gradient-to-br ${featureGradients[idx]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
									<div className="relative">
										<div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
											<Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-300" />
										</div>
										<h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
										<p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
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
