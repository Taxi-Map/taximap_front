import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Code2, Plug, Wifi, BookOpen, ArrowRight, Check } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const endpoints = [
	{ method: "GET", path: "/api/v1/taxis" },
	{ method: "GET", path: "/api/v1/routes" },
	{ method: "POST", path: "/api/v1/bookings" },
];

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<button
			onClick={handleCopy}
			className="ml-auto text-xs font-medium text-gray-400 hover:text-white transition-colors shrink-0"
			aria-label={copied ? "Copiado" : "Copiar"}
		>
			{copied ? (
				<span className="flex items-center gap-1 text-green-400">
					<Check className="w-3 h-3" /> Copiado
				</span>
			) : (
				"Copiar"
			)}
		</button>
	);
}

export function IntegrationsPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	const items = t("presentation.businessModel.items", {
		returnObjects: true,
	}) as { title: string; description: string }[];

	return (
		<main className="flex-1 min-h-0">
			<section className="relative overflow-hidden py-24 md:py-32 bg-white">
				<div className="container">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
							<Code2 className="w-6 h-6 text-primary" />
						</div>
						<div>
							<span className="text-xs font-semibold text-primary uppercase tracking-[0.2em] block mb-2">
								{t("nav.apis")} & {t("nav.integrations")}
							</span>
							<h1 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-4xl md:text-5xl font-bold text-gray-900 leading-[1.1]"
							>
								{t("nav.apis")} & {t("nav.integrations")}
							</h1>
						</div>
					</div>
				</div>
			</section>

			<section ref={ref} className="pb-24 md:pb-32 bg-white">
				<div className="container max-w-4xl">
					<div className={`text-center mb-16 transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
							{items?.[2]?.description ?? "Disponibilização de interfaces para que parceiros integrem os serviços do Táxi Map."}
						</p>
					</div>
					<div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
						<div className="group bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-500">
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
								<Code2 className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
							</div>
							<h3 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-lg font-bold text-gray-900 mb-2"
							>
								API RESTful
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed mb-5">
								Integração directa com a plataforma Táxi Map via API REST. Documentação completa e exemplos de código.
							</p>
							<div className="bg-gray-900 rounded-xl p-4 font-mono text-xs space-y-2" style={{ fontFamily: "var(--font-family-mono)" }}>
								{endpoints.map((ep, i) => (
									<div key={i} className="flex items-center gap-3 group/code">
										<span className="text-green-400 font-semibold shrink-0">{ep.method}</span>
										<span className="text-gray-300">{ep.path}</span>
										<CopyButton text={`${ep.method} ${ep.path}`} />
									</div>
								))}
							</div>
						</div>
						<div className="group bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-500">
							<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
								<Plug className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
							</div>
							<h3 style={{ fontFamily: "var(--font-family-display)" }}
								className="text-lg font-bold text-gray-900 mb-2"
							>
								Integrações
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed mb-6">
								Conecte o Táxi Map aos seus sistemas existentes. Suporte para webhooks e integração contínua.
							</p>
							<div className="flex flex-wrap gap-2">
								<span className="inline-flex items-center gap-1.5 bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:border-primary/20 transition-colors">
									<Wifi className="w-4 h-4 text-primary" /> Webhooks
								</span>
								<span className="inline-flex items-center gap-1.5 bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm hover:border-primary/20 transition-colors">
									<BookOpen className="w-4 h-4 text-primary" /> Docs
								</span>
							</div>
						</div>
					</div>
					<div className={`text-center mt-12 transition-all duration-700 delay-300 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<span className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all cursor-default">
							Explorar documentação <ArrowRight className="w-4 h-4" />
						</span>
					</div>
				</div>
			</section>
		</main>
	);
}
