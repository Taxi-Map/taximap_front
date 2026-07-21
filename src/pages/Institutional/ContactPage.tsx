import { useTranslation } from "react-i18next";
import { Mail, Globe, Phone, ArrowUpRight } from "lucide-react";
import { useInView } from "../../hooks/useInView";

export function ContactPage() {
	const { t } = useTranslation();
	const { ref, isInView } = useInView();

	return (
		<main className="flex-1 min-h-0">
			<section ref={ref} className="relative overflow-hidden min-h-[70vh] flex items-center bg-gray-50">
				<div className="absolute inset-0 opacity-[0.04]"
					style={{
						backgroundImage:
							"linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>
				<svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
					<path d="M0,200 Q200,100 400,250 T800,150" stroke="var(--color-primary)" strokeWidth="1" fill="none" strokeOpacity="0.15"
						className={isInView ? "animate-draw-path" : ""} />
					<path d="M0,350 Q300,450 600,300" stroke="var(--color-primary)" strokeWidth="1" fill="none" strokeOpacity="0.1"
						className={isInView ? "animate-draw-path" : ""} style={{ animationDelay: "0.8s" }} />
				</svg>
				<div className="container relative py-20">
					<div className={`max-w-lg mx-auto text-center transition-all duration-700 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}>
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
							<svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
							</svg>
						</div>
						<h1 style={{ fontFamily: "var(--font-family-display)" }}
							className="text-4xl md:text-5xl font-bold text-gray-900 mb-10 leading-tight"
						>
							{t("presentation.closing.title")}
						</h1>
						<div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
							<a
								href="https://taximap.ao"
								target="_blank"
								rel="noopener noreferrer"
								className="w-full group inline-flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-primary/30 text-gray-900 px-6 py-4 rounded-xl font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
							>
								<Globe className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
								{t("presentation.closing.website")}
								<ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
							</a>
							<a
								href="mailto:geral.taximap@gmail.com"
								className="w-full group inline-flex items-center justify-center gap-3 bg-primary text-white px-6 py-4 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
							>
								<Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
								{t("presentation.closing.email")}
								<ArrowUpRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
							</a>
						</div>
						<p className="mt-10 text-gray-400 text-sm flex items-center justify-center gap-2">
							<Phone className="w-4 h-4 text-primary" />
							<span className="text-gray-600 font-medium">{t("presentation.cover.phone")}</span>
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}
